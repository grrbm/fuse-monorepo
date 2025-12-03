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

  useEffect(() => {
    fetchTickets()
  }, [token, filterStatus])

  // WebSocket connection for real-time updates
  useEffect(() => {
    if (!token) {
      console.warn('⚠️ [Support] No token available for WebSocket connection')
      return
    }

    console.log('🔌 [Support] Initializing WebSocket connection')
    console.log('🔌 [Support] Base URL:', baseUrl)
    console.log('🔌 [Support] Token available:', !!token)

    // Initialize socket connection
    const socket = io(baseUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    })

    socketRef.current = socket

    socket.on('connect', () => {
      console.log('✅ [Support] Connected to WebSocket for support tickets')
      console.log('🔌 [Support] Socket ID:', socket.id)
      console.log('🔌 [Support] Transport:', socket.io.engine.transport.name)
    })

    socket.on('connect_error', (error) => {
      console.error('❌ [Support] WebSocket connection error:', error.message)
      console.error('❌ [Support] Error details:', error)
    })

    socket.on('disconnect', (reason) => {
      console.log('🔌 [Support] Disconnected from WebSocket. Reason:', reason)
    })

    socket.on('error', (error) => {
      console.error('❌ [Support] WebSocket error:', error)
    })

    // Listen for new tickets
    socket.on('ticket:created', (data) => {
      console.log('🎫 [Support] New ticket created event received:', data)
      toast.success('New support ticket received!', {
        description: data.title
      })
      // Refresh tickets list
      fetchTickets()
    })

    // Listen for ticket updates
    socket.on('ticket:updated', (data) => {
      console.log('🎫 [Support] Ticket updated event received:', data)
      // Refresh tickets list
      fetchTickets()
    })

    // Listen for new messages
    socket.on('ticket:message', (data) => {
      console.log('💬 [Support] New ticket message event received:', data)
      // Refresh tickets list
      fetchTickets()
    })

    // Test: Listen to all events
    socket.onAny((eventName, ...args) => {
      console.log('📨 [Support] Received event:', eventName, args)
    })

    // Cleanup on unmount
    return () => {
      console.log('🔌 [Support] Cleaning up WebSocket connection')
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
                Tickets ({filteredTickets.length})
              </h2>
            </div>

            {loading ? (
              <div className="p-16 text-center">
                <Loader2 className="h-12 w-12 text-[#4FA59C] animate-spin mx-auto mb-4" />
                <p className="text-lg text-[#4B5563]">Loading tickets...</p>
              </div>
            ) : filteredTickets.length === 0 ? (
              <div className="p-16 text-center">
                <div className="bg-[#F3F4F6] rounded-full p-6 w-fit mx-auto mb-4">
                  <MessageSquare className="h-12 w-12 text-[#9CA3AF]" />
                </div>
                <p className="text-lg text-[#4B5563] mb-2">No tickets found</p>
                <p className="text-sm text-[#6B7280]">Try adjusting your search filters</p>
              </div>
            ) : (
              <div className="divide-y divide-[#E5E7EB]">
                {filteredTickets.map((ticket) => {
                  const StatusIcon = statusConfig[ticket.status].icon
                  return (
                    <div
                      key={ticket.id}
                      className="p-6 hover:bg-[#F9FAFB] transition-all cursor-pointer"
                      onClick={() => setSelectedTicket(ticket)}
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

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setSelectedTicket(null)}
        >
          <div 
            className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl border border-[#E5E7EB]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8 space-y-6">
              <div className="flex items-start justify-between pb-4 border-b border-[#E5E7EB]">
                <div className="space-y-2">
                  <span className="text-sm font-mono text-[#9CA3AF] bg-[#F3F4F6] px-3 py-1 rounded-lg">
                    {selectedTicket.id}
                  </span>
                  <h2 className="text-2xl font-semibold text-[#1F2937]">{selectedTicket.title}</h2>
                </div>
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="rounded-full px-4 py-2 border border-[#E5E7EB] text-[#6B7280] hover:bg-[#F3F4F6] transition-all text-sm font-medium"
                >
                  Close
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex flex-wrap gap-3">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${statusConfig[selectedTicket.status].color}`}>
                    {statusConfig[selectedTicket.status].label}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[#F3F4F6] text-[#6B7280]">
                    {categoryConfig[selectedTicket.category].icon} {categoryConfig[selectedTicket.category].label}
                  </span>
                </div>

                <div className="bg-[#F9FAFB] rounded-xl p-6 border border-[#E5E7EB]">
                  <h3 className="text-sm font-semibold text-[#1F2937] mb-2">Description</h3>
                  <p className="text-sm text-[#6B7280] leading-relaxed">{selectedTicket.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#F9FAFB] rounded-xl p-4 border border-[#E5E7EB]">
                    <p className="text-xs font-medium text-[#9CA3AF] mb-1">Created by</p>
                    <p className="text-sm font-semibold text-[#1F2937]">{`${selectedTicket.author.firstName} ${selectedTicket.author.lastName}`}</p>
                    <p className="text-xs text-[#6B7280]">{selectedTicket.author.email}</p>
                  </div>
                  <div className="bg-[#F9FAFB] rounded-xl p-4 border border-[#E5E7EB]">
                    <p className="text-xs font-medium text-[#9CA3AF] mb-1">Created at</p>
                    <p className="text-sm font-semibold text-[#1F2937]">
                      {new Date(selectedTicket.createdAt).toLocaleDateString('en-US', { 
                        day: '2-digit', 
                        month: 'long', 
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                  <p className="text-sm text-blue-700">
                    💡 This is a ticket preview. Full ticket management functionality will be available soon.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

