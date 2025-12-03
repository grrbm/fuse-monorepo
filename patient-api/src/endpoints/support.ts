import { Express, Request, Response } from 'express';
import SupportTicketService from '../services/supportTicket.service';
import { TicketStatus, TicketPriority, TicketCategory } from '../models/SupportTicket';
import { MessageSender } from '../models/TicketMessage';
import wsService from '../services/websocket.service';

export function registerSupportEndpoints(app: Express, authenticateJWT: any, getCurrentUser: any) {
  const ticketService = new SupportTicketService();

  /**
   * Create a new support ticket
   * POST /support/tickets
   */
  app.post('/support/tickets', authenticateJWT, async (req: any, res: Response) => {
    try {
      const currentUser = getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { title, description, priority, category, tags, metadata } = req.body;

      // Validation
      if (!title || !description) {
        return res.status(400).json({
          success: false,
          message: 'Title and description are required',
        });
      }

      // Create ticket
      const ticket = await ticketService.createTicket({
        title,
        description,
        priority: priority || TicketPriority.MEDIUM,
        category: category || TicketCategory.GENERAL,
        authorId: currentUser.id,
        clinicId: currentUser.clinicId,
        tags: tags || [],
        metadata: metadata || {},
      });

      console.log('✅ Ticket created:', ticket.id);

      // Emit WebSocket event for real-time updates
      wsService.emitTicketCreated({
        ticketId: ticket.id,
        title: ticket.title,
        clinicId: ticket.clinicId,
        authorId: ticket.authorId,
        status: ticket.status,
      });

      res.status(201).json({
        success: true,
        message: 'Ticket created successfully',
        data: ticket,
      });
    } catch (error) {
      console.error('❌ Error creating ticket:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create ticket',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  /**
   * Get all tickets with filters
   * GET /support/tickets
   */
  app.get('/support/tickets', authenticateJWT, async (req: any, res: Response) => {
    try {
      const currentUser = getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const {
        status,
        priority,
        category,
        clinicId,
        search,
        page = 1,
        limit = 20,
      } = req.query;

      // Build filters
      const filters: any = {
        status: status || 'all',
        priority: priority || 'all',
      };

      if (category) filters.category = category;
      if (search) filters.search = search;

      // If user is not admin/support staff, they can only see their own tickets
      // Check if user has a role that allows seeing all tickets (e.g., 'support', 'admin', 'doctor', 'brand')
      const isAdminOrSupport = currentUser.role === 'admin' || currentUser.role === 'support' || currentUser.role === 'provider' || currentUser.role === 'doctor' || currentUser.role === 'brand';
      
      if (!isAdminOrSupport) {
        // Regular users (patients) can only see their own tickets
        filters.authorId = currentUser.id;
      } else {
        // Admins and support can filter by clinic
        if (currentUser.clinicId && !clinicId) {
          filters.clinicId = currentUser.clinicId;
        } else if (clinicId) {
          filters.clinicId = clinicId;
        }
      }

      const result = await ticketService.listTickets(
        filters,
        parseInt(page as string),
        parseInt(limit as string)
      );

      console.log(`✅ Listed tickets: ${result.tickets.length} of ${result.total}`);

      res.json({
        success: true,
        data: {
          tickets: result.tickets,
          pagination: {
            page: result.page,
            limit: parseInt(limit as string),
            total: result.total,
            totalPages: result.totalPages,
          },
        },
      });
    } catch (error) {
      console.error('❌ Error listing tickets:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to list tickets',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  /**
   * Get ticket by ID
   * GET /support/tickets/:ticketId
   */
  app.get('/support/tickets/:ticketId', authenticateJWT, async (req: any, res: Response) => {
    try {
      const currentUser = getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { ticketId } = req.params;

      const ticket = await ticketService.getTicketById(ticketId, currentUser.id);

      console.log('✅ Retrieved ticket:', ticketId);

      res.json({
        success: true,
        data: ticket,
      });
    } catch (error) {
      console.error('❌ Error getting ticket:', error);
      
      if (error instanceof Error && error.message === 'Ticket not found') {
        return res.status(404).json({
          success: false,
          message: 'Ticket not found',
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to get ticket',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  /**
   * Update ticket
   * PUT /support/tickets/:ticketId
   */
  app.put('/support/tickets/:ticketId', authenticateJWT, async (req: any, res: Response) => {
    try {
      const currentUser = getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { ticketId } = req.params;
      const updateData = req.body;

      const ticket = await ticketService.updateTicket(ticketId, updateData, currentUser.id);

      console.log('✅ Ticket updated:', ticketId);

      res.json({
        success: true,
        message: 'Ticket updated successfully',
        data: ticket,
      });
    } catch (error) {
      console.error('❌ Error updating ticket:', error);
      
      if (error instanceof Error && error.message === 'Ticket not found') {
        return res.status(404).json({
          success: false,
          message: 'Ticket not found',
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to update ticket',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  /**
   * Add message to ticket
   * POST /support/tickets/:ticketId/messages
   */
  app.post('/support/tickets/:ticketId/messages', authenticateJWT, async (req: any, res: Response) => {
    try {
      const currentUser = getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { ticketId } = req.params;
      const { message, isInternal, attachments } = req.body;

      if (!message) {
        return res.status(400).json({
          success: false,
          message: 'Message is required',
        });
      }

      const ticketMessage = await ticketService.addMessage({
        ticketId,
        senderId: currentUser.id,
        senderType: MessageSender.USER,
        message,
        isInternal: isInternal || false,
        attachments: attachments || [],
      });

      console.log('✅ Message added to ticket:', ticketId);

      res.status(201).json({
        success: true,
        message: 'Message added successfully',
        data: ticketMessage,
      });
    } catch (error) {
      console.error('❌ Error adding message:', error);
      
      if (error instanceof Error && error.message === 'Ticket not found') {
        return res.status(404).json({
          success: false,
          message: 'Ticket not found',
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to add message',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  /**
   * Get ticket statistics
   * GET /support/tickets/stats
   */
  app.get('/support/stats', authenticateJWT, async (req: any, res: Response) => {
    try {
      const currentUser = getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { clinicId } = req.query;

      // If user is not admin, use their clinic
      const filterClinicId = clinicId || currentUser.clinicId;

      const stats = await ticketService.getStatistics(filterClinicId);

      console.log('✅ Retrieved ticket statistics');

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error('❌ Error getting statistics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get statistics',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  /**
   * Delete ticket (soft delete)
   * DELETE /support/tickets/:ticketId
   */
  app.delete('/support/tickets/:ticketId', authenticateJWT, async (req: any, res: Response) => {
    try {
      const currentUser = getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { ticketId } = req.params;

      await ticketService.deleteTicket(ticketId);

      console.log('✅ Ticket deleted:', ticketId);

      res.json({
        success: true,
        message: 'Ticket deleted successfully',
      });
    } catch (error) {
      console.error('❌ Error deleting ticket:', error);
      
      if (error instanceof Error && error.message === 'Ticket not found') {
        return res.status(404).json({
          success: false,
          message: 'Ticket not found',
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to delete ticket',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  console.log('✅ Support endpoints registered');
}

