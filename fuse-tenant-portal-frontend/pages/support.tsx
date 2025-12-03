import { useState, useEffect, useRef } from "react"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "sonner"
import { io, Socket } from "socket.io-client"
import {
  MessageSquare,
  Search,
  Filter,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  MoreHorizontal,
  Eye,
  MessageCircle,
  Calendar,
  User,
  Tag,
  Loader2,
  X,
  Send,
  ArrowRight,
} from "lucide-react"

interface Ticket {
  id: string
  title: string
  description: string
  status: "new" | "in_progress" | "resolved" | "closed"
  category: "technical" | "billing" | "general" | "feature_request"
  createdAt: string
  updatedAt: string
  author: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
  assignedTo?: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
  assignedTeam?: string
  messageCount: number
  tags?: string[]
  messages?: TicketMessage[]
}

interface TicketMessage {
  id: string
  message: string
  senderType: "user" | "support" | "system"
  sender: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
  createdAt: string
  read: boolean
}


const statusConfig = {
  new: {
    label: "New",
    color: "bg-blue-50 text-blue-700 border-blue-200",
    icon: AlertCircle
  },
  in_progress: {
    label: "In Progress",
    color: "bg-yellow-50 text-yellow-700 border-yellow-200",
    icon: Clock
  },
  resolved: {
    label: "Resolved",
    color: "bg-green-50 text-green-700 border-green-200",
    icon: CheckCircle2
  },
  closed: {
    label: "Closed",
    color: "bg-gray-50 text-gray-700 border-gray-200",
    icon: XCircle
  }
}

const categoryConfig = {
  technical: { label: "Technical", icon: "🔧" },
  billing: { label: "Billing", icon: "💳" },
  general: { label: "General", icon: "💬" },
  feature_request: { label: "Feature Request", icon: "✨" }
}

export default function Support() {
  const { token } = useAuth()
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
  const socketRef = useRef<Socket | null>(null)

  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [newMessage, setNewMessage] = useState("")
  const [sending, setSending] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const selectedTicketRef = useRef<Ticket | null>(null)
  
  // Keep ref updated with current selected ticket
  useEffect(() => {
    selectedTicketRef.current = selectedTicket
  }, [selectedTicket])

  // Fetch tickets
  const fetchTickets = async () => {
    if (!token) return
    setLoading(true)

    try {
      const params = new URLSearchParams()
      if (filterStatus !== "all") params.append("status", filterStatus)
      if (searchQuery) params.append("search", searchQuery)

      const response = await fetch(`${baseUrl}/support/tickets?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) throw new Error("Failed to fetch tickets")

      const data = await response.json()
      setTickets(data.data.tickets || [])
    } catch (error: any) {
      console.error("Error fetching tickets:", error)
      toast.error("Failed to load tickets")
    } finally {
      setLoading(false)
    }
  }

  // Fetch ticket details with messages
  const fetchTicketDetails = async (ticketId: string, silent = false) => {
    if (!token) return
    
    // Only show loading state if it's not a silent update (background refresh)
    if (!silent) {
      setLoadingMessages(true)
    }

    try {
      const response = await fetch(`${baseUrl}/support/tickets/${ticketId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) throw new Error("Failed to fetch ticket details")

      const data = await response.json()
      setSelectedTicket(data.data)
      
      // Only scroll on initial load, not on silent updates
      if (!silent) {
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
        }, 100)
      }
    } catch (error: any) {
      console.error("Error fetching ticket details:", error)
      if (!silent) {
        toast.error("Failed to load ticket details")
      }
    } finally {
      if (!silent) {
        setLoadingMessages(false)
      }
    }
  }

  // Send message
  const sendMessage = async () => {
    if (!token || !selectedTicket || !newMessage.trim()) return
    setSending(true)

    const messageContent = newMessage.trim()
    const tempId = `temp-${Date.now()}`
    
    // Optimistic update - add message immediately
    const optimisticMessage: TicketMessage = {
      id: tempId,
      message: messageContent,
      senderType: "support",
      sender: {
        id: "current-user",
        firstName: "You",
        lastName: "",
        email: "",
      },
      createdAt: new Date().toISOString(),
      read: false,
    }

    // Update local state immediately
    setSelectedTicket({
      ...selectedTicket,
      messages: [...(selectedTicket.messages || []), optimisticMessage],
      messageCount: selectedTicket.messageCount + 1,
    })
    setNewMessage("")

    // Scroll to bottom immediately
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, 50)

    try {
      const response = await fetch(`${baseUrl}/support/tickets/${selectedTicket.id}/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: messageContent,
          senderType: "support",
        }),
      })

      if (!response.ok) throw new Error("Failed to send message")

      const data = await response.json()
      
      // Replace optimistic message with real one from server
      setSelectedTicket(prev => ({
        ...prev!,
        messages: prev!.messages?.map(msg => 
          msg.id === tempId ? data.data : msg
        ) || [],
      }))

      toast.success("Message sent successfully")
      
      // Refresh tickets list in background to update message count
      fetchTickets()
    } catch (error: any) {
      console.error("Error sending message:", error)
      toast.error("Failed to send message")
      
      // Remove optimistic message on error
      setSelectedTicket(prev => ({
        ...prev!,
        messages: prev!.messages?.filter(msg => msg.id !== tempId) || [],
        messageCount: prev!.messageCount - 1,
      }))
    } finally {
      setSending(false)
    }
  }

  // Get next status in workflow
  const getNextStatus = (currentStatus: string) => {
    const statusFlow: Record<string, { next: string; label: string } | null> = {
      new: { next: "in_progress", label: "In Progress" },
      in_progress: { next: "resolved", label: "Resolved" },
      resolved: { next: "closed", label: "Closed" },
      closed: null,
    }
    return statusFlow[currentStatus]
  }

  // Update ticket status
  const updateTicketStatus = async () => {
    if (!token || !selectedTicket) return
    
    const nextStatusInfo = getNextStatus(selectedTicket.status)
    if (!nextStatusInfo) return

    const previousStatus = selectedTicket.status
    setUpdatingStatus(true)

    // Optimistic update - change status immediately
    setSelectedTicket({
      ...selectedTicket,
      status: nextStatusInfo.next as any,
    })

    try {
      const response = await fetch(`${baseUrl}/support/tickets/${selectedTicket.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: nextStatusInfo.next,
        }),
      })

      if (!response.ok) throw new Error("Failed to update ticket status")

      toast.success(`Ticket marked as ${nextStatusInfo.label}`)
      
      // Refresh tickets list in background
      fetchTickets()
    } catch (error: any) {
      console.error("Error updating ticket status:", error)
      toast.error("Failed to update ticket status")
      
      // Revert to previous status on error
      setSelectedTicket(prev => ({
        ...prev!,
        status: previousStatus,
      }))
    } finally {
      setUpdatingStatus(false)
    }
  }

  useEffect(() => {
    fetchTickets()
  }, [token, filterStatus])

  // WebSocket connection for real-time updates
  useEffect(() => {
    if (!token) return

    // Initialize socket connection
    const socket = io(baseUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    })

    socketRef.current = socket

    // Listen for new tickets
    socket.on('ticket:created', (data) => {
      toast.success('New support ticket received!', {
        description: data.title
      })
      fetchTickets()
    })

    // Listen for ticket updates
    socket.on('ticket:updated', (data) => {
      toast.info('Ticket updated')
      fetchTickets()
      
      // Update selected ticket status if it's the one being updated
      const currentTicket = selectedTicketRef.current
      if (currentTicket && data.ticketId === currentTicket.id) {
        setSelectedTicket(prev => prev ? { ...prev, status: data.status } : null)
      }
    })

    // Listen for new messages
    socket.on('ticket:message', (data) => {
      fetchTickets()
      
      // Only fetch details if this is not our own message (to avoid double refresh)
      // We already optimistically updated our own messages
      const currentTicket = selectedTicketRef.current
      if (currentTicket && data.ticketId === currentTicket.id) {
        // Silently fetch new messages without loading state
        fetchTicketDetails(currentTicket.id, true)
        
        // Scroll to new message after a brief delay
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
        }, 200)
      }
    })

    // Cleanup on unmount
    return () => {
      socket.disconnect()
    }
  }, [token, baseUrl])

  // Search with debounce
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchQuery) {
        fetchTickets()
      }
    }, 500)

    return () => clearTimeout(debounceTimer)
  }, [searchQuery])

  // Filter tickets
  const filteredTickets = searchQuery
    ? tickets.filter((ticket) =>
        ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.id.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : tickets
  
  // Sort tickets by priority: resolved -> in_progress -> new -> closed
  const sortedTickets = filterStatus === "all" 
    ? [...filteredTickets].sort((a, b) => {
        const statusOrder: Record<string, number> = {
          'resolved': 0,
          'in_progress': 1,
          'new': 2,
          'closed': 3
        };
        return (statusOrder[a.status] || 999) - (statusOrder[b.status] || 999);
      })
    : filteredTickets

  // Statistics
  const stats = {
    total: tickets.length,
    new: tickets.filter(t => t.status === "new").length,
    inProgress: tickets.filter(t => t.status === "in_progress").length,
    resolved: tickets.filter(t => t.status === "resolved").length,
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return "Less than 1 hour ago"
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`
    
    return date.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  return (
    <div className="flex h-screen bg-[#F9FAFB]">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-8 space-y-8">
            {/* Page Header */}
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-semibold text-[#1F2937] mb-2">Support Tickets</h1>
                <p className="text-[#6B7280] text-base">View and manage support requests from patients</p>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] p-6 hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wide">Total Tickets</h3>
                <div className="bg-[#F3F4F6] rounded-xl p-2">
                  <MessageSquare className="h-5 w-5 text-[#4FA59C]" />
                </div>
              </div>
              <p className="text-3xl font-bold text-[#1F2937] mb-2">{stats.total}</p>
              <p className="text-sm text-[#6B7280]">All tickets</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] p-6 hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wide">New</h3>
                <div className="bg-blue-50 rounded-xl p-2">
                  <AlertCircle className="h-5 w-5 text-blue-500" />
                </div>
              </div>
              <p className="text-3xl font-bold text-[#1F2937] mb-2">{stats.new}</p>
              <p className="text-sm text-[#6B7280]">Unassigned</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] p-6 hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wide">In Progress</h3>
                <div className="bg-yellow-50 rounded-xl p-2">
                  <Clock className="h-5 w-5 text-yellow-500" />
                </div>
              </div>
              <p className="text-3xl font-bold text-[#1F2937] mb-2">{stats.inProgress}</p>
              <p className="text-sm text-[#6B7280]">Being handled</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] p-6 hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wide">Resolved</h3>
                <div className="bg-green-50 rounded-xl p-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                </div>
              </div>
              <p className="text-3xl font-bold text-[#1F2937] mb-2">{stats.resolved}</p>
              <p className="text-sm text-[#6B7280]">This month</p>
            </div>
          </div>

          {/* Search */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] p-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#9CA3AF]" />
              <input
                type="text"
                placeholder="Search tickets by ID, title or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] text-sm text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#4FA59C] focus:ring-opacity-50 focus:border-[#4FA59C] transition-all"
              />
            </div>
          </div>

          {/* Status Filter Buttons */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] p-6">
            <h3 className="text-sm font-semibold text-[#1F2937] mb-4">Filter by Status</h3>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setFilterStatus("all")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  filterStatus === "all"
                    ? "bg-[#4FA59C] text-white shadow-sm"
                    : "bg-[#F9FAFB] text-[#6B7280] border border-[#E5E7EB] hover:bg-white hover:border-[#4FA59C] hover:text-[#4FA59C]"
                }`}
              >
                <Filter className="h-4 w-4" />
                All ({tickets.length})
              </button>

              <button
                onClick={() => setFilterStatus("resolved")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  filterStatus === "resolved"
                    ? "bg-green-500 text-white shadow-sm"
                    : "bg-green-50 text-green-700 border border-green-200 hover:bg-green-100"
                }`}
              >
                <CheckCircle2 className="h-4 w-4" />
                Resolved ({tickets.filter(t => t.status === "resolved").length})
              </button>

              <button
                onClick={() => setFilterStatus("in_progress")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  filterStatus === "in_progress"
                    ? "bg-yellow-500 text-white shadow-sm"
                    : "bg-yellow-50 text-yellow-700 border border-yellow-200 hover:bg-yellow-100"
                }`}
              >
                <Clock className="h-4 w-4" />
                In Progress ({tickets.filter(t => t.status === "in_progress").length})
              </button>

              <button
                onClick={() => setFilterStatus("new")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  filterStatus === "new"
                    ? "bg-blue-500 text-white shadow-sm"
                    : "bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100"
                }`}
              >
                <AlertCircle className="h-4 w-4" />
                New ({tickets.filter(t => t.status === "new").length})
              </button>

              <button
                onClick={() => setFilterStatus("closed")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  filterStatus === "closed"
                    ? "bg-gray-500 text-white shadow-sm"
                    : "bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100"
                }`}
              >
                <XCircle className="h-4 w-4" />
                Closed ({tickets.filter(t => t.status === "closed").length})
              </button>
            </div>
          </div>


          {/* Tickets List */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] overflow-hidden">
            <div className="p-6 border-b border-[#E5E7EB]">
              <h2 className="text-lg font-semibold text-[#1F2937]">
                Tickets ({sortedTickets.length})
              </h2>
            </div>

            {loading ? (
              <div className="p-16 text-center">
                <Loader2 className="h-12 w-12 text-[#4FA59C] animate-spin mx-auto mb-4" />
                <p className="text-lg text-[#4B5563]">Loading tickets...</p>
              </div>
            ) : sortedTickets.length === 0 ? (
              <div className="p-16 text-center">
                <div className="bg-[#F3F4F6] rounded-full p-6 w-fit mx-auto mb-4">
                  <MessageSquare className="h-12 w-12 text-[#9CA3AF]" />
                </div>
                <p className="text-lg text-[#4B5563] mb-2">No tickets found</p>
                <p className="text-sm text-[#6B7280]">Try adjusting your search filters</p>
              </div>
            ) : (
              <div className="divide-y divide-[#E5E7EB]">
                {sortedTickets.map((ticket) => {
                  const StatusIcon = statusConfig[ticket.status].icon
                  return (
                    <div
                      key={ticket.id}
                      className="p-6 hover:bg-[#F9FAFB] transition-all cursor-pointer"
                      onClick={() => fetchTicketDetails(ticket.id)}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0 space-y-3">
                          {/* Header */}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base font-semibold text-[#1F2937] mb-1">
                              {ticket.title}
                            </h3>
                            <p className="text-sm text-[#6B7280] line-clamp-2">
                              {ticket.description}
                            </p>
                          </div>

                          {/* Meta Info */}
                          <div className="flex flex-wrap items-center gap-4 text-sm">
                            {/* Status */}
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${statusConfig[ticket.status].color}`}>
                              <StatusIcon className="h-3.5 w-3.5" />
                              {statusConfig[ticket.status].label}
                            </span>

                            {/* Category */}
                            <span className="inline-flex items-center gap-1.5 text-[#6B7280]">
                              <Tag className="h-4 w-4" />
                              <span className="text-xs">
                                {categoryConfig[ticket.category].icon} {categoryConfig[ticket.category].label}
                              </span>
                            </span>

                            {/* Author */}
                            <span className="inline-flex items-center gap-1.5 text-[#6B7280]">
                              <User className="h-4 w-4" />
                              <span className="text-xs">{`${ticket.author.firstName} ${ticket.author.lastName}`}</span>
                            </span>

                            {/* Date */}
                            <span className="inline-flex items-center gap-1.5 text-[#6B7280]">
                              <Calendar className="h-4 w-4" />
                              <span className="text-xs">{formatDate(ticket.updatedAt)}</span>
                            </span>

                            {/* Messages */}
                            <span className="inline-flex items-center gap-1.5 text-[#6B7280]">
                              <MessageCircle className="h-4 w-4" />
                              <span className="text-xs">{ticket.messageCount} messages</span>
                            </span>
                          </div>

                          {/* Assigned To */}
                          {(ticket.assignedTo || ticket.assignedTeam) && (
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-[#9CA3AF]">Assigned to:</span>
                              <span className="text-xs font-medium text-[#4FA59C] bg-[#4FA59C]/10 px-2 py-1 rounded-lg">
                                {ticket.assignedTo ? `${ticket.assignedTo.firstName} ${ticket.assignedTo.lastName}` : ticket.assignedTeam}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <button className="p-2 text-[#6B7280] hover:text-[#4FA59C] hover:bg-[#F3F4F6] rounded-xl transition-all">
                            <Eye className="h-5 w-5" />
                          </button>
                          <button className="p-2 text-[#6B7280] hover:text-[#4FA59C] hover:bg-[#F3F4F6] rounded-xl transition-all">
                            <MoreHorizontal className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modal overlay tipo ClickUp */}
      {selectedTicket && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setSelectedTicket(null)}
        >
          <div 
            className="w-full max-w-7xl max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-[#E5E7EB] flex overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {loadingMessages ? (
              <div className="flex-1 flex items-center justify-center py-20">
                <div className="text-center">
                  <Loader2 className="h-12 w-12 text-[#4FA59C] animate-spin mx-auto mb-4" />
                  <p className="text-lg text-[#4B5563]">Loading ticket details...</p>
                </div>
              </div>
            ) : (
              <>
                {/* Left Column: Ticket Details */}
                <div className="w-[55%] flex flex-col border-r border-[#E5E7EB]">
                  {/* Header */}
                  <div className="p-8 border-b border-[#E5E7EB]">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${statusConfig[selectedTicket.status].color}`}>
                            {statusConfig[selectedTicket.status].label}
                          </span>
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[#F3F4F6] text-[#6B7280]">
                            {categoryConfig[selectedTicket.category].icon} {categoryConfig[selectedTicket.category].label}
                          </span>
                          <span className="text-xs font-mono text-[#9CA3AF] bg-[#F3F4F6] px-2 py-1 rounded">
                            #{selectedTicket.id.slice(0, 8)}
                          </span>
                        </div>
                        <h1 className="text-2xl font-bold text-[#1F2937] mb-1">
                          {selectedTicket.title}
                        </h1>
                      </div>

                      <button
                        onClick={() => setSelectedTicket(null)}
                        className="p-2 text-[#6B7280] hover:text-[#4FA59C] hover:bg-[#F3F4F6] rounded-lg transition-all"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    {/* Mark as Next Status Button */}
                    {getNextStatus(selectedTicket.status) && (
                      <button
                        onClick={updateTicketStatus}
                        disabled={updatingStatus}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#4FA59C] text-white rounded-lg hover:bg-[#3d8479] transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {updatingStatus ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Updating...
                          </>
                        ) : (
                          <>
                            Mark as {getNextStatus(selectedTicket.status)?.label}
                            <ArrowRight className="h-4 w-4" />
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {/* Scrollable Content */}
                  <div className="flex-1 overflow-y-auto p-8 space-y-6">
                    {/* Description */}
                    <div>
                      <h3 className="text-sm font-semibold text-[#1F2937] mb-2">Description</h3>
                      <div className="bg-[#F9FAFB] rounded-xl p-4 border border-[#E5E7EB]">
                        <p className="text-sm text-[#6B7280] leading-relaxed">
                          {selectedTicket.description}
                        </p>
                      </div>
                    </div>

                    {/* Ticket Information */}
                    <div>
                      <h3 className="text-sm font-semibold text-[#1F2937] mb-3">Ticket Information</h3>
                      <div className="space-y-3">
                        <div className="bg-[#F9FAFB] rounded-xl p-4 border border-[#E5E7EB]">
                          <p className="text-xs font-medium text-[#9CA3AF] mb-1">Created by</p>
                          <p className="text-sm font-semibold text-[#1F2937]">
                            {selectedTicket.author.firstName} {selectedTicket.author.lastName}
                          </p>
                          <p className="text-xs text-[#6B7280]">{selectedTicket.author.email}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-[#F9FAFB] rounded-xl p-4 border border-[#E5E7EB]">
                            <p className="text-xs font-medium text-[#9CA3AF] mb-1">Created at</p>
                            <p className="text-sm font-semibold text-[#1F2937]">
                              {new Date(selectedTicket.createdAt).toLocaleDateString('en-US', { 
                                day: '2-digit', 
                                month: 'short', 
                                year: 'numeric'
                              })}
                            </p>
                            <p className="text-xs text-[#6B7280]">
                              {new Date(selectedTicket.createdAt).toLocaleTimeString('en-US', { 
                                hour: '2-digit', 
                                minute: '2-digit'
                              })}
                            </p>
                          </div>

                          <div className="bg-[#F9FAFB] rounded-xl p-4 border border-[#E5E7EB]">
                            <p className="text-xs font-medium text-[#9CA3AF] mb-1">Last updated</p>
                            <p className="text-sm font-semibold text-[#1F2937]">
                              {formatDate(selectedTicket.updatedAt)}
                            </p>
                          </div>
                        </div>

                        {(selectedTicket.assignedTo || selectedTicket.assignedTeam) && (
                          <div className="bg-[#F9FAFB] rounded-xl p-4 border border-[#E5E7EB]">
                            <p className="text-xs font-medium text-[#9CA3AF] mb-1">Assigned to</p>
                            <p className="text-sm font-semibold text-[#4FA59C]">
                              {selectedTicket.assignedTo 
                                ? `${selectedTicket.assignedTo.firstName} ${selectedTicket.assignedTo.lastName}`
                                : selectedTicket.assignedTeam
                              }
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Tags if any */}
                    {selectedTicket.tags && selectedTicket.tags.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-[#1F2937] mb-3">Tags</h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedTicket.tags.map((tag, index) => (
                            <span 
                              key={index}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[#E5E7EB] text-[#6B7280]"
                            >
                              <Tag className="h-3 w-3" />
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column: Comments/Chat */}
                <div className="w-[45%] flex flex-col bg-[#F9FAFB]">
                  {/* Comments Header */}
                  <div className="p-6 border-b border-[#E5E7EB] bg-white">
                    <div className="flex items-center gap-2">
                      <MessageCircle className="h-5 w-5 text-[#4FA59C]" />
                      <h2 className="text-lg font-semibold text-[#1F2937]">
                        Comments
                      </h2>
                      <span className="text-sm text-[#9CA3AF]">
                        ({selectedTicket.messageCount})
                      </span>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {selectedTicket.messages && selectedTicket.messages.length > 0 ? (
                      selectedTicket.messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${msg.senderType === "support" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[85%] rounded-xl p-4 shadow-sm ${
                              msg.senderType === "support"
                                ? "bg-[#4FA59C] text-white"
                                : msg.senderType === "system"
                                ? "bg-[#F3F4F6] text-[#6B7280] border border-[#E5E7EB]"
                                : "bg-white text-[#1F2937] border border-[#E5E7EB]"
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs font-semibold">
                                {msg.sender.firstName} {msg.sender.lastName}
                              </span>
                              <span className={`text-xs ${msg.senderType === "support" ? "text-white/70" : "text-[#9CA3AF]"}`}>
                                {formatDate(msg.createdAt)}
                              </span>
                            </div>
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">
                              {msg.message}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <MessageCircle className="h-12 w-12 text-[#9CA3AF] mx-auto mb-2" />
                          <p className="text-sm text-[#6B7280]">No comments yet</p>
                          <p className="text-xs text-[#9CA3AF] mt-1">Be the first to reply</p>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <div className="bg-white border-t border-[#E5E7EB] p-4">
                    <div className="flex gap-3">
                      <input
                        type="text"
                        placeholder="Write a comment..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault()
                            sendMessage()
                          }
                        }}
                        className="flex-1 px-4 py-2.5 rounded-lg border border-[#E5E7EB] bg-white text-sm text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#4FA59C] focus:ring-opacity-50 focus:border-[#4FA59C] transition-all"
                        disabled={sending}
                      />
                      <button
                        onClick={sendMessage}
                        disabled={sending || !newMessage.trim()}
                        className="px-5 py-2.5 bg-[#4FA59C] text-white rounded-lg hover:bg-[#3d8479] transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {sending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

