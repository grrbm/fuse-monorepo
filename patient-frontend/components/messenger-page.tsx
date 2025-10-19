import React from "react";
import { motion } from "framer-motion";
import { Avatar, Button, Card, CardBody, Input, Tabs, Tab, Skeleton } from "@heroui/react";
import { Icon } from "@iconify/react";
import { apiCall } from "../lib/api";

interface MDMessage {
  id: string;
  user_type: 'patient' | 'clinician';
  content: string;
  created_at: string;
  channel?: string;
}

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

export const MessengerPage: React.FC<MessengerPageProps> = ({ isMobileView = false }) => {
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSending, setIsSending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [newMessage, setNewMessage] = React.useState("");
  const [selectedTab, setSelectedTab] = React.useState("inbox");
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const [showConversationList, setShowConversationList] = React.useState(!isMobileView);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [hasMore, setHasMore] = React.useState(true);

  React.useEffect(() => {
    loadMessages();
  }, []);

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const convertMDMessageToMessage = (mdMsg: MDMessage): Message => {
    const isUser = mdMsg.user_type === 'patient';
    const timestamp = new Date(mdMsg.created_at);
    
    return {
      id: mdMsg.id,
      sender: {
        id: isUser ? 'patient' : 'clinician',
        name: isUser ? 'You' : 'Your Doctor',
        role: isUser ? 'Patient' : 'Clinician',
        avatar: isUser 
          ? "https://img.heroui.chat/image/avatar?w=200&h=200&u=1"
          : "https://img.heroui.chat/image/avatar?w=200&h=200&u=10"
      },
      content: mdMsg.content,
      timestamp: timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isUser
    };
  };

  const loadMessages = async (page: number = 1) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await apiCall<{ data: MDMessage[] }>(`/messages?page=${page}&per_page=15&channel=patient`);
      
      if (result.success && result.data) {
        const mdMessages = result.data.data || result.data;
        const convertedMessages = Array.isArray(mdMessages) 
          ? mdMessages.map(convertMDMessageToMessage)
          : [];
        
        setMessages(convertedMessages.reverse()); // Reverse to show oldest first
        setHasMore(convertedMessages.length === 15);
      } else {
        setError(result.error || 'Failed to load messages');
      }
    } catch (err) {
      console.error('Error loading messages:', err);
      setError('Failed to load messages. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async () => {
    if (newMessage.trim() === "" || isSending) return;

    setIsSending(true);
    const messageText = newMessage;
    setNewMessage(""); // Clear input immediately for better UX

    try {
      const result = await apiCall('/messages', {
        method: 'POST',
        body: JSON.stringify({
          text: messageText,
          channel: 'patient'
        })
      });

      if (result.success && result.data) {
        // Add the sent message to the list
        const newMsg: Message = {
          id: result.data.id || `temp-${Date.now()}`,
          sender: {
            id: "patient",
            name: "You",
            role: "Patient",
            avatar: "https://img.heroui.chat/image/avatar?w=200&h=200&u=1"
          },
          content: messageText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isUser: true
        };
        
        setMessages([...messages, newMsg]);
      } else {
        // Restore message on error
        setNewMessage(messageText);
        setError(result.error || 'Failed to send message');
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setNewMessage(messageText); // Restore message on error
      setError('Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleBackToList = () => {
    setShowConversationList(true);
  };

  const handleSelectConversation = (conversationId: string) => {
    // In a real app, you would load the selected conversation
    if (isMobileView) {
      setShowConversationList(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex flex-col">
        <h1 className="text-2xl font-semibold mb-4">Messenger</h1>
        <Card className="flex-1 border border-content3">
          <CardBody className="p-6 flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="w-3/4 h-4 rounded-lg" />
                  <Skeleton className="w-1/2 h-3 rounded-lg" />
                </div>
              </div>
            ))}
          </CardBody>
        </Card>
      </div>
    );
  }

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
      
      {error && (
        <div className="mb-4 p-3 bg-danger-50 border border-danger-200 rounded-lg flex items-center gap-2">
          <Icon icon="lucide:alert-circle" className="text-danger" />
          <p className="text-sm text-danger flex-1">{error}</p>
          <Button 
            size="sm" 
            variant="light" 
            isIconOnly
            onPress={() => setError(null)}
          >
            <Icon icon="lucide:x" />
          </Button>
        </div>
      )}
      
      <div className="flex flex-1 gap-6 h-[calc(100%-2rem)] overflow-hidden">
        {/* Chat Interface - Direct patient-doctor communication */}
        <Card className="flex-1 border border-content3 overflow-hidden">
          <CardBody className="p-0 flex flex-col h-full">
            {/* Chat header */}
            <div className="flex items-center gap-3 p-4 border-b border-content3">
              <Avatar src="https://img.heroui.chat/image/avatar?w=200&h=200&u=10" size="md" />
              <div className="flex-1">
                <h3 className="font-medium">Your Healthcare Provider</h3>
                <p className="text-sm text-foreground-500">Secure Messaging</p>
              </div>
              <div className="flex gap-2">
                <Button isIconOnly variant="light" aria-label="More options">
                  <Icon icon="lucide:more-vertical" className="text-foreground-500" />
                </Button>
              </div>
            </div>
              
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length > 0 ? (
                  <>
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}
                      >
                        <div className={`flex gap-3 max-w-[80%] ${message.isUser ? "flex-row-reverse" : ""}`}>
                          {!message.isUser && (
                            <Avatar src={message.sender.avatar} size="sm" className="mt-1" />
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
                    ))}
                    <div ref={messagesEndRef} />
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="bg-content2 p-4 rounded-full mb-4">
                      <Icon icon="lucide:message-square" className="text-3xl text-foreground-400" />
                    </div>
                    <h3 className="text-lg font-medium mb-1">No messages yet</h3>
                    <p className="text-foreground-500 text-sm max-w-sm">
                      Start a conversation with your healthcare provider. Send a message below to get started.
                    </p>
                  </div>
                )}
              </div>
            
            {/* Message input */}
            <div className="p-3 border-t border-content3">
              <div className="flex gap-2 items-center">
                <div className="flex-1">
                  <Input
                    placeholder="Type a message to your healthcare provider..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    endContent={
                      <Button isIconOnly variant="light" size="sm" aria-label="Attach file">
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
                  onPress={handleSendMessage}
                  isLoading={isSending}
                  isDisabled={isSending || newMessage.trim() === ""}
                >
                  <Icon icon="lucide:send" />
                </Button>
              </div>
              
              <p className="text-xs text-foreground-400 mt-2 flex items-center gap-1">
                <Icon icon="lucide:lock" width={12} />
                Messages are encrypted and HIPAA-compliant
              </p>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};