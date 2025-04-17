export interface ManagementDataType {
  key: string;
  image?: string;
  name?: string;
  firstName: string;
  lastName: string;
  role: string;
  contact: string;
  email: string;
  middleName: string;
  activate: boolean;
  updatedAt: string;
  updatedByUser?: UpdateByUserType;
}

export interface UpdateByUserType {
  lastName: string;
  firstName: string;
  email: string;
}

export interface ManagementFormDataType {
  key?: string;
  image?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  middleName?: string | null;
  role?: string;
  contact?: string;
  email?: string;
}

export interface ManagementAddDataType {
  firstName: string;
  lastName: string;
  middleName: string;
  email: string;
  roleId: number;
  contact: string;
  channel: string;
  imageProfile?: string;
}
export interface blockDetail {
  label: string;
  value: number;
}
export interface unitDetail {
  label: string;
  value: number;
}
export interface roleDetail {
  label: string;
  value: number;
}
export interface hobbyDetail {
  label: string;
  value: number;
}
export interface resdata {
  status: number;
  data: any;
}
export interface MSCTType {
  tableData: ManagementDataType[];
  loading: boolean;
  total: number;
  residentMaxLength: number;
}

export interface conditionPage {
  perPage: number;
  curPage: number;
  search?: string;
  startDate?: string;
  endDate?: string;
  sort?: string;
  sortBy?: string;
}
