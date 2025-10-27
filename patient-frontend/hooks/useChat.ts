import { useEffect, useCallback, useRef } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface ChatMessage {
  id: string;
  senderId: string;
  senderRole: 'doctor' | 'patient';
  message: string;
  createdAt: string;
  read: boolean;
}

interface UseChatOptions {
  onNewMessage?: (message: ChatMessage) => void;
  onChatRead?: (data: { chatId: string; readBy: 'doctor' | 'patient' }) => void;
  onUnreadCountUpdate?: (data: { unreadCount: number }) => void;
}

export function useChat({ onNewMessage, onChatRead, onUnreadCountUpdate }: UseChatOptions = {}) {
  const socketRef = useRef<any>(null);
  const handlersRef = useRef({ onNewMessage, onChatRead, onUnreadCountUpdate });

  // Update handlers ref when they change
  useEffect(() => {
    handlersRef.current = { onNewMessage, onChatRead, onUnreadCountUpdate };
  }, [onNewMessage, onChatRead, onUnreadCountUpdate]);

  const connect = useCallback(async (token: string) => {
    if (socketRef.current?.connected) {
      console.log('[WS] ⚠️ Already connected, skipping');
      return;
    }

    if (!token) {
      console.error('[WS] ❌ No token provided, cannot connect');
      return;
    }

    try {
      // Dynamically import socket.io-client
      const { io } = await import('socket.io-client');

      console.log('[WS] 🔌 Connecting to:', API_URL);
      console.log('[WS] 🔑 Token:', token ? `${token.substring(0, 20)}...` : 'MISSING');
      const socket = io(API_URL, {
        auth: { token },
        transports: ['websocket', 'polling'],
      });

      socket.on('connect', () => {
        console.log('[WS] ✅ Connected to WebSocket');
      });

      socket.on('disconnect', () => {
        console.log('[WS] 🔌 Disconnected from WebSocket');
      });

      socket.on('connect_error', (error: any) => {
        console.error('[WS] ❌ Connection error:', error);
      });

      // Listen for chat messages
      socket.on('chat:message', (data: { chatId: string; message: ChatMessage }) => {
        console.log('[WS] 💬 Received message:', data);
        if (handlersRef.current.onNewMessage) {
          handlersRef.current.onNewMessage(data.message);
        }
      });

      // Listen for chat read events
      socket.on('chat:read', (data: { chatId: string; readBy: 'doctor' | 'patient' }) => {
        console.log('[WS] 👁️ Chat read:', data);
        if (handlersRef.current.onChatRead) {
          handlersRef.current.onChatRead(data);
        }
      });

      // Listen for unread count updates
      socket.on('chat:unread-count', (data: { unreadCount: number }) => {
        console.log('[WS] 🔔 Unread count update:', data);
        if (handlersRef.current.onUnreadCountUpdate) {
          handlersRef.current.onUnreadCountUpdate(data);
        }
      });

      socketRef.current = socket;
    } catch (error) {
      console.error('[WS] ❌ Failed to load socket.io-client. Please install: pnpm add socket.io-client', error);
    }
  }, []); // No dependencies - use handlersRef instead

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return { connect, disconnect };
}

