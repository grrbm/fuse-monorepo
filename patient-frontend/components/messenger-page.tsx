import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Avatar, Button, Card, CardBody, Input, Spinner } from "@heroui/react";
import { Icon } from "@iconify/react";
import { apiCall, uploadFile } from "../lib/api";
import { useChat } from "../hooks/useChat";

// New interfaces for our chat system
interface ChatMessage {
  id: string;
  senderId: string;
  senderRole: 'doctor' | 'patient';
  message: string;
  createdAt: string;
  read: boolean;
  attachments?: string[]; // URLs of attached files
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
  attachments?: string[]; // URLs of attached files
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
      name: isPatient ? "You" : doctorName,
      role: isPatient ? "Patient" : "Doctor",
      avatar: DEFAULT_CLINICIAN_AVATAR,
    },
    content: message.message,
    timestamp: formatTimestamp(message.createdAt),
    isUser: isPatient,
    createdAt: message.createdAt,
    attachments: message.attachments, // Preserve attachments
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

  // File attachments
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Toast notifications
  const [toasts, setToasts] = useState<Array<{ id: string; type: 'success' | 'error' | 'info'; message: string }>>([]);

  // Get auth token from localStorage
  const [authToken, setAuthToken] = useState<string | null>(null);

  const showToast = useCallback((type: 'success' | 'error' | 'info', message: string) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 5000);
  }, []);

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
        : "You";

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
          // Check if it's an auth error
          if (response.error?.includes('401') || response.error?.includes('token') || response.error?.includes('Unauthorized')) {
            throw new Error("Your session has expired. Please sign in again to continue.");
          }
          throw new Error(response.error || "Could not load chat");
        }

        const chatDataResponse = response.data?.data;

        if (!chatDataResponse) {
          // No chat found - patient doesn't have an assigned doctor yet
          setChatData(null);
          setMessages([]);
          showToast('info', "You don't have an assigned doctor yet. Once you're assigned a doctor, you'll be able to chat here.");
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
        console.error("❌ Error loading messages:", error);
        const errorMessage = error instanceof Error ? error.message : "Could not load messages";
        setLoadError(errorMessage);

        // If it's an auth error, redirect to signin after a delay
        if (errorMessage.includes('session has expired') || errorMessage.includes('sign in')) {
          setTimeout(() => {
            window.location.href = '/signin';
          }, 3000);
        }
      } finally {
        setIsLoadingMessages(false);
        isFetchingRef.current = false;
      }
    };

    loadMessages();
  }, []); // Only load once on mount - WebSocket handles real-time updates

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Validate file count (max 10)
    if (selectedFiles.length + files.length > 10) {
      showToast('error', "Maximum 10 files per message");
      return;
    }

    // Validate file sizes (max 5MB each)
    const invalidFiles = files.filter(f => f.size > 5 * 1024 * 1024);
    if (invalidFiles.length > 0) {
      showToast('error', `Files too large: ${invalidFiles.map(f => f.name).join(', ')}. Maximum 5MB per file.`);
      return;
    }

    // Validate file types
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
    const invalidTypes = files.filter(f => !validTypes.includes(f.type));
    if (invalidTypes.length > 0) {
      showToast('error', `File types not allowed: ${invalidTypes.map(f => f.name).join(', ')}. Only images and PDFs.`);
      return;
    }

    setSelectedFiles(prev => [...prev, ...files]);
    setSendError(null);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Remove file from selection
  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSendMessage = async () => {
    // Validate: need doctor assigned
    if (!chatData) {
      showToast('error', "You can't send messages until you have an assigned doctor.");
      return;
    }

    // Validate: need message or files
    if (newMessage.trim() === "" && selectedFiles.length === 0) {
      showToast('info', "Please enter a message or attach a file.");
      return;
    }

    // Already sending
    if (isSending) return;

    const trimmedMessage = newMessage.trim();
    setIsSending(true);
    setUploadingFiles(true);
    setSendError(null);

    try {
      // Upload files first if any
      const uploadedUrls: string[] = [];

      if (selectedFiles.length > 0) {
        for (const file of selectedFiles) {
          console.log(`📤 Uploading file: ${file.name}`);
          const uploadResult = await uploadFile(file);

          if (!uploadResult.success) {
            const errorMsg = `Error uploading ${file.name}: ${uploadResult.error}`;
            showToast('error', errorMsg);
            throw new Error(errorMsg);
          }

          uploadedUrls.push(uploadResult.data!.url);
        }
        console.log('✅ All files uploaded:', uploadedUrls);
      }

      setUploadingFiles(false);

      // Send message with attachments
      const response = await apiCall<SendMessageResponse>("/patient/chat/messages", {
        method: "POST",
        body: JSON.stringify({
          message: trimmedMessage,
          attachments: uploadedUrls.length > 0 ? uploadedUrls : undefined
        }),
      });

      if (!response.success) {
        // Check if it's an auth error
        if (response.error?.includes('401') || response.error?.includes('token') || response.error?.includes('Unauthorized')) {
          showToast('error', "Your session has expired. Redirecting to sign in...");
          setTimeout(() => {
            window.location.href = '/signin';
          }, 2000);
          return;
        }
        throw new Error(response.error || "Could not send message");
      }

      const payload = response.data?.data;

      if (!payload) {
        throw new Error("No response received from server");
      }

      // Update chat data (WebSocket will handle adding the message to UI)
      setChatData(payload.chat);

      // Clear inputs - the message will appear via WebSocket
      setNewMessage("");
      setSelectedFiles([]);
      setSendError(null);

      // Show success toast only if there were files uploaded
      if (uploadedUrls.length > 0) {
        showToast('success', `Message sent with ${uploadedUrls.length} file${uploadedUrls.length > 1 ? 's' : ''}`);
      }
    } catch (error) {
      console.error("❌ Error sending message:", error);
      const errorMessage = error instanceof Error ? error.message : "Could not send message";
      setSendError(errorMessage);
      showToast('error', errorMessage);

      // If it's an auth error, redirect to signin
      if (errorMessage.includes('session has expired') || errorMessage.includes('Unauthorized')) {
        setTimeout(() => {
          window.location.href = '/signin';
        }, 2000);
      }
    } finally {
      setIsSending(false);
      setUploadingFiles(false);
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
          <h1 className="text-2xl font-semibold">Chat with your Doctor</h1>
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
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {isLoadingMessages ? (
                <div className="flex justify-center items-center h-full">
                  <Spinner color="primary" label="Loading messages..." labelColor="primary" />
                </div>
              ) : loadError ? (
                <div className="text-center text-sm text-danger-600 bg-danger-50 border border-danger-100 rounded-md p-4">
                  {loadError}
                </div>
              ) : !chatData ? (
                <div className="flex justify-center items-center h-full text-sm text-foreground-400 text-center px-4">
                  You don't have an assigned doctor yet. Once you're assigned a doctor, you'll be able to chat here.
                </div>
              ) : messages.length === 0 ? (
                <div className="flex justify-center items-center h-full text-sm text-foreground-400">
                  No messages yet. Write the first one!
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
                          className={`p-3 rounded-lg ${message.isUser
                            ? "bg-primary text-white"
                            : "bg-content2 text-foreground"
                            }`}
                        >
                          {message.content && <p>{message.content}</p>}

                          {/* Show attachments if any */}
                          {(message as any).attachments && (message as any).attachments.length > 0 && (
                            <div className={`${message.content ? 'mt-2' : ''} space-y-2`}>
                              {(message as any).attachments.map((url: string, idx: number) => {
                                const isImage = url.match(/\.(jpg|jpeg|png|webp)$/i);
                                const fileName = url.split('/').pop() || 'file';

                                return (
                                  <div key={idx}>
                                    {isImage ? (
                                      <a href={url} target="_blank" rel="noopener noreferrer">
                                        <img
                                          src={url}
                                          alt={fileName}
                                          className="max-w-full max-h-[200px] rounded cursor-pointer hover:opacity-80 transition-opacity"
                                        />
                                      </a>
                                    ) : (
                                      <a
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`flex items-center gap-2 p-2 rounded ${message.isUser
                                          ? 'bg-primary-600 hover:bg-primary-700'
                                          : 'bg-content3 hover:bg-content4'
                                          } transition-colors`}
                                      >
                                        <Icon icon="lucide:file-text" width={20} />
                                        <span className="text-sm truncate max-w-[200px]">{fileName}</span>
                                        <Icon icon="lucide:download" width={16} />
                                      </a>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
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
              {/* Selected files preview */}
              {selectedFiles.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-2">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="flex items-center gap-2 bg-content2 rounded-lg px-3 py-2">
                      <Icon
                        icon={file.type.startsWith('image/') ? "lucide:image" : "lucide:file-text"}
                        className="text-foreground-500"
                      />
                      <span className="text-sm text-foreground-700 max-w-[150px] truncate">
                        {file.name}
                      </span>
                      <button
                        onClick={() => handleRemoveFile(index)}
                        className="text-danger-500 hover:text-danger-700"
                        disabled={isSending}
                      >
                        <Icon icon="lucide:x" width={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2 items-center">
                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {/* Attach file button */}
                <Button
                  isIconOnly
                  variant="light"
                  aria-label="Attach file"
                  onPress={() => {
                    if (!chatData) {
                      showToast('error', "You can't attach files until you have an assigned doctor.");
                      return;
                    }
                    fileInputRef.current?.click();
                  }}
                  isDisabled={!chatData || isSending || selectedFiles.length >= 10}
                >
                  <Icon icon="lucide:paperclip" className="text-foreground-500" />
                </Button>

                <div className="flex-1">
                  <Input
                    placeholder={!chatData ? "Assign a doctor to start messaging..." : "Type a message..."}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    isDisabled={isSending || !chatData}
                    className="w-full"
                  />
                </div>

                <Button
                  isIconOnly
                  color="primary"
                  aria-label="Send message"
                  onPress={() => void handleSendMessage()}
                  isDisabled={!chatData || (newMessage.trim() === "" && selectedFiles.length === 0) || isSending}
                  isLoading={uploadingFiles}
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

      {/* Toast notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`px-4 py-3 rounded-lg shadow-lg text-white min-w-[300px] max-w-md animate-slide-in-right ${toast.type === 'success' ? 'bg-success-500' :
              toast.type === 'error' ? 'bg-danger-500' :
                'bg-primary-500'
              }`}
          >
            <div className="flex items-start gap-3">
              <Icon
                icon={
                  toast.type === 'success' ? 'lucide:check-circle' :
                    toast.type === 'error' ? 'lucide:alert-circle' :
                      'lucide:info'
                }
                width={20}
                className="flex-shrink-0 mt-0.5"
              />
              <p className="text-sm flex-1">{toast.message}</p>
              <button
                onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
                className="flex-shrink-0 hover:opacity-80 transition-opacity"
              >
                <Icon icon="lucide:x" width={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};