// ไฟล์: src/stores/interfaces/Invitation.ts - Complete Version

export interface InvitationRecord {
    id: string;
    code: string;
    guest_name: string;
    house_id: string;
    issuer: string;
    note: string;
    type: string;
    active: boolean;
    authorized_area: string[];
    vehicle_id: string[]; // Array of vehicle IDs หรือ license plates
    start_time: string;
    expire_time: string;
    stamped_time: string;
    stamper: string;
    created: string;
    updated: string;
}

export interface InvitationListResponse {
    page: number;
    perPage: number;
    totalItems: number;
    totalPages: number;
    items: InvitationRecord[];
}

export interface InvitationType {
    tableData: InvitationRecord[];
    loading: boolean;
    total: number;
    currentPage: number;
    perPage: number;
    houseMapping: Map<string, string>; // House ID -> Address mapping
}

// สำหรับการสร้างและแก้ไข invitation
export interface CreateInvitationPayload {
    guest_name: string;
    house_id: string;
    type?: string;
    start_time?: string;
    expire_time?: string;
    authorized_area?: string[];
    vehicles?: Array<{
        license_plate: string;
        area_code: string;
    }>;
    note?: string;
}

export interface UpdateInvitationPayload extends CreateInvitationPayload {
    id: string;
    active?: boolean;
}

// สำหรับ VMS API responses
export interface VMSInvitationResponse {
    id: string;
    code: string;
    guest_name: string;
    house_id: string;
    issuer: string;
    note: string;
    type: string;
    active: boolean;
    authorized_area: string[];
    vehicle_id: string[]; // จาก API จะได้เป็น vehicle IDs
    vehicles?: Array<{ // บางครั้งอาจมี vehicles object
        license_plate: string;
        area_code: string;
    }>;
    start_time: string;
    expire_time: string;
    stamped_time: string;
    stamper: string;
    created: string;
    updated: string;
}

// สำหรับการแสดงผลที่ประมวลผลแล้ว
export interface ProcessedInvitationRecord extends Omit<InvitationRecord, 'vehicle_id'> {
    vehicle_id: string[]; // จะเป็น license plates แทน IDs
    originalVehicleIds?: string[]; // เก็บ vehicle IDs เดิมไว้ถ้าต้องการ
}

// สำหรับ Stats Cards
export interface InvitationStats {
    total: number;
    active: number;
    inactive: number;
    pending: number; // รอเริ่มงาน
    expired: number; // หมดอายุแล้ว
    inProgress: number; // กำลังใช้งาน
}

// สำหรับ Filter และ Search
export interface InvitationFilters {
    active?: boolean;
    type?: string;
    house_id?: string;
    guest_name?: string;
    dateRange?: {
        start: string;
        end: string;
    };
}

// สำหรับ Pagination
export interface InvitationPaginationParams {
    page: number;
    perPage: number;
    filters?: InvitationFilters;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}