export interface WarrantyDataType {
  key: string;
  total?: number;
  address?: string;
  owner?: string;
  contact?: string;
  nationality?: string;
  type?: string;
  tel?: string;
  email?: string;
}

export interface WarrantyDetailsType {
  key: string;
  image?: string;
  warrantyName?: string;
  serialNumber?: string;
  purchaseDate?: string;
  expireDate?: string;
  createdAt: string;
}

export interface WarrantyFormDataType {
  key?: string;
  image?: string;
  warrantyName?: string;
  serialNumber?: string;
  purchaseDate?: string;
  expireDate?: string;
  createDate?: string;
}
export interface paginationWarranty {
  perPage: number
  curPage: number
  search?: string
  startDate?: string
  endDate?: string
  sort?: string
  sortBy?: string
}