import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Avatar, Button, Card, CardBody, Input, Spinner } from "@heroui/react";
import { Icon } from "@iconify/react";
import { apiCall } from "../lib/api";
import { useChat } from "../hooks/useChat";

// New interfaces for our chat system
interface ChatMessage {
  id: string;
  senderId: string;
  senderRole: 'doctor' | 'patient';
  message: string;
  createdAt: string;
  read: boolean;
}

interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface ChatData {
  id: string;
  doctorId: string;
  patientId: string;
  messages: ChatMessage[];
  lastMessageAt: string;
  unreadCountDoctor: number;
  unreadCountPatient: number;
  createdAt: string;
  updatedAt: string;
  doctor: Doctor | null;
}

// UI interfaces
interface Message {
  id: string;
  sender: {
    id: string;
    name: string;
    role: string;
    avatar: string;
  };
  content: string;
  timestamp: string;
  isUser: boolean;
  createdAt?: string;
}

interface MessengerPageProps {
  isMobileView?: boolean;
}

// API Response interfaces
interface GetChatResponse {
  success: boolean;
  data: ChatData | null;
  message?: string;
}

interface SendMessageResponse {
  success: boolean;
  data: {
    message: ChatMessage;
    chat: ChatData;
  };
  message?: string;
}

const DEFAULT_CLINICIAN_AVATAR = "https://img.heroui.chat/image/avatar?w=200&h=200&u=10";

const formatTimestamp = (isoDate: string) => {
  if (!isoDate) return "";
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const formatConversationDate = (isoDate?: string) => {
  if (!isoDate) return "";
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString([], { month: "short", day: "numeric" });
};

const mapChatMessageToUi = (message: ChatMessage, doctorName: string): Message => {
  const isPatient = message.senderRole === 'patient';

  return {
    id: message.id,
    sender: {
      id: message.senderId,
      name: isPatient ? "Tú" : doctorName,
      role: isPatient ? "Paciente" : "Doctor",
      avatar: DEFAULT_CLINICIAN_AVATAR,
    },
    content: message.message,
    timestamp: formatTimestamp(message.createdAt),
    isUser: isPatient,
    createdAt: message.createdAt,
  };
};

export const MessengerPage: React.FC<MessengerPageProps> = ({ isMobileView = false }) => {
  const [chatData, setChatData] = useState<ChatData | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isLoadingMessages, setIsLoadingMessages] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState<boolean>(false);
  const isFetchingRef = useRef<boolean>(false);
  
  // Get auth token from localStorage
  const [authToken, setAuthToken] = useState<string | null>(null);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Use the same key as api.ts: 'auth-token'
      const token = localStorage.getItem('auth-token');
      console.log('[Messenger] 🔑 Token from localStorage:', token ? '✅ Found' : '❌ Not found');
      setAuthToken(token);
    }
  }, []);

  // Handle new messages from WebSocket
  const handleNewMessage = useCallback((message: ChatMessage) => {
    console.log('[Messenger] 📨 New message received via WebSocket:', message);
    
    // Update chat data first to get doctor info
    setChatData(prev => {
      if (!prev) return null;
      
      const messageExists = prev.messages.some(m => m.id === message.id);
      if (messageExists) return prev;
      
      return {
        ...prev,
        messages: [...prev.messages, message],
        lastMessageAt: message.createdAt
      };
    });

    // Add to UI messages
    setMessages(prev => {
      const messageExists = prev.some(m => m.id === message.id);
      if (messageExists) {
        console.log('[Messenger] ⚠️ Message already exists, skipping');
        return prev;
      }
      
      // Get doctor name from message or default
      const doctorName = message.senderRole === 'doctor' 
        ? "Doctor" 
        : "Tú";
      
      const uiMessage = mapChatMessageToUi(message, doctorName);
      return [...prev, uiMessage];
    });
  }, []); // No dependencies - use functional updates

  // Connect to WebSocket for real-time messages
  const { connect, disconnect } = useChat({
    onNewMessage: handleNewMessage
  });

  useEffect(() => {
    if (authToken) {
      console.log('[Messenger] 🔌 Connecting to WebSocket...');
      connect(authToken);
    }

    return () => {
      console.log('[Messenger] 🔌 Disconnecting from WebSocket...');
      disconnect();
    };
  }, [authToken, connect, disconnect]);

  // Mark messages as read when user enters the chat
  useEffect(() => {
    const markAsRead = async () => {
      if (!authToken || !chatData || chatData.unreadCountPatient === 0) return;
      
      try {
        console.log('📖 Marking messages as read on chat enter');
        await apiCall('/patient/chat/mark-read', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        });

        // Update local chat data
        setChatData(prev => {
          if (!prev) return null;
          return {
            ...prev,
          unreadCountPatient: 0
        };
      });
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  markAsRead();
}, [authToken, chatData?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load messages only once on mount
  useEffect(() => {
    const loadMessages = async () => {
      if (isFetchingRef.current) return;
      isFetchingRef.current = true;
      setIsLoadingMessages(true);
      setLoadError(null);

      try {
        const response = await apiCall<GetChatResponse>("/patient/chat");

        if (!response.success) {
          throw new Error(response.error || "No se pudo cargar el chat");
        }

        const chatDataResponse = response.data?.data;

        if (!chatDataResponse) {
          // No chat found - patient doesn't have an assigned doctor yet
          setChatData(null);
          setMessages([]);
          return;
        }

        setChatData(chatDataResponse);

        // Map messages to UI format
        const doctorName = chatDataResponse.doctor 
          ? `Dr. ${chatDataResponse.doctor.firstName} ${chatDataResponse.doctor.lastName}`
          : "Doctor";

        const uiMessages = chatDataResponse.messages.map(msg => mapChatMessageToUi(msg, doctorName));
        setMessages(uiMessages);

      } catch (error) {
        console.error("❌ Error cargando mensajes:", error);
        setLoadError(error instanceof Error ? error.message : "No se pudieron cargar los mensajes");
      } finally {
        setIsLoadingMessages(false);
        isFetchingRef.current = false;
      }
    };

    loadMessages();
  }, []); // Only load once on mount - WebSocket handles real-time updates

  const handleSendMessage = async () => {
    if (isSending || newMessage.trim() === "" || !chatData) return;

    const trimmedMessage = newMessage.trim();
    setIsSending(true);
    setSendError(null);

    try {
      const response = await apiCall<SendMessageResponse>("/patient/chat/messages", {
        method: "POST",
        body: JSON.stringify({ message: trimmedMessage }),
      });

      if (!response.success) {
        throw new Error(response.error || "No se pudo enviar el mensaje");
      }

      const payload = response.data?.data;

      if (!payload) {
        throw new Error("No se recibió respuesta del servidor");
      }

      // Update chat data (WebSocket will handle adding the message to UI)
      setChatData(payload.chat);
      
      // Clear input - the message will appear via WebSocket
      setNewMessage("");
    } catch (error) {
      console.error("❌ Error enviando mensaje:", error);
      setSendError(error instanceof Error ? error.message : "No se pudo enviar el mensaje");
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSendMessage();
    }
  };

  const doctorName = useMemo(() => {
    if (!chatData?.doctor) return "Doctor";
    return `Dr. ${chatData.doctor.firstName} ${chatData.doctor.lastName}`;
  }, [chatData?.doctor]);

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-semibold">Chat con tu Doctor</h1>
          {chatData?.doctor && (
            <p className="text-sm text-foreground-500 mt-1">{doctorName}</p>
          )}
        </div>
      </div>
      
      <div className="flex flex-1 h-[calc(100%-4rem)] overflow-hidden">
        {/* Chat - Full width */}
        <Card className="flex-1 border border-content3 overflow-hidden">
            <CardBody className="p-0 flex flex-col h-full">
              {/* Chat header */}
              {chatData?.doctor && (
                <div className="flex items-center gap-3 p-4 border-b border-content3">
                  <Avatar
                    src={DEFAULT_CLINICIAN_AVATAR}
                    size="md"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium">{doctorName}</h3>
                    <p className="text-sm text-foreground-500">Doctor</p>
                  </div>
                  <div className="flex gap-2">
                    <Button isIconOnly variant="light" aria-label="Call" isDisabled>
                      <Icon icon="lucide:phone" className="text-foreground-500" />
                    </Button>
                    <Button isIconOnly variant="light" aria-label="More options" isDisabled>
                      <Icon icon="lucide:more-vertical" className="text-foreground-500" />
                    </Button>
                  </div>
                </div>
              )}
              
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {isLoadingMessages ? (
                  <div className="flex justify-center items-center h-full">
                    <Spinner color="primary" label="Cargando mensajes..." labelColor="primary" />
                  </div>
                ) : loadError ? (
                  <div className="text-center text-sm text-danger-600 bg-danger-50 border border-danger-100 rounded-md p-4">
                    {loadError}
                  </div>
                ) : !chatData ? (
                  <div className="flex justify-center items-center h-full text-sm text-foreground-400 text-center px-4">
                    Aún no tienes un doctor asignado. Cuando tengas uno asignado, podrás chatear aquí.
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex justify-center items-center h-full text-sm text-foreground-400">
                    Aún no hay mensajes. ¡Escribe el primero!
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}
                    >
                      <div className={`flex gap-3 max-w-[80%] ${message.isUser ? "flex-row-reverse" : ""}`}>
                        {!message.isUser && (
                          <Avatar src={message.sender.avatar || DEFAULT_CLINICIAN_AVATAR} size="sm" className="mt-1" />
                        )}
                        <div>
                          {!message.isUser && (
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm">{message.sender.name}</span>
                              <span className="text-xs text-foreground-400">{message.sender.role}</span>
                            </div>
                          )}
                          <div
                            className={`p-3 rounded-lg ${
                              message.isUser
                                ? "bg-primary text-white"
                                : "bg-content2 text-foreground"
                            }`}
                          >
                            <p>{message.content}</p>
                          </div>
                          <div className="text-xs text-foreground-400 mt-1">
                            {message.timestamp}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
              
              {/* Message input */}
              <div className="p-3 border-t border-content3">
                <div className="flex gap-2 items-center">
                  <div className="flex-1">
                    <Input
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      isDisabled={isSending}
                      endContent={
                        <Button isIconOnly variant="light" size="sm" aria-label="Attach file" isDisabled>
                          <Icon icon="lucide:paperclip" className="text-foreground-400" />
                        </Button>
                      }
                      className="w-full"
                    />
                  </div>
                  <Button
                    isIconOnly
                    color="primary"
                    aria-label="Send message"
                    onPress={() => void handleSendMessage()}
                    isDisabled={newMessage.trim() === "" || isSending}
                  >
                    <Icon icon="lucide:send" />
                  </Button>
                </div>
                
                {sendError && (
                  <div className="mt-2 text-sm text-danger-600">
                    {sendError}
                  </div>
                )}

              </div>
            </CardBody>
          </Card>
      </div>
    </div>
  );
};