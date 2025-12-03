import React, { useState, useEffect, useRef } from "react";
import { Button, Avatar, Input, Spinner } from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";
import { apiCall } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";

interface Ticket {
  id: string;
  title: string;
  description: string;
  status: "new" | "in_progress" | "resolved" | "closed";
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  messages?: TicketMessage[];
}

interface TicketMessage {
  id: string;
  message: string;
  senderType: "user" | "support" | "system";
  sender: {
    firstName: string;
    lastName: string;
  };
  createdAt: string;
}

export const SupportChat: React.FC = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [showNewTicketForm, setShowNewTicketForm] = useState(false);
  const [newTicketTitle, setNewTicketTitle] = useState("");
  const [newTicketDescription, setNewTicketDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Fetch user's tickets
  const fetchTickets = async () => {
    const token = localStorage.getItem('auth-token');
    if (!token) return;
    
    setLoading(true);

    try {
      const response = await apiCall("/support/tickets", {
        method: "GET",
      });

      if (response.success && response.data?.data?.tickets) {
        const ticketsList = response.data.data.tickets;
        setTickets(ticketsList);
        
        // Auto-select first ticket if exists and no ticket is currently selected
        if (ticketsList.length > 0 && !selectedTicket) {
          fetchTicketDetails(ticketsList[0].id);
        }
      } else {
        setTickets([]);
      }
    } catch (error) {
      console.error("Error fetching tickets:", error);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch ticket details with messages
  const fetchTicketDetails = async (ticketId: string) => {
    const token = localStorage.getItem('auth-token');
    if (!token) return;
    setLoadingMessages(true);

    try {
      const response = await apiCall(`/support/tickets/${ticketId}`, {
        method: "GET",
      });

      if (response.success && response.data?.data) {
        setSelectedTicket(response.data.data);
        setTimeout(scrollToBottom, 100);
      }
    } catch (error) {
      console.error("Error fetching ticket details:", error);
    } finally {
      setLoadingMessages(false);
    }
  };

  // Create new ticket
  const handleCreateTicket = async () => {
    const token = localStorage.getItem('auth-token');
    if (!token || !newTicketTitle.trim() || !newTicketDescription.trim()) return;
    setCreating(true);

    try {
      const response = await apiCall("/support/tickets", {
        method: "POST",
        body: JSON.stringify({
          title: newTicketTitle,
          description: newTicketDescription,
        }),
      });

      if (response.success && response.data?.data) {
        setNewTicketTitle("");
        setNewTicketDescription("");
        setShowNewTicketForm(false);
        await fetchTickets();
        setSelectedTicket(response.data.data);
      }
    } catch (error) {
      console.error("Error creating ticket:", error);
    } finally {
      setCreating(false);
    }
  };

  // Send message to ticket
  const handleSendMessage = async () => {
    const token = localStorage.getItem('auth-token');
    if (!token || !selectedTicket || !newMessage.trim()) return;
    setSending(true);

    try {
      const response = await apiCall(`/support/tickets/${selectedTicket.id}/messages`, {
        method: "POST",
        body: JSON.stringify({
          message: newMessage,
        }),
      });

      if (response.success) {
        setNewMessage("");
        await fetchTicketDetails(selectedTicket.id);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [selectedTicket?.messages]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new": return "bg-blue-100 text-blue-700";
      case "in_progress": return "bg-yellow-100 text-yellow-700";
      case "resolved": return "bg-green-100 text-green-700";
      case "closed": return "bg-gray-100 text-gray-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "new": return "New";
      case "in_progress": return "In Progress";
      case "resolved": return "Resolved";
      case "closed": return "Closed";
      default: return status;
    }
  };

  return (
    <div className="flex h-[calc(100vh-120px)] bg-content1 rounded-xl overflow-hidden border border-content3">
      {/* Tickets List Sidebar */}
      <div className="w-80 border-r border-content3 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-content3">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold">Support</h2>
            <Button
              size="sm"
              color="primary"
              startContent={<Icon icon="lucide:plus" />}
              onPress={() => setShowNewTicketForm(true)}
            >
              New
            </Button>
          </div>
          <p className="text-sm text-foreground-500">We're here to help!</p>
        </div>

        {/* Tickets List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <Spinner size="sm" />
            </div>
          ) : tickets.length === 0 ? (
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-content2 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon icon="lucide:message-circle" className="text-2xl text-foreground-400" />
              </div>
              <p className="text-foreground-500 mb-4">No conversations yet</p>
              <Button
                size="sm"
                color="primary"
                variant="flat"
                onPress={() => setShowNewTicketForm(true)}
              >
                Start a conversation
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-content3">
              {tickets.map((ticket) => (
                <button
                  key={ticket.id}
                  onClick={() => fetchTicketDetails(ticket.id)}
                  className={`w-full p-4 text-left hover:bg-content2 transition-colors ${
                    selectedTicket?.id === ticket.id ? "bg-primary-50" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-medium text-sm truncate flex-1">{ticket.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(ticket.status)}`}>
                      {getStatusLabel(ticket.status)}
                    </span>
                  </div>
                  <p className="text-xs text-foreground-500 truncate mb-2">{ticket.description}</p>
                  <div className="flex items-center justify-between text-xs text-foreground-400">
                    <span>{formatDate(ticket.updatedAt)}</span>
                    {ticket.messageCount > 0 && (
                      <span className="flex items-center gap-1">
                        <Icon icon="lucide:message-circle" className="text-xs" />
                        {ticket.messageCount}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {showNewTicketForm ? (
          // New Ticket Form
          <div className="flex-1 flex flex-col p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">New Support Request</h3>
              <Button
                isIconOnly
                variant="light"
                onPress={() => setShowNewTicketForm(false)}
              >
                <Icon icon="lucide:x" />
              </Button>
            </div>

            <div className="space-y-4 max-w-lg">
              <div>
                <label className="block text-sm font-medium mb-2">Subject</label>
                <Input
                  placeholder="What do you need help with?"
                  value={newTicketTitle}
                  onChange={(e) => setNewTicketTitle(e.target.value)}
                  size="lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Message</label>
                <textarea
                  placeholder="Describe your issue in detail..."
                  value={newTicketDescription}
                  onChange={(e) => setNewTicketDescription(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-3 rounded-xl bg-content2 border border-content3 resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <Button
                color="primary"
                size="lg"
                className="w-full"
                isLoading={creating}
                isDisabled={!newTicketTitle.trim() || !newTicketDescription.trim()}
                onPress={handleCreateTicket}
              >
                Send Message
              </Button>
            </div>
          </div>
        ) : selectedTicket ? (
          // Chat View
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-content3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{selectedTicket.title}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(selectedTicket.status)}`}>
                    {getStatusLabel(selectedTicket.status)}
                  </span>
                </div>
                <Button
                  isIconOnly
                  variant="light"
                  onPress={() => setSelectedTicket(null)}
                  className="md:hidden"
                >
                  <Icon icon="lucide:arrow-left" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {loadingMessages ? (
                <div className="flex items-center justify-center h-32">
                  <Spinner size="sm" />
                </div>
              ) : (
                <>
                  {/* Initial message (description) */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-end"
                  >
                    <div className="max-w-[70%]">
                      <div className="bg-primary text-primary-foreground rounded-2xl rounded-br-sm px-4 py-3">
                        <p className="text-sm">{selectedTicket.description}</p>
                      </div>
                      <p className="text-xs text-foreground-400 mt-1 text-right">
                        {formatDate(selectedTicket.createdAt)}
                      </p>
                    </div>
                  </motion.div>

                  {/* Messages */}
                  <AnimatePresence>
                    {selectedTicket.messages?.map((msg, index) => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`flex ${msg.senderType === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div className={`max-w-[70%] ${msg.senderType !== "user" ? "flex gap-2" : ""}`}>
                          {msg.senderType !== "user" && (
                            <Avatar
                              size="sm"
                              icon={<Icon icon="lucide:headphones" />}
                              classNames={{
                                base: "bg-success-100",
                                icon: "text-success-600"
                              }}
                            />
                          )}
                          <div>
                            {msg.senderType !== "user" && (
                              <p className="text-xs text-foreground-500 mb-1">Support Team</p>
                            )}
                            <div className={`rounded-2xl px-4 py-3 ${
                              msg.senderType === "user"
                                ? "bg-primary text-primary-foreground rounded-br-sm"
                                : "bg-content2 rounded-bl-sm"
                            }`}>
                              <p className="text-sm">{msg.message}</p>
                            </div>
                            <p className={`text-xs text-foreground-400 mt-1 ${
                              msg.senderType === "user" ? "text-right" : ""
                            }`}>
                              {formatDate(msg.createdAt)}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {/* Auto-response if no messages yet */}
                  {(!selectedTicket.messages || selectedTicket.messages.length === 0) && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="flex justify-start"
                    >
                      <div className="flex gap-2 max-w-[70%]">
                        <Avatar
                          size="sm"
                          icon={<Icon icon="lucide:headphones" />}
                          classNames={{
                            base: "bg-success-100",
                            icon: "text-success-600"
                          }}
                        />
                        <div>
                          <p className="text-xs text-foreground-500 mb-1">Support Team</p>
                          <div className="bg-content2 rounded-2xl rounded-bl-sm px-4 py-3">
                            <p className="text-sm">
                              Thanks for reaching out! We've received your message and our team will get back to you shortly. 
                              You'll also receive updates via email.
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Message Input */}
            {selectedTicket.status !== "closed" && (
              <div className="p-4 border-t border-content3">
                <div className="flex gap-2">
                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                    className="flex-1"
                    size="lg"
                  />
                  <Button
                    isIconOnly
                    color="primary"
                    size="lg"
                    isLoading={sending}
                    isDisabled={!newMessage.trim()}
                    onPress={handleSendMessage}
                  >
                    <Icon icon="lucide:send" />
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          // Empty State
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 bg-content2 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon icon="lucide:message-circle" className="text-3xl text-foreground-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Welcome to Support</h3>
              <p className="text-foreground-500 mb-6 max-w-sm">
                Select a conversation from the list or start a new one. 
                We're here to help!
              </p>
              <Button
                color="primary"
                startContent={<Icon icon="lucide:plus" />}
                onPress={() => setShowNewTicketForm(true)}
              >
                New Conversation
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

