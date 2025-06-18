export interface SosWarningDataType {
    name: string;
    tel: string;
    planType: string;
    address: string;
    lat: string;
    long: string;
}
export interface paginationSosWarning {
    perPage: number
    curPage: number
    search?: string
    startDate?: string
    endDate?: string
    sort?: string
    sortBy?: string
}
