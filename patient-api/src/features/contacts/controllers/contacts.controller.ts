import { Request, Response } from 'express';
import User from '../../../models/User';
import { getCurrentUser } from '../../../config/jwt';
import { Op } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import { getLastContactDate, getUserEngagementStats } from '../services/contacts.service';

/**
 * GET /contacts
 * List all contacts (patients) for the current clinic
 */
export const listContacts = async (req: Request, res: Response) => {
  try {
    const currentUser = getCurrentUser(req);
    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: "User authentication required"
      });
    }

    if (!currentUser.clinicId) {
      return res.status(400).json({
        success: false,
        message: "User does not belong to a clinic"
      });
    }

    // Query parameters for filtering
    const { 
      search, 
      optOutStatus, // 'all', 'active', 'email_opted_out', 'sms_opted_out'
      limit = '50', 
      offset = '0',
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = req.query;

    // Build where clause
    const whereClause: any = {
      clinicId: currentUser.clinicId,
      role: 'patient' // Only show patients, not doctors/admins
    };

    // Search by name or email
    if (search && typeof search === 'string' && search.trim()) {
      whereClause[Op.or] = [
        { firstName: { [Op.like]: `%${search}%` } },
        { lastName: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ];
    }

    // Filter by opt-out status
    if (optOutStatus && optOutStatus !== 'all') {
      switch (optOutStatus) {
        case 'email_opted_out':
          whereClause.emailOptedOut = true;
          break;
        case 'sms_opted_out':
          whereClause.smsOptedOut = true;
          break;
        case 'active':
          whereClause.emailOptedOut = false;
          whereClause.smsOptedOut = false;
          break;
      }
    }

    const parsedLimit = parseInt(limit as string, 10);
    const parsedOffset = parseInt(offset as string, 10);

    // Valid sort fields
    const validSortFields = ['createdAt', 'firstName', 'lastName', 'email'];
    const sortField = validSortFields.includes(sortBy as string) ? sortBy as string : 'createdAt';

    const { count, rows: contacts } = await User.findAndCountAll({
      where: whereClause,
      attributes: [
        'id',
        'firstName',
        'lastName',
        'email',
        'phoneNumber',
        'emailOptedOut',
        'smsOptedOut',
        'optOutDate',
        'createdAt',
        'lastLoginAt'
      ],
      order: [[sortField, sortOrder as string]],
      limit: Number.isFinite(parsedLimit) ? parsedLimit : 50,
      offset: Number.isFinite(parsedOffset) ? parsedOffset : 0
    });

    // Enrich contacts with last contact date (can be optimized later)
    const enrichedContacts = await Promise.all(
      contacts.map(async (contact) => {
        const lastContactDate = await getLastContactDate(contact.id);
        return {
          ...contact.toJSON(),
          lastContactDate
        };
      })
    );

    res.status(200).json({
      success: true,
      data: {
        contacts: enrichedContacts,
        total: count,
        limit: parsedLimit,
        offset: parsedOffset
      }
    });

  } catch (error) {
    console.error('❌ Error fetching contacts:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch contacts"
    });
  }
};

/**
 * GET /contacts/:id
 * Get a single contact with detailed information
 */
export const getContact = async (req: Request, res: Response) => {
  try {
    const currentUser = getCurrentUser(req);
    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: "User authentication required"
      });
    }

    const { id } = req.params;

    const contact = await User.findOne({
      where: {
        id,
        clinicId: currentUser.clinicId,
        role: 'patient'
      },
      attributes: [
        'id',
        'firstName',
        'lastName',
        'email',
        'phoneNumber',
        'emailOptedOut',
        'smsOptedOut',
        'optOutDate',
        'createdAt',
        'lastLoginAt',
        'dob',
        'address',
        'city',
        'state',
        'zipCode'
      ]
    });

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found"
      });
    }

    // Get engagement stats
    const engagementStats = await getUserEngagementStats(contact.id);
    const lastContactDate = await getLastContactDate(contact.id);

    res.status(200).json({
      success: true,
      data: {
        ...contact.toJSON(),
        lastContactDate,
        engagement: engagementStats
      }
    });

  } catch (error) {
    console.error('❌ Error fetching contact:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch contact"
    });
  }
};

/**
 * GET /contacts/:id/history
 * Get sequence history for a contact
 */
export const getContactHistory = async (req: Request, res: Response) => {
  try {
    const currentUser = getCurrentUser(req);
    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: "User authentication required"
      });
    }

    const { id } = req.params;

    // Verify contact belongs to clinic
    const contact = await User.findOne({
      where: {
        id,
        clinicId: currentUser.clinicId,
        role: 'patient'
      }
    });

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found"
      });
    }

    // Get all sequence runs for this contact
    // Note: This is a simplified version - in production you'd want a better way to link users to runs
    const { default: SequenceRun } = await import('../../../models/SequenceRun');
    const { default: Sequence } = await import('../../../models/Sequence');

    const runs = await SequenceRun.findAll({
      where: {
        clinicId: currentUser.clinicId,
        [Op.and]: Sequelize.literal(`payload::text LIKE '%${contact.email}%'`)
      },
      include: [
        {
          model: Sequence,
          as: 'sequence',
          attributes: ['id', 'name', 'status']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: 100
    });

    res.status(200).json({
      success: true,
      data: {
        contactId: id,
        contactName: `${contact.firstName} ${contact.lastName}`,
        contactEmail: contact.email,
        history: runs
      }
    });

  } catch (error) {
    console.error('❌ Error fetching contact history:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch contact history"
    });
  }
};

