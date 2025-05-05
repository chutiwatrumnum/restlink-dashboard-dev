import type { ColumnsType} from "antd/es/table";
export interface ResidentAddNew {
  firstName: string;
  lastName: string,
  nickName: string,
  email: string;
  roleId: number,
  hobbyId: number,
  unitId: number,
  iuNumber: string
  contact: string,
  birthDate: string,
  channel: string,
  moveInDate: string,
  moveOutDate: string
  imageProfile: string
}
export interface blockDetail {
  label: string
  value: number
}
export interface unitDetail {
  label: string
  value: number
}
export interface roleDetail {
  label: string
  value: number
}
export interface hobbyDetail {
  label: string
  value: number
}
export interface DataType {
  key: string;
  name: string;
  totalVisitor: number;
  createdAt: string;
  bookingAt: string;
  startTime: string;
  endTime: string;
  isApproveAll: boolean;
  isRejectAll: boolean;
  status:string;
}
export interface IchildData{
  [index:number]:ExpandedDataType[]
}
 export interface ExpandedDataType {
  key: string;
  name: string;
  status: string;
  createDate: string;
  iuNumber: string;
  licensePlate: string;
  type:string;
  approved: boolean;
  reject: boolean;
}
export interface resdata {
  status: number
  data: any
}
export interface visitorType {
  tableData: DataType[];
  loading: boolean
  total: number
  residentMaxLength: number;
  filterData:conditionPage
  childrenVisitor:IchildData
}
export interface AnnouncePayloadType {
  search: string | null;
  curPage: number;
  perPage: number;
  startDate: Date | null;
  endDate: Date | null;
}

export interface conditionPage {
  perPage: number
  curPage: number
  search?: string
  startDate?: string
  endDate?: string
  sort?: string
  sortBy?: string
  reject?:boolean
}
export interface rejectRequest{
  userId:string,
  rejectReason:string
}
export interface columnTable{
  defaultTable:ColumnsType<DataType>,
  allTabsColumn:ColumnsType<DataType>,
  rejectTabsColumn:ColumnsType<DataType>,
}

export interface IApprovedBody{
 id:number
  status: "approve"|"reject"
}