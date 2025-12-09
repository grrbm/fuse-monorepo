import { Server as SocketIOServer } from "socket.io";
import { Server as HTTPServer } from "http";
import jwt from "jsonwebtoken";
import type { Socket } from "socket.io";

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
        origin: (origin, callback) => {
          // Allow requests with no origin (mobile apps, etc.)
          if (!origin) return callback(null, true);

          const allowedOrigins =
            process.env.NODE_ENV === "production"
              ? [
                  process.env.PATIENT_FRONTEND_URL,
                  process.env.DOCTOR_PORTAL_URL,
                  process.env.ADMIN_PORTAL_URL,
                  process.env.FRONTEND_URL,
                ].filter(Boolean)
              : [
                  "http://localhost:3000",
                  "http://localhost:3002",
                  "http://localhost:3003",
                  "http://localhost:3030",
                ];

          // Check if origin is allowed
          const isAllowed =
            allowedOrigins.includes(origin) ||
            // Allow clinic subdomains in development
            (process.env.NODE_ENV === "development" &&
              /^http:\/\/[a-zA-Z0-9.-]+\.localhost:3000$/.test(origin)) ||
            // Allow production clinic domains
            (process.env.NODE_ENV === "production" &&
              /^https:\/\/app\.[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$/.test(origin)) ||
            // Allow fuse.health root domain and any subdomain
            (process.env.NODE_ENV === "production" &&
              /^https:\/\/([a-zA-Z0-9-]+\.)*fuse\.health$/.test(origin)) ||
            // Allow any origin containing fusehealth.com (including rx.fusehealth.com, app.fusehealth.com, etc.)
            origin.includes("fusehealth.com") ||
            // Allow fusehealthstaging.xyz root domain and all subdomains
            /^https:\/\/([a-zA-Z0-9-]+\.)*fusehealthstaging\.xyz$/.test(
              origin
            ) ||
            // Allow unboundedhealth.xyz root domain and all subdomains
            /^https:\/\/([a-zA-Z0-9-]+\.)*unboundedhealth\.xyz$/.test(origin);

          if (isAllowed) {
            console.log(`✅ [WS] CORS allowed origin`);
            callback(null, true);
          } else {
            console.log(`❌ [WS] CORS blocked origin`);
            callback(new Error("Not allowed by CORS"));
          }
        },
        credentials: true,
      },
    });

    // Authentication middleware
    this.io.use((socket: AuthenticatedSocket, next) => {
      const token =
        socket.handshake.auth.token ||
        socket.handshake.headers.authorization?.replace("Bearer ", "");

      if (!token) {
        console.log("[WS] ❌ No token provided");
        return next(new Error("Authentication error"));
      }

      try {
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
          console.error("[WS] ❌ JWT secret not configured");
          return next(new Error("Authentication error"));
        }

        const decoded = jwt.verify(token, jwtSecret) as any;

        socket.userId = decoded.userId || decoded.id;
        socket.userRole = decoded.role;
        socket.clinicId = decoded.clinicId;

        next();
      } catch (error) {
        if (process.env.NODE_ENV === "development") {
          console.log("[WS] ❌ Invalid token");
        } else {
          console.log("[WS] ❌ Invalid token");
        }
        return next(new Error("Authentication error"));
      }
    });

    this.io.on("connection", (socket: AuthenticatedSocket) => {
      // Join user-specific room
      if (socket.userId) {
        socket.join(`user:${socket.userId}`);
      }

      // Join clinic-specific room for doctors/brands
      if (
        socket.clinicId &&
        (socket.userRole === "doctor" || socket.userRole === "brand")
      ) {
        socket.join(`clinic:${socket.clinicId}`);
      }

      // Join admin room for admin users
      if (socket.userRole === "admin") {
        socket.join("admin");
      }

      socket.on("disconnect", () => {
        // intentionally left without detailed logging to avoid leaking context
      });

      socket.on("error", (error) => {
        if (process.env.NODE_ENV === "development") {
          console.error("[WS] ❌ Socket error");
        } else {
          console.error("[WS] ❌ Socket error");
        }
      });
    });

    console.log("[WS] 🚀 WebSocket server initialized");
  }

  // Emit order created event
  emitOrderCreated(orderData: OrderEventData): void {
    if (!this.io) return;

    console.log("[WS] 📤 Emitting order:created");

    // Notify the patient
    if (orderData.userId) {
      this.io.to(`user:${orderData.userId}`).emit("order:created", orderData);
    }

    // Notify clinic doctors/staff
    if (orderData.clinicId) {
      this.io
        .to(`clinic:${orderData.clinicId}`)
        .emit("order:created", orderData);
    }

    // Notify admins
    this.io.to("admin").emit("order:created", orderData);
  }

  // Emit order updated event
  emitOrderUpdated(orderData: OrderEventData): void {
    if (!this.io) return;

    console.log("[WS] 📤 Emitting order:updated");

    // Notify the patient
    if (orderData.userId) {
      this.io.to(`user:${orderData.userId}`).emit("order:updated", orderData);
    }

    // Notify clinic doctors/staff
    if (orderData.clinicId) {
      this.io
        .to(`clinic:${orderData.clinicId}`)
        .emit("order:updated", orderData);
    }

    // Notify admins
    this.io.to("admin").emit("order:updated", orderData);
  }

  // Emit order approved event
  emitOrderApproved(orderData: OrderEventData): void {
    if (!this.io) return;

    console.log("[WS] 📤 Emitting order:approved");

    // Notify the patient
    if (orderData.userId) {
      this.io.to(`user:${orderData.userId}`).emit("order:approved", orderData);
    }

    // Notify clinic doctors/staff
    if (orderData.clinicId) {
      this.io
        .to(`clinic:${orderData.clinicId}`)
        .emit("order:approved", orderData);
    }

    // Notify admins
    this.io.to("admin").emit("order:approved", orderData);
  }

  // Emit order status changed event
  emitOrderStatusChanged(orderData: OrderEventData): void {
    if (!this.io) return;

    console.log("[WS] 📤 Emitting order:status_changed");

    // Notify the patient
    if (orderData.userId) {
      this.io
        .to(`user:${orderData.userId}`)
        .emit("order:status_changed", orderData);
    }

    // Notify clinic doctors/staff
    if (orderData.clinicId) {
      this.io
        .to(`clinic:${orderData.clinicId}`)
        .emit("order:status_changed", orderData);
    }

    // Notify admins
    this.io.to("admin").emit("order:status_changed", orderData);
  }

  // Emit doctor notes added event
  emitDoctorNotesAdded(orderData: OrderEventData): void {
    if (!this.io) return;

    console.log("[WS] 📤 Emitting order:notes_added");

    // Notify the patient
    if (orderData.userId) {
      this.io
        .to(`user:${orderData.userId}`)
        .emit("order:notes_added", orderData);
    }

    // Notify clinic doctors/staff
    if (orderData.clinicId) {
      this.io
        .to(`clinic:${orderData.clinicId}`)
        .emit("order:notes_added", orderData);
    }

    // Notify admins
    this.io.to("admin").emit("order:notes_added", orderData);
  }

  // Emit new chat message event
  emitChatMessage(chatData: {
    chatId: string;
    doctorId: string;
    patientId: string;
    message: any;
  }): void {
    if (!this.io) return;

    console.log("[WS] 💬 Emitting chat:message");

    // Notify the doctor
    this.io.to(`user:${chatData.doctorId}`).emit("chat:message", {
      chatId: chatData.chatId,
      message: chatData.message,
    });

    // Notify the patient
    this.io.to(`user:${chatData.patientId}`).emit("chat:message", {
      chatId: chatData.chatId,
      message: chatData.message,
    });
  }

  emitUnreadCountUpdate(userId: string, unreadCount: number): void {
    if (!this.io) return;

    console.log("[WS] 🔔 Emitting unread count update");

    this.io.to(`user:${userId}`).emit("chat:unread-count", {
      unreadCount,
    });
  }

  // Emit chat messages marked as read
  emitChatRead(chatData: {
    chatId: string;
    doctorId: string;
    patientId: string;
    readBy: "doctor" | "patient";
  }): void {
    if (!this.io) return;

    console.log("[WS] 👁️ Emitting chat:read");

    // Notify both users
    this.io.to(`user:${chatData.doctorId}`).emit("chat:read", {
      chatId: chatData.chatId,
      readBy: chatData.readBy,
    });

    this.io.to(`user:${chatData.patientId}`).emit("chat:read", {
      chatId: chatData.chatId,
      readBy: chatData.readBy,
    });
  }

  getIO(): SocketIOServer | null {
    return this.io;
  }
}

export default new WebSocketService();
