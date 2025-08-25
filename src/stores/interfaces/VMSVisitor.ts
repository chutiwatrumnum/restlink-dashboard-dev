export interface VMSVisitorRecord {
    id: string;
    code: string;
    first_name: string;
    last_name: string;
    gender: string;
    id_card: string; // ชื่อไฟล์รูป ID Card
    id_card_number?: string; // เลขบัตรประชาชน (ถ้ามี field แยก)
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
    withIdCard: number; // จำนวนที่มีรูป ID Card
    withoutIdCard: number; // จำนวนที่ไม่มีรูป ID Card
}

// For Filter and Search
export interface VMSVisitorFilters {
    gender?: string;
    stamped?: boolean;
    house_id?: string;
    name?: string;
    hasIdCard?: boolean; // Filter ตามการมีรูป ID Card
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