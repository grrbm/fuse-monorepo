const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface OrderFilters {
    status?: string;
    treatmentId?: string;
    dateFrom?: string;
    dateTo?: string;
    patientAge?: number;
    patientGender?: string;
    limit?: number;
    offset?: number;
}

export interface PendingOrder {
    id: string;
    orderNumber: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    totalAmount: number;
    autoApproved?: boolean;
    autoApprovalReason?: string;
    doctorNotes?: any[];
    patient: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        phoneNumber?: string;
    } | null;
    treatment?: {
        id: string;
        name: string;
        description?: string;
        isCompound?: boolean;
    };
    shippingAddress?: any;
    questionnaireAnswers?: Record<string, any>;
    mdCaseId?: string;
    mdPrescriptions?: any[];
    mdOfferings?: any[];
}

export interface OrderStats {
    totalPending: number;
    approvedToday: number;
    autoApprovedCount: number;
    requiresAction: number;
}

export interface BulkApproveResult {
    orderId: string;
    orderNumber: string;
    success: boolean;
    message: string;
    error?: string;
}

export interface ChatMessage {
    id: string;
    senderId: string;
    senderRole: 'doctor' | 'patient';
    message: string;
    createdAt: string;
    read: boolean;
    attachments?: string[]; // URLs of attached files
}

export interface Chat {
    id: string;
    doctorId: string;
    patientId: string;
    messages: ChatMessage[];
    lastMessageAt: string;
    unreadCountDoctor: number;
    unreadCountPatient: number;
    createdAt: string;
    updatedAt: string;
    patient: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
    };
}

export class ApiClient {
    constructor(private authenticatedFetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>) { }

    async fetchPendingOrders(filters: OrderFilters = {}): Promise<{ success: boolean; data: PendingOrder[]; pagination?: any }> {
        const params = new URLSearchParams();

        if (filters.status) params.append('status', filters.status);
        if (filters.treatmentId) params.append('treatmentId', filters.treatmentId);
        if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
        if (filters.dateTo) params.append('dateTo', filters.dateTo);
        if (filters.patientAge) params.append('patientAge', filters.patientAge.toString());
        if (filters.patientGender) params.append('patientGender', filters.patientGender);
        if (filters.limit) params.append('limit', filters.limit.toString());
        if (filters.offset) params.append('offset', filters.offset.toString());

        const response = await this.authenticatedFetch(
            `${API_URL}/doctor/orders/pending?${params.toString()}`
        );

        if (!response.ok) {
            throw new Error('Failed to fetch pending orders');
        }

        return response.json();
    }

    async bulkApproveOrders(orderIds: string[]): Promise<{
        success: boolean;
        message: string;
        data: {
            results: BulkApproveResult[];
            summary: {
                total: number;
                succeeded: number;
                failed: number;
            };
        };
    }> {
        const response = await this.authenticatedFetch(`${API_URL}/doctor/orders/bulk-approve`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ orderIds }),
        });

        if (!response.ok) {
            throw new Error('Failed to bulk approve orders');
        }

        return response.json();
    }

    async addOrderNotes(orderId: string, note: string): Promise<{
        success: boolean;
        message: string;
        data?: { notes: any[] };
    }> {
        const response = await this.authenticatedFetch(`${API_URL}/doctor/orders/${orderId}/notes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ note }),
        });

        if (!response.ok) {
            throw new Error('Failed to add notes');
        }

        return response.json();
    }

    async getOrderStats(): Promise<{ success: boolean; data: OrderStats }> {
        const response = await this.authenticatedFetch(`${API_URL}/doctor/orders/stats`);

        if (!response.ok) {
            throw new Error('Failed to fetch stats');
        }

        return response.json();
    }

    async getTreatments(): Promise<{ success: boolean; data: any[] }> {
        const response = await this.authenticatedFetch(`${API_URL}/treatments`);

        if (!response.ok) {
            throw new Error('Failed to fetch treatments');
        }

        return response.json();
    }

    // Chat endpoints
    async fetchChats(): Promise<{ success: boolean; data: Chat[] }> {
        const response = await this.authenticatedFetch(`${API_URL}/doctor/chats`);

        if (!response.ok) {
            throw new Error('Failed to fetch chats');
        }

        return response.json();
    }

    async fetchChatById(chatId: string): Promise<{ success: boolean; data: Chat }> {
        const response = await this.authenticatedFetch(`${API_URL}/doctor/chats/${chatId}`);

        if (!response.ok) {
            throw new Error('Failed to fetch chat');
        }

        return response.json();
    }

    async sendMessage(chatId: string, message: string, attachments?: string[]): Promise<{
        success: boolean;
        data: {
            message: ChatMessage;
            chat: Chat;
        };
    }> {
        const response = await this.authenticatedFetch(`${API_URL}/doctor/chats/${chatId}/messages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message, attachments }),
        });

        if (!response.ok) {
            throw new Error('Failed to send message');
        }

        return response.json();
    }

    async uploadFile(file: File): Promise<{ success: boolean; data?: { url: string; fileName: string; contentType: string; size: number }; error?: string }> {
        const formData = new FormData();
        formData.append('file', file);

        const response = await this.authenticatedFetch(`${API_URL}/doctor/chat/upload-file`, {
            method: 'POST',
            body: formData,
            // Don't set Content-Type - browser sets it with boundary for FormData
        });

        if (!response.ok) {
            const data = await response.json();
            return {
                success: false,
                error: data.message || `Upload failed with status ${response.status}`,
            };
        }

        const data = await response.json();
        return {
            success: true,
            data: data.data,
        };
    }

    async markChatAsRead(chatId: string): Promise<{ success: boolean; data: Chat }> {
        const response = await this.authenticatedFetch(`${API_URL}/doctor/chats/${chatId}/mark-read`, {
            method: 'POST',
        });

        if (!response.ok) {
            throw new Error('Failed to mark chat as read');
        }

        return response.json();
    }
}

