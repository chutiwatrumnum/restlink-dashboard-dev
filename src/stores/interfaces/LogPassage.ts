export interface SnapshotInfo {
    license_plate: {
        plate_number: string;
        region: string;
    };
    image_size: {
        width: string;
        height: string;
    };
    lp_position: {
        x_1: string;
        y_1: string;
        x_2: string;
        y_2: string;
    };
    vehicle_position: {
        x_1: string;
        y_1: string;
        x_2: string;
        y_2: string;
    };
}

export interface LogPassageRecord {
    id: string;
    created: string;
    updated: string;
    area_code: string;
    full_snapshot: string;
    gate: string;
    gate_state: string;
    house_id: string;
    isSuccess: boolean;
    license_plate: string;
    lp_snapshot: string;
    note: string;
    reader: string;
    region: string;
    snapshot_info: SnapshotInfo;
    tier: string;
}

export interface LogPassageListResponse {
    page: number;
    perPage: number;
    totalItems: number;
    totalPages: number;
    items: LogPassageRecord[];
}

export interface LogPassageType {
    tableData: LogPassageRecord[];
    loading: boolean;
    total: number;
    currentPage: number;
    perPage: number;
}

// สำหรับ Stats Cards
export interface LogPassageStats {
    total: number;
    bySuccess: Record<string, number>;
    byTier: Record<string, number>;
    byRegion: Record<string, number>;
    todayCount: number;
    successRate: number;
}

// สำหรับ Filter และ Search
export interface LogPassageFilters {
    isSuccess?: boolean;
    tier?: string;
    region?: string;
    license_plate?: string;
    dateRange?: {
        start: string;
        end: string;
    };
}

// สำหรับ Pagination
export interface LogPassagePaginationParams {
    page: number;
    perPage: number;
    filters?: LogPassageFilters;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}