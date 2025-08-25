export interface LogAccessRecord {
    id: string;
    created: string;
    gate_name: string;
    gate_state: string;
    invitation: string;
    invitation_state: string;
    issuer: string;
    note: string;
    result: string;
    tier: string;
    updated?: string;
}

export interface LogAccessListResponse {
    page: number;
    perPage: number;
    totalItems: number;
    totalPages: number;
    items: LogAccessRecord[];
}

export interface LogAccessType {
    tableData: LogAccessRecord[];
    loading: boolean;
    total: number;
    currentPage: number;
    perPage: number;
}

// สำหรับ Stats Cards
export interface LogAccessStats {
    total: number;
    byResult: Record<string, number>;
    byTier: Record<string, number>;
    byGateState: Record<string, number>;
    todayCount: number;
    successRate: number;
}

// สำหรับ Filter และ Search
export interface LogAccessFilters {
    result?: string;
    tier?: string;
    gate_state?: string;
    gate_name?: string;
    dateRange?: {
        start: string;
        end: string;
    };
}

// สำหรับ Pagination
export interface LogAccessPaginationParams {
    page: number;
    perPage: number;
    filters?: LogAccessFilters;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}