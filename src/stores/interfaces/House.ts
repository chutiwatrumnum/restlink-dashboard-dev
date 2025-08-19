// ไฟล์: src/stores/interfaces/House.ts

export interface HouseRecord {
    id: string;
    address: string;
    area: string;
    parking_quota: number;
    created: string;
    updated: string;
}

export interface HouseListResponse {
    page: number;
    perPage: number;
    totalItems: number;
    totalPages: number;
    items: HouseRecord[];
}

export interface HouseType {
    tableData: HouseRecord[];
    loading: boolean;
    total: number;
    currentPage: number;
    perPage: number;
}