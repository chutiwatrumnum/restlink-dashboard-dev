export interface VehicleRecord {
    id: string;
    license_plate: string;
    area_code: string;
    vehicle_color?: string;
    vehicle_brand?: string; // เพิ่มใหม่
    vehicle_type?: string; // เพิ่มประเภท (motorcycle | car)
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

// เพิ่ม type สำหรับ vehicle type options
export type VehicleTypeOption = 'motorcycle' | 'car';

export const VEHICLE_TYPE_OPTIONS = [
    { label: 'motorcycle', value: 'motorcycle' },
    { label: 'car', value: 'car' }
] as const;