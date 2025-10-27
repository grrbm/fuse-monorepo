import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Avatar, Button, Card, CardBody, Input, Tabs, Tab, Spinner } from "@heroui/react";
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

interface Conversation {
  id: string;
  participants: {
    id: string;
    name: string;
    role: string;
    avatar: string;
  }[];
  lastMessage: string;
  lastMessageTime: string;
  unread: boolean;
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
  const [selectedTab, setSelectedTab] = useState("inbox");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showConversationList, setShowConversationList] = useState(!isMobileView);
  const [isLoadingMessages, setIsLoadingMessages] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
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

  // WebSocket handler for new messages
  const handleNewMessage = useCallback((message: ChatMessage) => {
    console.log('📨 New message received via WebSocket:', message);
    
    // Use functional updates to avoid dependencies
    setMessages(prev => {
      // Check if message already exists to avoid duplicates
      const messageExists = prev.some(m => m.id === message.id);
      if (messageExists) {
        console.log('⚠️ Message already exists, skipping');
        return prev;
      }
      
      return [...prev, {
        id: message.id,
        sender: {
          id: message.senderId,
          name: message.senderRole === 'patient' ? "Tú" : "Doctor",
          role: message.senderRole === 'patient' ? "Paciente" : "Doctor",
          avatar: DEFAULT_CLINICIAN_AVATAR,
        },
        content: message.message,
        timestamp: formatTimestamp(message.createdAt),
        isUser: message.senderRole === 'patient',
        createdAt: message.createdAt,
      }];
    });

    // Update chat data with new message
    setChatData(prev => {
      if (!prev) {
        console.log('⚠️ No chat data, skipping update');
        return null;
      }
      
      // Check if message already exists in chat data
      const messageExists = prev.messages.some((m: ChatMessage) => m.id === message.id);
      if (messageExists) {
        return prev;
      }
      
      return {
        ...prev,
        messages: [...prev.messages, message],
        lastMessageAt: message.createdAt,
        unreadCountPatient: message.senderRole === 'doctor' 
          ? prev.unreadCountPatient + 1 
          : prev.unreadCountPatient,
      };
    });
  }, []); // Empty dependencies array - use functional updates instead

  // Initialize WebSocket
  const { connect, disconnect } = useChat({
    onNewMessage: handleNewMessage,
  });

  // Connect WebSocket when auth token is available
  useEffect(() => {
    if (authToken) {
      connect(authToken);
    }
    return () => {
      disconnect();
    };
  }, [authToken, connect, disconnect]);

  const conversations = useMemo<Conversation[]>(() => {
    if (!chatData || !chatData.doctor) return [];

    const doctor = chatData.doctor;
    const doctorName = `Dr. ${doctor.firstName} ${doctor.lastName}`;
    const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;

    return [
      {
        id: doctor.id,
        participants: [{
          id: doctor.id,
          name: doctorName,
          role: "Doctor",
          avatar: DEFAULT_CLINICIAN_AVATAR,
        }],
        lastMessage: lastMessage?.content || "No hay mensajes aún",
        lastMessageTime: formatConversationDate(lastMessage?.createdAt),
        unread: chatData.unreadCountPatient > 0,
      },
    ];
  }, [chatData, messages]);

  useEffect(() => {
    if (!selectedConversationId && conversations.length > 0) {
      setSelectedConversationId(conversations[0].id);
    }
  }, [conversations, selectedConversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchMessages = useCallback(async (withLoader: boolean = true) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    if (withLoader) {
      setIsLoadingMessages(true);
    }
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
      if (withLoader) {
        setIsLoadingMessages(false);
      }
      isFetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    void fetchMessages();
  }, [fetchMessages]);

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

      // Update chat data
      setChatData(payload.chat);

      // Map the new message to UI format
      const doctorName = payload.chat.doctor 
        ? `Dr. ${payload.chat.doctor.firstName} ${payload.chat.doctor.lastName}`
        : "Doctor";

      const mappedMessage = mapChatMessageToUi(payload.message, doctorName);
      setMessages((prev) => [...prev, mappedMessage]);
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

  const handleBackToList = () => {
    setShowConversationList(true);
  };

  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversationId(conversationId);
    if (isMobileView) {
      setShowConversationList(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Messenger</h1>
        {isMobileView && !showConversationList && (
          <Button
            isIconOnly
            variant="light"
            onPress={handleBackToList}
            aria-label="Back to conversations"
          >
            <Icon icon="lucide:chevron-left" className="text-lg" />
          </Button>
        )}
      </div>
      
      <div className="flex flex-1 gap-6 h-[calc(100%-2rem)] overflow-hidden">
        {/* Left sidebar - Conversations */}
        {(!isMobileView || showConversationList) && (
          <Card className={`${isMobileView ? 'w-full' : 'w-80'} border border-content3 overflow-hidden`}>
            <CardBody className="p-0 flex flex-col h-full">
              <div className="p-3">
                <Input
                  placeholder="Search messages..."
                  startContent={<Icon icon="lucide:search" className="text-foreground-400" />}
                  size="sm"
                  className="mb-2"
                  isDisabled
                />
                <Tabs 
                  selectedKey={selectedTab} 
                  onSelectionChange={(key) => setSelectedTab(key as string)}
                  variant="light"
                  size="sm"
                  className="w-full"
                >
                  <Tab key="inbox" title="Inbox" />
                  <Tab key="sent" title="Sent" isDisabled />
                  <Tab key="archived" title="Archived" isDisabled />
                </Tabs>
              </div>
              
              <div className="flex-1 overflow-y-auto">
                {conversations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-foreground-400 text-sm px-4 text-center">
                    {isLoadingMessages ? "Cargando conversaciones..." : "Aún no tienes un doctor asignado"}
                  </div>
                ) : (
                  conversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      className={`flex items-center gap-3 p-3 hover:bg-content2 cursor-pointer transition-colors ${
                        conversation.id === selectedConversationId ? "border-l-4 border-primary bg-primary-50" : ""
                      }`}
                      onClick={() => handleSelectConversation(conversation.id)}
                    >
                      <Avatar src={conversation.participants[0].avatar || DEFAULT_CLINICIAN_AVATAR} size="md" />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <h3 className="font-medium text-foreground truncate">
                            {conversation.participants[0].name}
                          </h3>
                          <span className="text-xs text-foreground-400">
                            {conversation.lastMessageTime}
                          </span>
                        </div>
                        <p className="text-sm text-foreground-500 truncate">
                          {conversation.participants[0].role}
                        </p>
                        <p className="text-sm text-foreground-600 truncate">
                          {conversation.lastMessage}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              <div className="p-3 border-t border-content3">
                <Button 
                  color="primary" 
                  className="w-full"
                  startContent={<Icon icon="lucide:plus" />}
                  isDisabled
                >
                  New Message
                </Button>
              </div>
            </CardBody>
          </Card>
        )}
        
        {/* Right side - Chat */}
        {(!isMobileView || !showConversationList) && (
          <Card className="flex-1 border border-content3 overflow-hidden">
            <CardBody className="p-0 flex flex-col h-full">
              {/* Chat header */}
              <div className="flex items-center gap-3 p-4 border-b border-content3">
                {isMobileView && (
                  <Button
                    isIconOnly
                    variant="light"
                    size="sm"
                    onPress={handleBackToList}
                    aria-label="Back"
                    className="mr-1"
                  >
                    <Icon icon="lucide:chevron-left" className="text-lg" />
                  </Button>
                )}
                <Avatar
                  src={conversations[0]?.participants[0]?.avatar || DEFAULT_CLINICIAN_AVATAR}
                  size="md"
                />
                <div className="flex-1">
                  <h3 className="font-medium">{conversations[0]?.participants[0]?.name || "Equipo médico"}</h3>
                  <p className="text-sm text-foreground-500">{conversations[0]?.participants[0]?.role || "Doctor"}</p>
                </div>
                <div className="flex gap-2">
                  <Button isIconOnly variant="light" aria-label="Call">
                    <Icon icon="lucide:phone" className="text-foreground-500" />
                  </Button>
                  <Button isIconOnly variant="light" aria-label="More options">
                    <Icon icon="lucide:more-vertical" className="text-foreground-500" />
                  </Button>
                </div>
              </div>
              
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

                <div className="flex mt-3">
                  <Button
                    color="primary"
                    variant="flat"
                    className="flex-1"
                    startContent={<Icon icon="lucide:user-round" />}
                    size={isMobileView ? "sm" : "md"}
                    isDisabled
                  >
                    Doctor
                  </Button>
                  <Button
                    variant="flat"
                    className="flex-1"
                    startContent={<Icon icon="lucide:headphones" />}
                    size={isMobileView ? "sm" : "md"}
                    isDisabled
                  >
                    Support
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  );
};