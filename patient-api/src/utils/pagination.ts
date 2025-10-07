/**
 * Pagination utility functions
 */

export interface PaginationParams {
    page?: number;
    limit?: number;
}

export interface NormalizedPagination {
    page: number;
    limit: number;
    offset: number;
}

/**
 * Normalizes pagination parameters with defaults and constraints
 *
 * @param params - Optional pagination parameters
 * @returns Normalized pagination with page, limit, and calculated offset
 *
 * @example
 * const { page, limit, offset } = normalizePagination({ page: 2, limit: 20 });
 * // Returns: { page: 2, limit: 20, offset: 20 }
 */
export function normalizePagination(params: PaginationParams = {}): NormalizedPagination {
    // Ensure page is at least 1
    const page = Math.max(1, params.page || 1);

    // Ensure limit is between 1 and 100
    const limit = Math.min(100, Math.max(1, params.limit || 10));

    // Calculate offset for database queries
    const offset = (page - 1) * limit;

    return { page, limit, offset };
}

/**
 * Calculates total pages from total count and limit
 *
 * @param total - Total number of records
 * @param limit - Number of records per page
 * @returns Total number of pages
 */
export function calculateTotalPages(total: number, limit: number): number {
    return Math.ceil(total / limit);
}
