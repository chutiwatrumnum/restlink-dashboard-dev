export interface WarrantyDataType {
  key: string;
  address?: string;
  owner?: string;
  nationality?: string;
  type?: string;
  tel?: string;
  email?: string;
  createdAt: string;
  details?: WarrantyDetailsType[];
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
