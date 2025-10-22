import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Avatar, Button, Card, CardBody, Input, Tabs, Tab, Spinner } from "@heroui/react";
import { Icon } from "@iconify/react";
import { apiCall } from "../lib/api";

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

interface ApiMessageUser {
  id: string;
  first_name?: string;
  last_name?: string;
  specialty?: string;
  profile_url?: string;
  photo_id?: string;
}

interface ApiMessage {
  id: string;
  patient_id: string;
  channel: string;
  text?: string;
  user_type: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  user?: ApiMessageUser;
}

interface MessagesEndpointResponse {
  success: boolean;
  data: {
    data: ApiMessage[];
  };
  message?: string;
}

interface CreateMessageEndpointResponse {
  success: boolean;
  data: ApiMessage;
  message?: string;
}

const DEFAULT_CLINICIAN_AVATAR = "https://img.heroui.chat/image/avatar?w=200&h=200&u=10";

const isPatientMessage = (message: ApiMessage) => {
  const normalizedType = message.user_type?.toLowerCase?.();
  return normalizedType === "patient" || normalizedType === "patient_user";
};

const buildDisplayName = (user?: ApiMessageUser) => {
  if (!user) return "Equipo médico";
  const parts = [user.first_name, user.last_name].filter(Boolean);
  return parts.length ? parts.join(" ") : "Equipo médico";
};

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

const mapApiMessageToUi = (message: ApiMessage): Message => {
  const patientAuthored = isPatientMessage(message);
  const user = message.user;

  const senderName = buildDisplayName(user);
  const senderRole = patientAuthored ? "Paciente" : user?.specialty || "Doctor";
  const avatarUrl = user?.profile_url || DEFAULT_CLINICIAN_AVATAR;

  return {
    id: message.id,
    sender: {
      id: message.user_id || (patientAuthored ? message.patient_id : "clinician"),
      name: senderName,
      role: senderRole,
      avatar: avatarUrl,
    },
    content: message.text || "",
    timestamp: formatTimestamp(message.created_at),
    isUser: patientAuthored,
    createdAt: message.created_at,
  };
};

export const MessengerPage: React.FC<MessengerPageProps> = ({ isMobileView = false }) => {
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

  const conversations = useMemo<Conversation[]>(() => {
    if (!messages.length) return [];

    const providerMessage = messages.find((message) => !message.isUser);
    const provider = providerMessage?.sender ?? {
      id: "clinician",
      name: "Equipo médico",
      role: "Doctor",
      avatar: DEFAULT_CLINICIAN_AVATAR,
    };

    const lastMessage = messages[messages.length - 1];

    return [
      {
        id: provider.id,
        participants: [provider],
        lastMessage: lastMessage?.content || "",
        lastMessageTime: formatConversationDate(lastMessage?.createdAt),
        unread: false,
      },
    ];
  }, [messages]);

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
      const response = await apiCall<MessagesEndpointResponse>("/messages");

      if (!response.success) {
        throw new Error(response.error || "No se pudieron cargar los mensajes");
      }

      const payload = response.data;

      if (!payload?.success) {
        throw new Error(payload?.message || "No se pudieron cargar los mensajes");
      }

      const apiMessages = payload.data?.data || [];
      const sortedMessages = [...apiMessages].sort((a, b) => {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return dateA - dateB;
      });

      setMessages(sortedMessages.map(mapApiMessageToUi));
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

  useEffect(() => {
    const interval = setInterval(() => {
      void fetchMessages(false);
    }, 15000);

    return () => clearInterval(interval);
  }, [fetchMessages]);

  const handleSendMessage = async () => {
    if (isSending || newMessage.trim() === "") return;

    const trimmedMessage = newMessage.trim();
    setIsSending(true);
    setSendError(null);

    try {
      const response = await apiCall<CreateMessageEndpointResponse>("/messages", {
        method: "POST",
        body: JSON.stringify({ text: trimmedMessage }),
      });

      if (!response.success) {
        throw new Error(response.error || "No se pudo enviar el mensaje");
      }

      const payload = response.data;

      if (!payload?.success) {
        throw new Error(payload?.message || "No se pudo enviar el mensaje");
      }

      const mappedMessage = mapApiMessageToUi(payload.data);
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
                    {isLoadingMessages ? "Cargando conversaciones..." : "No hay conversaciones disponibles"}
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
                ) : messages.length === 0 ? (
                  <div className="flex justify-center items-center h-full text-sm text-foreground-400">
                    Aún no hay mensajes disponibles.
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