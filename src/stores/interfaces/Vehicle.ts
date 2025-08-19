// ไฟล์: src/stores/interfaces/Vehicle.ts

export interface VehicleRecord {
    id: string;
    license_plate: string;
    area_code: string;
    authorized_area: string[];
    house_id: string;
    invitation_id: string;
    issuer: string;
    tier: string; // "staff" | "invited visitor" | "resident"
    start_time: string;
    expire_time: string;
    note: string;
    stamped_time: string;
    stamper: string;
    created: string;
    updated: string;
}

export interface VehicleListResponse {
    page: number;
    perPage: number;
    totalItems: number;
    totalPages: number;
    items: VehicleRecord[];
}

export interface VehicleType {
    tableData: VehicleRecord[];
    loading: boolean;
    total: number;
    currentPage: number;
    perPage: number;
}