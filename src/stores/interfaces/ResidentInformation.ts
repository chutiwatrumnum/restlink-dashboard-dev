import type { ColumnsType } from "antd/es/table";

// export interface ResidentInformationDataType {
//   key: string;
//   firstName: string;
//   lastName: string;
//   roomAddress: string;
//   email: string;
//   role: string;
//   hobby: string;
//   moveInDate: string;
//   moveOutDate: string;
//   channel: string;
//   lockerCode?: string;
//   updatedAt?: string;
//   updatedBy?: string;
//   id?: string;
//   middleName?: string;
//   nickName?: string;
//   birthDate?: string;
//   active?: boolean;
//   verifyByJuristic?: boolean;
//   imageProfile?: string;
//   contact?: string;
//   reject?: boolean;
//   rejectReason?: string;
//   rejectAt?: string;
//   createdAt?: string;
//   rejectUser?: string;
//   reSendStatus: boolean;
// }

export interface ResidentInformationDataType {
  id: string;
  familyName: string;
  givenName: string;
  nickName?: string;
  email: string;
  birthDate?: string;
  active: boolean;
  imageProfile?: string;
  contact?: string;
  createdAt: string;
  updatedBy?: string;
  updatedAt?: string;
  role: Role;
  unit: Unit;
}

export interface Role {
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

export interface ResidentInformationFormDataType {
  roleId: number;
  unitId: string;
}
// From obv88
export interface ResidentAddNew {
  firstName: string;
  lastName: string;
  nickName: string;
  email: string;
  roleId: number;
  hobby: string;
  unitId: number;
  iuNumber: string;
  contact: string;
  birthDate: string;
  channel: string;
  moveInDate: string;
  moveOutDate: string;
  imageProfile: string;
  middleName: string;
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
export interface residentType {
  tableData: ResidentInformationDataType[];
  loading: boolean;
  total: number;
  residentMaxLength: number;
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

export interface ResidentInvitationsPromiseType {
  rows: InvitationsDataType[];
  total: number;
}

export interface InvitationsDataType {
  id: string;
  code: string;
  expireDate: string;
  activate: boolean;
  activateBy: ActivateBy;
  createdAt: string;
  project: Project;
  role: InvitationsRole;
  unit: InvitationsUnit;
  createdBy: CreatedBy;
}

export interface ActivateBy {
  sub: string;
  familyName: string;
  givenName: string;
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
