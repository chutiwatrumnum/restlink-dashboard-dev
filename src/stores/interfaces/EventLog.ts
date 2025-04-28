import type { Dayjs } from "dayjs";
export interface AnnouncePayloadType {
  search: string | null;
  curPage: number;
  perPage: number;
  startDate: Date | null;
  endDate: Date | null;
}

export interface AddNewEventLogsType {
  title: string;
  description: string;
  image: string;
  startTime: string | Dayjs;
  endTime: string | Dayjs;
  limitPeople: number;
  date: string | Dayjs;
  isPayable: boolean;
  fee?: number;
  isAllowVisitor: boolean;
  unitId: number[];
  unitAll: boolean;
  isMaxBookingPerUnit: boolean;
  maxBookingPerUnit?: number;
}
export interface EditEventLogsType {
  id: number;
  title: string;
  description: string;
  image?: string | null;
  startTime: string | Dayjs;
  endTime: string | Dayjs;
  limitPeople: number;
  date: string | Dayjs;
  isPayable: boolean;
  fee?: number;
  isAllowVisitor: boolean;
  unitId: number[];
  unitAll?: boolean;
  isMaxBookingPerUnit: boolean;
  maxBookingPerUnit?: number;
}
export interface dataEventJoinLogsType {
  key: number;
  eventName: string;
  joiningDate: string;
  blockNo: string;
  unitNo: string;
  participant: number;
  bookingBy: string;
}
export interface dataEventLogsType {
  key: number;
  title: string;
  description: string;
  status: string;
  limitPeople: number;
  createDate: string;
  startDate: string;
  startTime: string;
  endTime: string;
  visitorRegister: string;
  createBy: string;
  unitAll:boolean;
  unitList: any;
  imageUrl: string;
  isPayable: boolean;
  fee: number;
  locked: boolean;
  currentBookingPeople: number;
  isMaxBookingPerUnit: boolean;
  maxBookingPerUnit?: number;
}
export interface IChangeLockedById {
  id: number;
  locked: boolean;
}
export interface dataEventJoinLogsByIDType {
  typeEventJoinLog: string;
  participant: string[];
}

export interface eventLogType {
  tableData: dataEventJoinLogsType[];
  tableDataEventLog: dataEventLogsType[];
  loading: boolean;
  total: number;
  EventMaxLength: number;
  filterData: conditionPage;
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
