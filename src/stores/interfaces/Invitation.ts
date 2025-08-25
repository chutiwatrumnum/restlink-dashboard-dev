import dayjs from "dayjs";
export interface InvitationRecord {
    house_address: string;
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
    stamped_time: string; // เพิ่ม field สำหรับ e-stamp
    stamper: string; // เพิ่ม field สำหรับผู้ประทับตรา
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
    stamped_time: string; // เพิ่ม field สำหรับ e-stamp
    stamper: string; // เพิ่ม field สำหรับผู้ประทับตรา
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
    stamped: number; // ประทับตราแล้ว
    unstamped: number; // ยังไม่ประทับตรา
    byType: Record<string, number>; // สถิติตามประเภท
}

// สำหรับ Filter และ Search - Updated with universal search
export interface InvitationFilters {
    active?: boolean;
    type?: string;
    house_id?: string;
    searchText?: string; // เปลี่ยนจาก guest_name เป็น searchText แบบรวม (ชื่อ, ที่อยู่, ป้ายทะเบียน)
    stamped?: boolean; // เพิ่ม filter สำหรับการประทับตรา
    dateRange?: [dayjs.Dayjs, dayjs.Dayjs] | null; // เปลี่ยนเป็น dayjs
    stamper?: string; // filter ตามผู้ประทับตรา
    expiredStatus?: 'expired' | 'active' | 'upcoming'; // filter ตามสถานะการหมดอายุ
}

// สำหรับ Pagination - Updated with better filter support
export interface InvitationPaginationParams {
    page: number;
    perPage: number;
    filters?: InvitationFilters;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

// สำหรับ E-Stamp API
export interface EStampRequest {
    invitationId: string;
}

export interface EStampResponse {
    id: string;
    stamped_time: string;
    stamper: string;
    message: string;
}

// สำหรับ Filter State Management
export interface FilterState {
    searchText: string;
    statusFilter: boolean | undefined;
    typeFilter: string | undefined;
    stampedFilter: boolean | undefined;
    dateRangeFilter: [dayjs.Dayjs, dayjs.Dayjs] | null;
    activeFiltersCount: number;
}

// สำหรับ Table Column Props
export interface InvitationTableColumn {
    key: string;
    title: string;
    dataIndex?: string;
    width?: string;
    align?: 'left' | 'center' | 'right';
    sorter?: boolean | object;
    render?: (value: any, record: InvitationRecord, index: number) => React.ReactNode;
    filters?: Array<{ text: string; value: any }>;
    onFilter?: (value: any, record: InvitationRecord) => boolean;
}

// สำหรับ Export Data
export interface ExportInvitationData {
    guest_name: string;
    house_address: string;
    type: string;
    status: string;
    start_time: string;
    expire_time: string;
    stamped_status: string;
    stamped_time: string;
    stamper: string;
    vehicle_plates: string;
    authorized_areas: string;
    note: string;
}

// สำหรับ Bulk Operations
export interface BulkOperationPayload {
    invitationIds: string[];
    operation: 'delete' | 'stamp' | 'activate' | 'deactivate';
    reason?: string;
}

export interface BulkOperationResult {
    success: string[];
    failed: Array<{
        id: string;
        error: string;
    }>;
    total: number;
    successCount: number;
    failedCount: number;
}