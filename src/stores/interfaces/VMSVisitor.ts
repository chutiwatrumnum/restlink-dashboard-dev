// File: src/stores/interfaces/VMSVisitor.ts

export interface VMSVisitorRecord {
    id: string;
    code: string;
    first_name: string;
    last_name: string;
    gender: string;
    id_card: string;
    house_id: string;
    issuer: string;
    authorized_area: string[];
    external_vehicle_id: string;
    note: string;
    stamped_time: string;
    stamper: string;
    created: string;
    updated: string;
}

export interface VMSVisitorListResponse {
    page: number;
    perPage: number;
    totalItems: number;
    totalPages: number;
    items: VMSVisitorRecord[];
}

export interface VMSVisitorType {
    tableData: VMSVisitorRecord[];
    loading: boolean;
    total: number;
    currentPage: number;
    perPage: number;
}

// For Stats Cards
export interface VMSVisitorStats {
    total: number;
    byGender: Record<string, number>;
    stamped: number;
    unstamped: number;
    todayCount: number;
    byHouse: Record<string, number>;
}

// For Filter and Search
export interface VMSVisitorFilters {
    gender?: string;
    stamped?: boolean;
    house_id?: string;
    name?: string;
    dateRange?: {
        start: string;
        end: string;
    };
}

// For Pagination
export interface VMSVisitorPaginationParams {
    page: number;
    perPage: number;
    filters?: VMSVisitorFilters;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}