import type { Dayjs } from "dayjs";
export interface DeliveryLogsPayloadType {
  search: string | null;
  curPage: number;
  perPage: number;
  startDate: Date | null;
  endDate: Date | null;
}

export interface AddNewDeliveryLogsType {
  userId: string;
  unitId: number;
  reminderNotification: number ;
  senderType:string
  trackingNumber:string
  pickUpLocation:string
  startDate: string | Dayjs;
  startTime: string | Dayjs;
  endDate: string | Dayjs;
  endTime: string | Dayjs;
  comment?: string;
}
export interface EditDeliveryLogsType {
  id: number,
  userId: string;
  unitId: number;
  reminderNotification: number ;
  senderType:string
  trackingNumber:string
  pickUpLocation:string
  startDate: string | Dayjs;
  startTime: string | Dayjs;
  endDate: string | Dayjs;
  endTime: string | Dayjs;
  comment?: string | null;
}
export interface dataDeliveryLogsType{
  key:number
  name:string
  contact:string
  senderType:string
  trackingNumber:string
  blockId:number
  blockNo:string
  unitNo:string
  unitId:number
  createdAt:string
  FromDateTime:string,
  ToDateTime:string
  pickUpType:string
  collected:boolean
  reminderNotification:number
  comment:string
  startDate:string
  startTime:string
  endDate:string
  endTime:string
  pickUpLocation:string
}
export interface IChangeLockedById{
  id:number
  locked:boolean
}
export interface dataEventJoinLogsByIDType{
 typeEventJoinLog:string
  participant:string[]
}

export interface deliveryLogsType {
  tableDataDeliveryLog:dataDeliveryLogsType[],
  loading: boolean
  total: number
  EventMaxLength: number;
  filterData:conditionPage
}
export interface conditionPage {
  perPage: number
  curPage: number
  search?: string
  startDate?: string
  endDate?: string
  sort?: string
  sortBy?: string
}

export interface blockDetail {
  label: string
  value: number
}
export interface unitDetail {
  label: string
  value: number
}
