import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { ApiClient } from '@/lib/api';

interface RequestFiltersProps {
    onFilterChange: (filters: any) => void;
    onReset: () => void;
}

export function RequestFilters({ onFilterChange, onReset }: RequestFiltersProps) {
    const { authenticatedFetch } = useAuth();
    const apiClient = new ApiClient(authenticatedFetch);

    const [tenantProducts, setTenantProducts] = useState<any[]>([]);
    const [clinics, setClinics] = useState<any[]>([]);
    const [filters, setFilters] = useState({
        status: '',
        tenantProductId: '',
        clinicId: '',
        dateFrom: '',
        dateTo: '',
    });

    useEffect(() => {
        loadTenantProducts();
        loadClinics();
    }, []);

    const loadTenantProducts = async () => {
        try {
            const response = await apiClient.getTenantProducts();
            if (response.success && response.data) {
                setTenantProducts(response.data);
            }
        } catch (error) {
            console.error('Failed to load tenant products:', error);
        }
    };

    const loadClinics = async () => {
        try {
            const response = await apiClient.getClinics();
            if (response.success && response.data) {
                setClinics(response.data);
            }
        } catch (error) {
            console.error('Failed to load clinics:', error);
        }
    };

    const handleApply = () => {
        const activeFilters: any = {};

        if (filters.status) activeFilters.status = filters.status;
        if (filters.tenantProductId) activeFilters.tenantProductId = filters.tenantProductId;
        if (filters.clinicId) activeFilters.clinicId = filters.clinicId;
        if (filters.dateFrom) activeFilters.dateFrom = filters.dateFrom;
        if (filters.dateTo) activeFilters.dateTo = filters.dateTo;

        onFilterChange(activeFilters);
    };

    const handleReset = () => {
        setFilters({
            status: '',
            tenantProductId: '',
            clinicId: '',
            dateFrom: '',
            dateTo: '',
        });
        onReset();
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Status Filter */}
                <div className="space-y-2">
                    <label className="text-sm font-medium">Status</label>
                    <select
                        className="w-full border rounded-md px-3 py-2 text-sm"
                        value={filters.status}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    >
                        <option value="">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="payment_processing">Payment Processing</option>
                        <option value="paid">Paid</option>
                        <option value="payment_due">Payment Due</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="refunded">Refunded</option>
                    </select>
                </div>

                {/* Clinic Filter */}
                <div className="space-y-2">
                    <label className="text-sm font-medium">Clinic</label>
                    <select
                        className="w-full border rounded-md px-3 py-2 text-sm"
                        value={filters.clinicId}
                        onChange={(e) => setFilters({ ...filters, clinicId: e.target.value })}
                    >
                        <option value="">All Clinics</option>
                        {clinics.map((clinic) => (
                            <option key={clinic.id} value={clinic.id}>
                                {clinic.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Product Filter */}
                <div className="space-y-2">
                    <label className="text-sm font-medium">Product</label>
                    <select
                        className="w-full border rounded-md px-3 py-2 text-sm"
                        value={filters.tenantProductId}
                        onChange={(e) => setFilters({ ...filters, tenantProductId: e.target.value })}
                    >
                        <option value="">All Products</option>
                        {tenantProducts.map((product) => (
                            <option key={product.id} value={product.id}>
                                {product.name} {product.dosage && `(${product.dosage})`}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Date Range */}
                <div className="space-y-2">
                    <label className="text-sm font-medium">Date Range</label>
                    <div className="grid grid-cols-2 gap-2">
                        <Input
                            type="date"
                            value={filters.dateFrom}
                            onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                            placeholder="From"
                        />
                        <Input
                            type="date"
                            value={filters.dateTo}
                            onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                            placeholder="To"
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                    <Button onClick={handleApply} className="flex-1">
                        Apply Filters
                    </Button>
                    <Button onClick={handleReset} variant="outline" className="flex-1">
                        Reset
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

