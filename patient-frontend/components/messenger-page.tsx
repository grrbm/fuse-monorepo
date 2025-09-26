import React from "react";
import { motion } from "framer-motion";
import { Avatar, Button, Card, CardBody, Input, Tabs, Tab } from "@heroui/react";
import { Icon } from "@iconify/react";

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
  const [messages, setMessages] = React.useState<Message[]>([
    {
      id: "1",
      sender: {
        id: "doctor1",
        name: "Dr. Sarah Johnson",
        role: "Cardiologist",
        avatar: "https://img.heroui.chat/image/avatar?w=200&h=200&u=10"
      },
      content: "Hello John, I hope you're doing well. I've reviewed your recent test results and everything looks good. Your blood pressure has improved since your last visit.",
      timestamp: "10:30 AM",
      isUser: false
    },
    {
      id: "2",
      sender: {
        id: "user",
        name: "John Doe",
        role: "Patient",
        avatar: "https://img.heroui.chat/image/avatar?w=200&h=200&u=1"
      },
      content: "That's great news! I've been taking my medication regularly and trying to exercise more.",
      timestamp: "10:35 AM",
      isUser: true
    },
    {
      id: "3",
      sender: {
        id: "doctor1",
        name: "Dr. Sarah Johnson",
        role: "Cardiologist",
        avatar: "https://img.heroui.chat/image/avatar?w=200&h=200&u=10"
      },
      content: "That's excellent. The lifestyle changes are clearly making a difference. I would like to discuss adjusting your medication dosage during your next visit.",
      timestamp: "10:40 AM",
      isUser: false
    },
    {
      id: "4",
      sender: {
        id: "user",
        name: "John Doe",
        role: "Patient",
        avatar: "https://img.heroui.chat/image/avatar?w=200&h=200&u=1"
      },
      content: "When would you recommend scheduling my next appointment?",
      timestamp: "10:45 AM",
      isUser: true
    },
    {
      id: "5",
      sender: {
        id: "doctor2",
        name: "Dr. Michael Chen",
        role: "General Physician",
        avatar: "https://img.heroui.chat/image/avatar?w=200&h=200&u=11"
      },
      content: "I think we should meet in about 3 weeks. Please schedule with the front desk. Continue with your current medication until then.",
      timestamp: "10:50 AM",
      isUser: false
    }
  ]);

  const [conversations, setConversations] = React.useState<Conversation[]>([
    {
      id: "1",
      participants: [
        {
          id: "doctor1",
          name: "Dr. Sarah Johnson",
          role: "Cardiologist",
          avatar: "https://img.heroui.chat/image/avatar?w=200&h=200&u=10"
        }
      ],
      lastMessage: "Your test results look good. I would like to discu...",
      lastMessageTime: "Oct 4",
      unread: false
    },
    {
      id: "2",
      participants: [
        {
          id: "doctor2",
          name: "Dr. Michael Chen",
          role: "General Physician",
          avatar: "https://img.heroui.chat/image/avatar?w=200&h=200&u=11"
        }
      ],
      lastMessage: "Please remember to take your medication as pre...",
      lastMessageTime: "Oct 2",
      unread: false
    },
    {
      id: "3",
      participants: [
        {
          id: "nurse1",
          name: "Nurse Emily Rodriguez",
          role: "Clinic Staff",
          avatar: "https://img.heroui.chat/image/avatar?w=200&h=200&u=12"
        }
      ],
      lastMessage: "Your appointment has been confirmed for next T...",
      lastMessageTime: "Sep 30",
      unread: false
    }
  ]);

  const [newMessage, setNewMessage] = React.useState("");
  const [selectedTab, setSelectedTab] = React.useState("inbox");
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const [showConversationList, setShowConversationList] = React.useState(!isMobileView);

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = () => {
    if (newMessage.trim() === "") return;

    const newMsg: Message = {
      id: `${messages.length + 1}`,
      sender: {
        id: "user",
        name: "John Doe",
        role: "Patient",
        avatar: "https://img.heroui.chat/image/avatar?w=200&h=200&u=1"
      },
      content: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isUser: true
    };

    setMessages([...messages, newMsg]);
    setNewMessage("");
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
                />
                <Tabs 
                  selectedKey={selectedTab} 
                  onSelectionChange={(key) => setSelectedTab(key as string)}
                  variant="light"
                  size="sm"
                  className="w-full"
                >
                  <Tab key="inbox" title="Inbox" />
                  <Tab key="sent" title="Sent" />
                  <Tab key="archived" title="Archived" />
                </Tabs>
              </div>
              
              <div className="flex-1 overflow-y-auto">
                {conversations.map((conversation) => (
                  <div 
                    key={conversation.id}
                    className={`flex items-center gap-3 p-3 hover:bg-content2 cursor-pointer transition-colors ${
                      conversation.id === "1" ? "border-l-4 border-primary bg-primary-50" : ""
                    }`}
                    onClick={() => handleSelectConversation(conversation.id)}
                  >
                    <Avatar src={conversation.participants[0].avatar} size="md" />
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
                ))}
              </div>
              
              <div className="p-3 border-t border-content3">
                <Button 
                  color="primary" 
                  className="w-full"
                  startContent={<Icon icon="lucide:plus" />}
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
                <Avatar src="https://img.heroui.chat/image/avatar?w=200&h=200&u=10" size="md" />
                <div className="flex-1">
                  <h3 className="font-medium">Dr. Sarah Johnson</h3>
                  <p className="text-sm text-foreground-500">Cardiologist</p>
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
                  >
                    <Icon icon="lucide:send" />
                  </Button>
                </div>
                
                <div className="flex mt-3">
                  <Button
                    color="primary"
                    variant="flat"
                    className="flex-1"
                    startContent={<Icon icon="lucide:user-round" />}
                    size={isMobileView ? "sm" : "md"}
                  >
                    Doctor
                  </Button>
                  <Button
                    variant="flat"
                    className="flex-1"
                    startContent={<Icon icon="lucide:headphones" />}
                    size={isMobileView ? "sm" : "md"}
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