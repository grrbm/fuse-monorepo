import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ToastManager } from '@/components/ui/toast'
import { useToast } from '@/hooks/use-toast'
import Layout from '@/components/Layout'
import {
    Users,
    Search,
    Filter,
    Mail,
    Phone,
    UserCheck,
    UserX,
    Send,
    Calendar,
    TrendingUp,
    ChevronLeft,
    ChevronRight
} from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface Contact {
  id: string
  firstName: string
  lastName: string
  email: string
  phoneNumber?: string
  emailOptedOut: boolean
  smsOptedOut: boolean
  optOutDate?: string
  createdAt: string
  lastLoginAt?: string
  lastContactDate?: string
}

interface ContactsData {
  contacts: Contact[]
  total: number
  limit: number
  offset: number
}

export default function ContactsPage() {
  const { user, token } = useAuth()
  const { toasts, dismiss, success: showSuccess, error: showError } = useToast()

  // State
  const [contacts, setContacts] = useState<Contact[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [optOutFilter, setOptOutFilter] = useState<'all' | 'active' | 'email_opted_out' | 'sms_opted_out'>('all')
  const [page, setPage] = useState(1)
  const [limit] = useState(50)

  // Fetch contacts
  const fetchContacts = async () => {
    if (!token) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)

      const offset = (page - 1) * limit
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
        optOutStatus: optOutFilter
      })

      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim())
      }

      const response = await fetch(`${API_URL}/contacts?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Response not OK:', response.status, errorText)
        showError(`Failed to fetch contacts: ${response.status}`)
        return
      }

      const data = await response.json()

      if (data.success) {
        setContacts(data.data.contacts)
        setTotal(data.data.total)
      } else {
        showError(data.message || 'Failed to fetch contacts')
      }
    } catch (error) {
      console.error('Error fetching contacts:', error)
      showError(`Failed to fetch contacts: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  // Effects
  useEffect(() => {
    if (token) {
      fetchContacts()
    } else {
      setLoading(false)
    }
  }, [token, page, optOutFilter])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (token) {
        setPage(1) // Reset to first page on search
        fetchContacts()
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Helpers
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never'
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
    return date.toLocaleDateString()
  }

  const getStatusBadge = (contact: Contact) => {
    if (contact.emailOptedOut && contact.smsOptedOut) {
      return <Badge variant="destructive" className="gap-1"><UserX className="h-3 w-3" /> All Opted Out</Badge>
    }
    if (contact.emailOptedOut) {
      return <Badge variant="secondary" className="gap-1"><Mail className="h-3 w-3" /> Email Opted Out</Badge>
    }
    if (contact.smsOptedOut) {
      return <Badge variant="secondary" className="gap-1"><Phone className="h-3 w-3" /> SMS Opted Out</Badge>
    }
    return <Badge variant="default" className="gap-1"><UserCheck className="h-3 w-3" /> Active</Badge>
  }

  const totalPages = Math.ceil(total / limit)

  if (!token) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-muted-foreground">Please log in to view contacts</p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <Head>
        <title>Contacts - Fuse Admin</title>
      </Head>

      <ToastManager toasts={toasts} onDismiss={dismiss} />

      <div className="container mx-auto py-6 px-4 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Users className="h-8 w-8" />
              Contacts
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your patients and their communication preferences
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Contacts</p>
                  <p className="text-2xl font-bold">{total}</p>
                </div>
                <Users className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active</p>
                  <p className="text-2xl font-bold text-green-600">
                    {contacts.filter(c => !c.emailOptedOut && !c.smsOptedOut).length}
                  </p>
                </div>
                <UserCheck className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Email Opted Out</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {contacts.filter(c => c.emailOptedOut).length}
                  </p>
                </div>
                <Mail className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">SMS Opted Out</p>
                  <p className="text-2xl font-bold text-red-600">
                    {contacts.filter(c => c.smsOptedOut).length}
                  </p>
                </div>
                <Phone className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Status Filter */}
              <div className="flex gap-2">
                <Button
                  variant={optOutFilter === 'all' ? 'default' : 'outline'}
                  onClick={() => setOptOutFilter('all')}
                  size="sm"
                >
                  All
                </Button>
                <Button
                  variant={optOutFilter === 'active' ? 'default' : 'outline'}
                  onClick={() => setOptOutFilter('active')}
                  size="sm"
                >
                  Active
                </Button>
                <Button
                  variant={optOutFilter === 'email_opted_out' ? 'default' : 'outline'}
                  onClick={() => setOptOutFilter('email_opted_out')}
                  size="sm"
                >
                  Email Opted Out
                </Button>
                <Button
                  variant={optOutFilter === 'sms_opted_out' ? 'default' : 'outline'}
                  onClick={() => setOptOutFilter('sms_opted_out')}
                  size="sm"
                >
                  SMS Opted Out
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contacts Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              Contacts {loading ? '...' : `(${contacts.length})`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : contacts.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No contacts found</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium">Name</th>
                        <th className="text-left py-3 px-4 font-medium">Email</th>
                        <th className="text-left py-3 px-4 font-medium">Phone</th>
                        <th className="text-left py-3 px-4 font-medium">Status</th>
                        <th className="text-left py-3 px-4 font-medium">Last Contact</th>
                        <th className="text-right py-3 px-4 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {contacts.map((contact) => (
                        <tr key={contact.id} className="border-b hover:bg-muted/50 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                                {contact.firstName[0]}{contact.lastName[0]}
                              </div>
                              <div>
                                <p className="font-medium">{contact.firstName} {contact.lastName}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">
                            {contact.email}
                          </td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">
                            {contact.phoneNumber || '-'}
                          </td>
                          <td className="py-3 px-4">
                            {getStatusBadge(contact)}
                          </td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(contact.lastContactDate)}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-2"
                              disabled // Will enable in Phase 2
                              title="Coming soon"
                            >
                              <Send className="h-4 w-4" />
                              Send Sequence
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6 pt-6 border-t">
                    <p className="text-sm text-muted-foreground">
                      Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, total)} of {total} contacts
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(page - 1)}
                        disabled={page === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(page + 1)}
                        disabled={page >= totalPages}
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}

