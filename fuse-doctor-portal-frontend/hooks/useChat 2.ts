import { useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { ChatMessage } from '@/lib/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface UseChatOptions {
  onNewMessage?: (message: ChatMessage) => void;
  onChatRead?: (data: { chatId: string; readBy: 'doctor' | 'patient' }) => void;
}

export function useChat({ onNewMessage, onChatRead }: UseChatOptions = {}) {
  const socketRef = useRef<Socket | null>(null);

  const connect = useCallback((token: string) => {
    if (socketRef.current?.connected) {
      return;
    }

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

    socket.on('connect_error', (error) => {
      console.error('[WS] ❌ Connection error:', error);
    });

    // Listen for chat messages
    socket.on('chat:message', (data: { chatId: string; message: ChatMessage }) => {
      console.log('[WS] 💬 Received message:', data);
      if (onNewMessage) {
        onNewMessage(data.message);
      }
    });

    // Listen for chat read events
    socket.on('chat:read', (data: { chatId: string; readBy: 'doctor' | 'patient' }) => {
      console.log('[WS] 👁️ Chat read:', data);
      if (onChatRead) {
        onChatRead(data);
      }
    });

    socketRef.current = socket;
  }, [onNewMessage, onChatRead]);

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

