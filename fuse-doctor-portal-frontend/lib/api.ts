const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface OrderFilters {
    status?: string;
    tenantProductId?: string;
    clinicId?: string;
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

export class ApiClient {
    constructor(private authenticatedFetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>) { }

    async fetchPendingOrders(filters: OrderFilters = {}): Promise<{ success: boolean; data: PendingOrder[]; pagination?: any }> {
        const params = new URLSearchParams();

        if (filters.status) params.append('status', filters.status);
        if (filters.tenantProductId) params.append('tenantProductId', filters.tenantProductId);
        if (filters.clinicId) params.append('clinicId', filters.clinicId);
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

    async getTenantProducts(): Promise<{ success: boolean; data: any[] }> {
        const response = await this.authenticatedFetch(`${API_URL}/doctor/tenant-products`);

        if (!response.ok) {
            throw new Error('Failed to fetch tenant products');
        }

        return response.json();
    }

    async getClinics(): Promise<{ success: boolean; data: any[] }> {
        const response = await this.authenticatedFetch(`${API_URL}/doctor/clinics`);

        if (!response.ok) {
            throw new Error('Failed to fetch clinics');
        }

        return response.json();
    }
}

