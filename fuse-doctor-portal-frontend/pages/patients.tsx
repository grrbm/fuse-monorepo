import { useState, useEffect, useCallback, useRef } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { Search, Phone, Video, MoreVertical, Paperclip, X, Image, FileText } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Chat, ChatMessage } from '@/lib/api';
import { format, formatDistanceToNow } from 'date-fns';
import { useChat } from '@/hooks/useChat';

export default function Patients() {
    const { apiClient, token } = useAuth();
    const [chats, setChats] = useState<Chat[]>([]);
    const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [messageInput, setMessageInput] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [uploadingFiles, setUploadingFiles] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // WebSocket handler for new messages
    const handleNewMessage = useCallback((message: ChatMessage) => {
        console.log('📨 New message received via WebSocket:', message);
        
        // Update selectedChat if this message belongs to it
        setSelectedChat(prevChat => {
            if (!prevChat) return null;
            
            // Check if message already exists to avoid duplicates
            const messageExists = prevChat.messages.some(m => m.id === message.id);
            if (messageExists) return prevChat;
            
            return {
                ...prevChat,
                messages: [...prevChat.messages, message],
                lastMessageAt: message.createdAt,
            };
        });

        // Update chats list
        setChats(prevChats => {
            return prevChats.map(chat => {
                // Find the chat this message belongs to
                const belongsToChat = message.senderRole === 'patient' 
                    ? chat.patientId === message.senderId
                    : chat.doctorId === message.senderId;
                
                if (!belongsToChat) return chat;

                // Check if message already exists
                const messageExists = chat.messages.some(m => m.id === message.id);
                if (messageExists) return chat;

                return {
                    ...chat,
                    messages: [...chat.messages, message],
                    lastMessageAt: message.createdAt,
                    unreadCountDoctor: message.senderRole === 'patient' 
                        ? chat.unreadCountDoctor + 1 
                        : chat.unreadCountDoctor,
                };
            });
        });
    }, []);

    // Initialize WebSocket
    const { connect, disconnect } = useChat({
        onNewMessage: handleNewMessage,
    });

    // Connect WebSocket when component mounts
    useEffect(() => {
        if (token) {
            connect(token);
        }
        return () => {
            disconnect();
        };
    }, [token, connect, disconnect]);

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [selectedChat?.messages]);

    // Fetch all chats on mount
    useEffect(() => {
        fetchChats();
    }, []);

    const fetchChats = async () => {
        try {
            setLoading(true);
            const response = await apiClient.fetchChats();
            if (response.success) {
                setChats(response.data);
                if (response.data.length > 0 && !selectedChat) {
                    setSelectedChat(response.data[0]);
                }
            }
        } catch (error) {
            console.error('Error fetching chats:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        
        // Filter only valid file types (images and PDFs)
        const validFiles = files.filter(file => {
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
            return validTypes.includes(file.type) && file.size <= 5 * 1024 * 1024; // 5MB max
        });

        // Limit to 10 files total
        const newFiles = [...selectedFiles, ...validFiles].slice(0, 10);
        setSelectedFiles(newFiles);

        // Reset input value so same file can be selected again
        if (e.target) {
            e.target.value = '';
        }
    };

    const handleRemoveFile = (index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if ((!messageInput.trim() && selectedFiles.length === 0) || !selectedChat || sending) return;

        try {
            setSending(true);
            setUploadingFiles(true);

            // Upload files first if any
            const attachmentUrls: string[] = [];
            if (selectedFiles.length > 0) {
                for (const file of selectedFiles) {
                    const uploadResult = await apiClient.uploadFile(file);
                    if (uploadResult.success && uploadResult.data) {
                        attachmentUrls.push(uploadResult.data.url);
                    } else {
                        console.error('Failed to upload file:', file.name, uploadResult.error);
                        alert(`Failed to upload ${file.name}. ${uploadResult.error || 'Please try again.'}`);
                        return;
                    }
                }
            }

            setUploadingFiles(false);

            // Send message with attachments
            const response = await apiClient.sendMessage(
                selectedChat.id, 
                messageInput.trim(), 
                attachmentUrls.length > 0 ? attachmentUrls : undefined
            );
            
            if (response.success) {
                // Clear inputs - WebSocket will handle updating the UI
                setMessageInput('');
                setSelectedFiles([]);
                
                // Update chat data (without messages, WebSocket handles that)
                setChats(prevChats => 
                    prevChats.map(chat => 
                        chat.id === response.data.chat.id 
                            ? { ...chat, lastMessageAt: response.data.chat.lastMessageAt }
                            : chat
                    )
                );
            }
        } catch (error) {
            console.error('Error sending message:', error);
            alert('Failed to send message. Please try again.');
        } finally {
            setSending(false);
            setUploadingFiles(false);
        }
    };

    const handleSelectChat = async (chat: Chat) => {
        setSelectedChat(chat);
        
        // Mark as read if there are unread messages
        if (chat.unreadCountDoctor > 0) {
            try {
                const response = await apiClient.markChatAsRead(chat.id);
                if (response.success) {
                    // Update the chat in the list - preserve existing properties (like patient)
                    const updatedChat = {
                        ...chat,
                        unreadCountDoctor: 0,
                        messages: response.data.messages || chat.messages
                    };
                    
                    setChats(prevChats =>
                        prevChats.map(c => c.id === chat.id ? updatedChat : c)
                    );
                    setSelectedChat(updatedChat);
                }
            } catch (error) {
                console.error('Error marking chat as read:', error);
            }
        }
    };

    const getInitials = (firstName: string, lastName: string) => {
        return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    };

    const formatTimestamp = (timestamp: string) => {
        try {
            const date = new Date(timestamp);
            const now = new Date();
            const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

            if (diffInHours < 24) {
                return format(date, 'h:mm a');
            } else if (diffInHours < 48) {
                return 'Yesterday';
            } else if (diffInHours < 168) {
                return `${Math.floor(diffInHours / 24)} days ago`;
            } else {
                return formatDistanceToNow(date, { addSuffix: true });
            }
        } catch {
            return timestamp;
        }
    };

    const getLastMessage = (messages: ChatMessage[]) => {
        if (!messages || messages.length === 0) return 'No messages yet';
        const lastMsg = messages[messages.length - 1];
        return lastMsg.message;
    };

    const filteredChats = chats.filter(chat => {
        if (!chat.patient) return false;
        return `${chat.patient.firstName} ${chat.patient.lastName}`.toLowerCase().includes(searchQuery.toLowerCase());
    });

    if (loading) {
        return (
            <div className="flex h-screen bg-background">
                <Sidebar />
                <div className="flex-1 flex flex-col overflow-hidden">
                    <Header />
                    <main className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <p className="text-lg text-muted-foreground">Loading chats...</p>
                        </div>
                    </main>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-background">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-hidden">
                    <div className="h-full flex">
                        {/* Conversations List */}
                        <div className="w-80 border-r border-border bg-card flex flex-col">
                            {/* Search Header */}
                            <div className="p-4 border-b border-border">
                                <h2 className="text-xl font-semibold mb-3">Messages</h2>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <input
                                        type="text"
                                        placeholder="Search patients..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                                    />
                                </div>
                            </div>

                            {/* Conversations List */}
                            <div className="flex-1 overflow-y-auto">
                                {filteredChats.length === 0 ? (
                                    <div className="p-4 text-center text-muted-foreground">
                                        <p>No conversations found</p>
                                    </div>
                                ) : (
                                    filteredChats.map((chat) => {
                                        if (!chat.patient) return null;
                                        return (
                                            <div
                                                key={chat.id}
                                                onClick={() => handleSelectChat(chat)}
                                        className={`p-4 border-b border-border cursor-pointer transition-colors hover:bg-accent ${
                                                    selectedChat?.id === chat.id ? 'bg-accent' : ''
                                        }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">
                                                        {getInitials(chat.patient.firstName, chat.patient.lastName)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-1">
                                                    <h3 className="font-semibold text-sm truncate">
                                                                {chat.patient.firstName} {chat.patient.lastName}
                                                    </h3>
                                                    <span className="text-xs text-muted-foreground">
                                                                {formatTimestamp(chat.lastMessageAt)}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <p className="text-sm text-muted-foreground truncate">
                                                                {getLastMessage(chat.messages)}
                                                    </p>
                                                            {chat.unreadCountDoctor > 0 && (
                                                        <span className="ml-2 bg-primary text-primary-foreground text-xs font-semibold px-2 py-0.5 rounded-full">
                                                                    {chat.unreadCountDoctor}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>

                        {/* Chat Window */}
                        <div className="flex-1 flex flex-col bg-background">
                            {selectedChat && selectedChat.patient ? (
                                <>
                                    {/* Chat Header */}
                                    <div className="p-4 border-b border-border bg-card">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">
                                                    {getInitials(selectedChat.patient.firstName, selectedChat.patient.lastName)}
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold">
                                                        {selectedChat.patient.firstName} {selectedChat.patient.lastName}
                                                    </h3>
                                                    <p className="text-xs text-muted-foreground">{selectedChat.patient.email}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button className="p-2 hover:bg-accent rounded-full transition-colors">
                                                    <Phone className="h-5 w-5 text-foreground" />
                                                </button>
                                                <button className="p-2 hover:bg-accent rounded-full transition-colors">
                                                    <Video className="h-5 w-5 text-foreground" />
                                                </button>
                                                <button className="p-2 hover:bg-accent rounded-full transition-colors">
                                                    <MoreVertical className="h-5 w-5 text-foreground" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Messages Area */}
                                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                        {selectedChat.messages.length === 0 ? (
                                            <div className="flex items-center justify-center h-full text-muted-foreground">
                                                <p>No messages yet. Start the conversation!</p>
                                            </div>
                                        ) : (
                                            <>
                                                {selectedChat.messages.map((message) => (
                                            <div
                                                key={message.id}
                                                className={`flex ${
                                                            message.senderRole === 'doctor' ? 'justify-end' : 'justify-start'
                                                }`}
                                            >
                                                <div
                                                    className={`max-w-[70%] ${
                                                                message.senderRole === 'doctor'
                                                            ? 'bg-primary text-primary-foreground'
                                                            : 'bg-muted text-foreground'
                                                    } rounded-lg px-4 py-2 shadow-sm`}
                                                >
                                                            {message.message && <p className="text-sm">{message.message}</p>}
                                                            
                                                            {/* Show attachments if any */}
                                                            {(message as any).attachments && (message as any).attachments.length > 0 && (
                                                                <div className={`${message.message ? 'mt-2' : ''} space-y-2`}>
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
                                                                                        className={`flex items-center gap-2 p-2 rounded ${
                                                                                            message.senderRole === 'doctor'
                                                                                                ? 'bg-primary-foreground/10 hover:bg-primary-foreground/20'
                                                                                                : 'bg-muted-foreground/10 hover:bg-muted-foreground/20'
                                                                                        } transition-colors`}
                                                                                    >
                                                                                        <FileText className="h-5 w-5" />
                                                                                        <span className="text-sm truncate max-w-[200px]">{fileName}</span>
                                                                                    </a>
                                                                                )}
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            )}
                                                            
                                                    <p
                                                        className={`text-xs mt-1 ${
                                                                    message.senderRole === 'doctor'
                                                                ? 'text-primary-foreground/70'
                                                                : 'text-muted-foreground'
                                                        }`}
                                                    >
                                                                {formatTimestamp(message.createdAt)}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                                <div ref={messagesEndRef} />
                                            </>
                                        )}
                                    </div>

                                    {/* Message Input */}
                                    <div className="p-4 border-t border-border bg-card">
                                        {/* Selected files preview */}
                                        {selectedFiles.length > 0 && (
                                            <div className="mb-2 flex flex-wrap gap-2">
                                                {selectedFiles.map((file, index) => (
                                                    <div key={index} className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2">
                                                        {file.type.startsWith('image/') ? (
                                                            <Image className="h-4 w-4 text-foreground" />
                                                        ) : (
                                                            <FileText className="h-4 w-4 text-foreground" />
                                                        )}
                                                        <span className="text-sm text-foreground max-w-[150px] truncate">
                                                            {file.name}
                                                        </span>
                                                        <button
                                                            onClick={() => handleRemoveFile(index)}
                                                            className="text-muted-foreground hover:text-foreground"
                                                            disabled={sending}
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        <form onSubmit={handleSendMessage} className="flex gap-2">
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
                                            <button
                                                type="button"
                                                onClick={() => fileInputRef.current?.click()}
                                                disabled={sending || selectedFiles.length >= 10}
                                                className="px-3 py-2 border border-input rounded-lg bg-background hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                title="Attach file"
                                            >
                                                <Paperclip className="h-5 w-5 text-foreground" />
                                            </button>

                                            <input
                                                type="text"
                                                placeholder="Type a message..."
                                                value={messageInput}
                                                onChange={(e) => setMessageInput(e.target.value)}
                                                disabled={sending}
                                                className="flex-1 px-4 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                                            />
                                            <button
                                                type="submit"
                                                disabled={(!messageInput.trim() && selectedFiles.length === 0) || sending}
                                                className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            >
                                                {uploadingFiles ? 'Uploading...' : sending ? 'Sending...' : 'Send'}
                                            </button>
                                        </form>
                                    </div>
                                </>
                            ) : (
                                <div className="flex-1 flex items-center justify-center text-muted-foreground">
                                    <div className="text-center">
                                        <p className="text-lg">Select a conversation to start</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

