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

    const [treatments, setTreatments] = useState<any[]>([]);
    const [filters, setFilters] = useState({
        treatmentId: '',
        dateFrom: '',
        dateTo: '',
    });

    useEffect(() => {
        loadTreatments();
    }, []);

    const loadTreatments = async () => {
        try {
            const response = await apiClient.getTreatments();
            if (response.success && response.data) {
                setTreatments(response.data);
            }
        } catch (error) {
            console.error('Failed to load treatments:', error);
        }
    };

    const handleApply = () => {
        const activeFilters: any = {};

        if (filters.treatmentId) activeFilters.treatmentId = filters.treatmentId;
        if (filters.dateFrom) activeFilters.dateFrom = filters.dateFrom;
        if (filters.dateTo) activeFilters.dateTo = filters.dateTo;

        onFilterChange(activeFilters);
    };

    const handleReset = () => {
        setFilters({
            treatmentId: '',
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
                {/* Treatment Type */}
                <div className="space-y-2">
                    <label className="text-sm font-medium">Treatment Type</label>
                    <select
                        className="w-full border rounded-md px-3 py-2 text-sm"
                        value={filters.treatmentId}
                        onChange={(e) => setFilters({ ...filters, treatmentId: e.target.value })}
                    >
                        <option value="">All Treatments</option>
                        {treatments.map((treatment) => (
                            <option key={treatment.id} value={treatment.id}>
                                {treatment.name}
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

