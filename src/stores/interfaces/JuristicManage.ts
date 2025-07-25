import type { ColumnsType } from "antd/es/table";

export interface JuristicManageDataType {
  userId: string;
  familyName: string;
  givenName: string;
  email: string;
  role: Role;
  unit: Unit;
  active: boolean;

  middleName?: string;
  nickName?: string;
  birthDate?: string;
  imageProfile?: string;
  contact?: string;
  createdAt: string;
  updatedBy?: string;
  updatedAt?: string;
}

export interface Role {
  id: number;
  name: string;
  roleCode: string;
  roleManageCode: string;
}

export interface Unit {
  unitNo: string;
  roomAddress: string;
  block: Block;
}

export interface Block {
  blockNo: string;
}

export interface JuristicManageFormDataType {
  id: string;
  familyName: string;
  givenName: string;
  email: string;
  role: Role;
  unit: Unit;
  active: boolean;

  middleName?: string;
  nickName?: string;
  tel?: string;
  birthDate?: string;
  imageProfile?: string;
  contact?: string;
  createdAt: string;
  updatedBy?: string;
  updatedAt?: string;
}
// From obv88
export interface JuristicAddNew {
  roleId: number;
  givenName: string;
  familyName: string;
  contact: string;

  middleName?: string;
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
export interface DataType {
  key: string;
  firstName: string;
  lastName: string;
  nickName: string;
  email: string;
  role: string;
  unitNo: string;
  iuNumber: string;
  contact: string;
  birthDate: string | null;
  blockNo: string;
  hobby: string;
  moveInDate: string;
  moveOutDate: string;
  createdAt: string;
  rejectAt: string;
  rejectReason: string;
  rejectUser: string;
  middleName: string;
}
export interface resdata {
  status: number;
  data: any;
}
export interface JuristicType {
  tableData: JuristicManageDataType[];
  loading: boolean;
  total: number;
  juristicMaxLength: number;
  qrCode: string;
}
export interface AnnouncePayloadType {
  search: string | null;
  curPage: number;
  perPage: number;
  startDate: Date | null;
  endDate: Date | null;
}

export interface conditionPage {
  perPage: number;
  curPage: number;
  verifyByJuristic: boolean;
  search?: string;
  startDate?: string;
  endDate?: string;
  sort?: string;
  sortBy?: string;
  reject?: boolean;
  isActive: boolean;
}
export interface rejectRequest {
  userId: string;
  rejectReason: string;
}
export interface columnTable {
  defaultTable: ColumnsType<DataType>;
  allTabsColumn: ColumnsType<DataType>;
  rejectTabsColumn: ColumnsType<DataType>;
  waitActiveTabsColumn: ColumnsType<DataType>;
}

export interface GetInvitationsType {
  activate: boolean;
  curPage: number;
}

export interface JuristicInvitationsPromiseType {
  rows: InvitationsDataType[];
  total: number;
}

export interface InvitationsDataType {
  // default values
  id: string;
  activateBy: ActivateBy;
  role: InvitationsRole;
  activate: boolean;
  createdBy: CreatedBy;
  project: Project;
  // Inactivated values
  createdAt?: string;
  expireDate?: string;
  code?: string;
  // Activated values
  activateDate?: string;
}

export interface ActivateBy {
  userId: string;
  familyName: string;
  givenName: string;
  contact: string;
}

export interface Project {
  name: string;
  lat: number;
  long: number;
}

export interface InvitationsRole {
  name: string;
}

export interface InvitationsUnit {
  unitNo: string;
  roomAddress: string;
  floor: number;
}

export interface CreatedBy {
  familyName: string;
  givenName: string;
}

export interface UserRoomListType {
  blockNo: string;
  floor: number;
  roleName: string;
  roomAddress: string;
  unitNo: string;
}

export interface JoinPayloadType {
  code: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  contact: string;
}
