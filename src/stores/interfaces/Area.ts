// ไฟล์: src/stores/interfaces/Area.ts

export interface AreaRecord {
    id: string;
    name: string;
    note: string;
    gates: string[];
    created: string;
    updated: string;
}

export interface AreaListResponse {
    page: number;
    perPage: number;
    totalItems: number;
    totalPages: number;
    items: AreaRecord[];
}

export interface AreaType {
    tableData: AreaRecord[];
    loading: boolean;
    total: number;
    currentPage: number;
    perPage: number;
}