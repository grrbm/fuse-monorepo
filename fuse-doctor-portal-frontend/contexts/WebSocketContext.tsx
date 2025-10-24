import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface OrderUpdate {
    orderId: string;
    orderNumber?: string;
    status?: string;
    autoApproved?: boolean;
    doctorNotes?: any;
}

interface WebSocketContextType {
    socket: Socket | null;
    connected: boolean;
    orderUpdates: OrderUpdate[];
    clearUpdates: () => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export function WebSocketProvider({ children }: { children: ReactNode }) {
    const { token, user } = useAuth();
    const [socket, setSocket] = useState<Socket | null>(null);
    const [connected, setConnected] = useState(false);
    const [orderUpdates, setOrderUpdates] = useState<OrderUpdate[]>([]);

    useEffect(() => {
        if (!token || !user) {
            // Cleanup existing socket if user logs out
            if (socket) {
                socket.disconnect();
                setSocket(null);
                setConnected(false);
            }
            return;
        }

        // Connect to WebSocket server
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        
        const newSocket = io(apiUrl, {
            auth: {
                token: token,
            },
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: Infinity,
        });

        newSocket.on('connect', () => {
            console.log('[WS] ✅ Connected to WebSocket server');
            setConnected(true);
        });

        newSocket.on('disconnect', () => {
            console.log('[WS] 🔌 Disconnected from WebSocket server');
            setConnected(false);
        });

        newSocket.on('connect_error', (error) => {
            console.error('[WS] ❌ Connection error:', error);
            setConnected(false);
        });

        // Listen for order events
        newSocket.on('order:created', (data: OrderUpdate) => {
            console.log('[WS] 📥 Order created:', data);
            setOrderUpdates(prev => [...prev, data]);
        });

        newSocket.on('order:updated', (data: OrderUpdate) => {
            console.log('[WS] 📥 Order updated:', data);
            setOrderUpdates(prev => [...prev, data]);
        });

        newSocket.on('order:approved', (data: OrderUpdate) => {
            console.log('[WS] 📥 Order approved:', data);
            setOrderUpdates(prev => [...prev, data]);
        });

        newSocket.on('order:status_changed', (data: OrderUpdate) => {
            console.log('[WS] 📥 Order status changed:', data);
            setOrderUpdates(prev => [...prev, data]);
        });

        newSocket.on('order:notes_added', (data: OrderUpdate) => {
            console.log('[WS] 📥 Doctor notes added:', data);
            setOrderUpdates(prev => [...prev, data]);
        });

        setSocket(newSocket);

        // Cleanup on unmount
        return () => {
            newSocket.disconnect();
        };
    }, [token, user]);

    const clearUpdates = useCallback(() => {
        setOrderUpdates([]);
    }, []);

    return (
        <WebSocketContext.Provider value={{ socket, connected, orderUpdates, clearUpdates }}>
            {children}
        </WebSocketContext.Provider>
    );
}

export function useWebSocket() {
    const context = useContext(WebSocketContext);
    if (context === undefined) {
        throw new Error('useWebSocket must be used within a WebSocketProvider');
    }
    return context;
}

// Hook for listening to order updates
export function useOrderUpdates(callback: (update: OrderUpdate) => void) {
    const { orderUpdates, clearUpdates } = useWebSocket();

    useEffect(() => {
        if (orderUpdates.length > 0) {
            const latestUpdate = orderUpdates[orderUpdates.length - 1];
            callback(latestUpdate);
        }
    }, [orderUpdates, callback]);

    return { clearUpdates };
}

