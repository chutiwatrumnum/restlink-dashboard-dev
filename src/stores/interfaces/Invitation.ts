// ไฟล์: src/stores/interfaces/Invitation.ts

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
    vehicle_id: string[];
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
    houseMapping: Map<string, string>; // เพิ่ม house mapping
}