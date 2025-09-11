export interface WarrantyDataType {
  id?: string | number;
  total?: number;
  address?: string;
  owner?: string;
  contact?: string;
  type?: string;
  tel?: string;
  email?: string;
  expand?: WarrantyDetailsType[];
  user?: any;
  unit?: any;
  projectId?: string;
}

export interface WarrantyDetailsType {
  id?: string;
  key: string;
  image?: string;
  warrantyName?: string;
  serialNumber?: string;
  purchaseDate?: string;
  expireDate?: string;
  createdAt: string;
  owner?: string;
  address?: string;
  startDate?: string;
  notifyDateBeforeExpiration?: number | string;
  user?: any;
  unit?: any;
  projectId?: string;
  setSelectedWarranty?: (warranty: WarrantyDetailsType) => void;
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