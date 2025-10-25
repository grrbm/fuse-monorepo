import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';
import type { Socket } from 'socket.io';

interface AuthenticatedSocket extends Socket {
    userId?: string;
    userRole?: string;
    clinicId?: string;
}

interface OrderEventData {
    orderId: string;
    orderNumber?: string;
    userId?: string;
    clinicId?: string;
    status?: string;
    autoApproved?: boolean;
    autoApprovedByDoctor?: boolean;
    doctorNotes?: any;
}

class WebSocketService {
    private io: SocketIOServer | null = null;

    initialize(httpServer: HTTPServer): void {
        this.io = new SocketIOServer(httpServer, {
            cors: {
                origin: [
                    process.env.PATIENT_FRONTEND_URL || 'http://localhost:3000',
                    process.env.DOCTOR_PORTAL_URL || 'http://localhost:3003',
                    process.env.ADMIN_PORTAL_URL || 'http://localhost:3002',
                ],
                credentials: true,
            },
        });

        // Authentication middleware
        this.io.use((socket: AuthenticatedSocket, next) => {
            const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');

            if (!token) {
                console.log('[WS] ❌ No token provided');
                return next(new Error('Authentication error'));
            }

            try {
                const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
                const decoded = jwt.verify(token, jwtSecret) as any;

                socket.userId = decoded.userId || decoded.id;
                socket.userRole = decoded.role;
                socket.clinicId = decoded.clinicId;

                console.log('[WS] ✅ Authenticated', {
                    userId: socket.userId,
                    role: socket.userRole,
                    clinicId: socket.clinicId,
                });

                next();
            } catch (error) {
                console.log('[WS] ❌ Invalid token', error);
                return next(new Error('Authentication error'));
            }
        });

        this.io.on('connection', (socket: AuthenticatedSocket) => {
            console.log('[WS] 🔌 Client connected', {
                socketId: socket.id,
                userId: socket.userId,
                role: socket.userRole,
            });

            // Join user-specific room
            if (socket.userId) {
                socket.join(`user:${socket.userId}`);
                console.log('[WS] 👤 Joined user room', `user:${socket.userId}`);
            }

            // Join clinic-specific room for doctors/brands
            if (socket.clinicId && (socket.userRole === 'doctor' || socket.userRole === 'brand')) {
                socket.join(`clinic:${socket.clinicId}`);
                console.log('[WS] 🏥 Joined clinic room', `clinic:${socket.clinicId}`);
            }

            // Join admin room for admin users
            if (socket.userRole === 'admin') {
                socket.join('admin');
                console.log('[WS] 👑 Joined admin room');
            }

            socket.on('disconnect', () => {
                console.log('[WS] 🔌 Client disconnected', socket.id);
            });

            socket.on('error', (error) => {
                console.error('[WS] ❌ Socket error', error);
            });
        });

        console.log('[WS] 🚀 WebSocket server initialized');
    }

    // Emit order created event
    emitOrderCreated(orderData: OrderEventData): void {
        if (!this.io) return;

        console.log('[WS] 📤 Emitting order:created', orderData.orderId);

        // Notify the patient
        if (orderData.userId) {
            this.io.to(`user:${orderData.userId}`).emit('order:created', orderData);
        }

        // Notify clinic doctors/staff
        if (orderData.clinicId) {
            this.io.to(`clinic:${orderData.clinicId}`).emit('order:created', orderData);
        }

        // Notify admins
        this.io.to('admin').emit('order:created', orderData);
    }

    // Emit order updated event
    emitOrderUpdated(orderData: OrderEventData): void {
        if (!this.io) return;

        console.log('[WS] 📤 Emitting order:updated', orderData.orderId);

        // Notify the patient
        if (orderData.userId) {
            this.io.to(`user:${orderData.userId}`).emit('order:updated', orderData);
        }

        // Notify clinic doctors/staff
        if (orderData.clinicId) {
            this.io.to(`clinic:${orderData.clinicId}`).emit('order:updated', orderData);
        }

        // Notify admins
        this.io.to('admin').emit('order:updated', orderData);
    }

    // Emit order approved event
    emitOrderApproved(orderData: OrderEventData): void {
        if (!this.io) return;

        console.log('[WS] 📤 Emitting order:approved', {
            orderId: orderData.orderId,
            autoApproved: orderData.autoApproved,
        });

        // Notify the patient
        if (orderData.userId) {
            this.io.to(`user:${orderData.userId}`).emit('order:approved', orderData);
        }

        // Notify clinic doctors/staff
        if (orderData.clinicId) {
            this.io.to(`clinic:${orderData.clinicId}`).emit('order:approved', orderData);
        }

        // Notify admins
        this.io.to('admin').emit('order:approved', orderData);
    }

    // Emit order status changed event
    emitOrderStatusChanged(orderData: OrderEventData): void {
        if (!this.io) return;

        console.log('[WS] 📤 Emitting order:status_changed', {
            orderId: orderData.orderId,
            status: orderData.status,
        });

        // Notify the patient
        if (orderData.userId) {
            this.io.to(`user:${orderData.userId}`).emit('order:status_changed', orderData);
        }

        // Notify clinic doctors/staff
        if (orderData.clinicId) {
            this.io.to(`clinic:${orderData.clinicId}`).emit('order:status_changed', orderData);
        }

        // Notify admins
        this.io.to('admin').emit('order:status_changed', orderData);
    }

    // Emit doctor notes added event
    emitDoctorNotesAdded(orderData: OrderEventData): void {
        if (!this.io) return;

        console.log('[WS] 📤 Emitting order:notes_added', orderData.orderId);

        // Notify the patient
        if (orderData.userId) {
            this.io.to(`user:${orderData.userId}`).emit('order:notes_added', orderData);
        }

        // Notify clinic doctors/staff
        if (orderData.clinicId) {
            this.io.to(`clinic:${orderData.clinicId}`).emit('order:notes_added', orderData);
        }

        // Notify admins
        this.io.to('admin').emit('order:notes_added', orderData);
    }

    getIO(): SocketIOServer | null {
        return this.io;
    }
}

export default new WebSocketService();

