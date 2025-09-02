export interface FacilitiesDataType {
  paramsAPI: conditionPage;
  reserveSlotTime: {
    index: number;
    startTime: string;
    endTime: string;
    timeShow: string;
  }[];
  peopleCountingData?: PeopleCountingDataType;
  reservationListData: ReservationListDataType[];
  reservedListData?: ReservedListDataType;
  unitListData: ReservedUnitDataType[];
  userData?: UserDataType;
  residentByUnit: ResidentDataType[];
}
export interface DataType {
  key: string;
  refBooking: string;
  purpose: string;
  joiningDate: string;
  blockNo: string;
  unitNo: string;
  roomAddress: string;
  status: string;
  createdAt: string;
  startEndTime: string;
  bookedBy: string;
  approve: boolean;
  reject: boolean;
  juristicConfirm: boolean;
}

export interface ReserveSlotTimeType {
  id: number;
  date: string;
}

export interface CreateMaintenanceFacilities {
  facilitiesId: number | null;
  sendMailGroup?: string[];
  sendMailGroupId?: number;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  note?: string;
  remindNotiDays?: number;
}

export interface conditionPage {
  perPage: number;
  curPage: number;
  facilitiesId: number;
  search?: string;
  startDate?: string;
  endDate?: string;
  sort?: string;
  sortBy?: string;
}

export interface dataItem {
  label: string;
  value: number;
  imageId: string;
}
export interface pageType {
  defaultPageSize: number;
  pageSizeOptions: number[];
  current: number;
  showSizeChanger: boolean;
  total: number;
}
export interface ReserveFacilityType {
  userId: string;
  purpose: string;
  joinAt: string;
  startTime: string;
  endTime: string;
  unitNo: number;
  roomAddress: string;
  facilitiesId: number;
  contactNo: string;
  email: string;
  note: string | null | undefined;
}
export interface Ibooking {
  bookingBy: string;
  unit: string;
  contactNo: string;
}

export interface PeopleCountingDataType {
  id: number;
  roomName: string;
  description: string;
  priority: number;
  active: boolean;
  roomImgs: string;
  totalPeople: number;
  lowStatus: number;
  mediumStatus: number;
  highStatus: number;
  updatedAt: string;
  open?: string;
  close?: string;
}

export interface ReservationListDataType {
  id: number;
  name: string;
  subName: string;
  imageUrl?: string;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
  limitPeople: number;
  description?: string;
  locked?: boolean;
  startTime?: string;
  endTime?: string;
  isEquipment?: boolean;
  equipment?: ReservationListDataEquipmentType[];
  facilitiesRules?: FacilitiesRuleType[];
  accommodates?: AccommodateType[];
  maxDayCanBooking?: number;
  maximumHourBooking?: string;
  facilitiesItems?: FacilitiesItemsType[];
}

export interface AddNewFacilityPayloadType {
  name: string;
  subName: string;
  description: string;
  startTime: string;
  endTime: string;
  limitPeople: number;
  maximumHourBooking: string;
  imageUrl: string;
  facilitiesRules?: FacilitiesRuleType[];
  accommodates?: AccommodateType[];
}
export interface ReservationListDataEquipmentType {
  id: number;
  name: string;
  subName: string;
  imageUrl: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  limitPeople: number;
  description: string;
  locked: boolean;
  startTime: string;
  endTime: string;
  isEquipment: boolean;
  FacilitiesRuleTypes: FacilitiesRuleType[];
  AccommodateTypes: AccommodateType[];
}

export interface FacilitiesRuleType {
  name: string;
}

export interface AccommodateType {
  name: string;
}

export interface ReservedListDataType {
  total: number;
  rows: ReservedRowListDataType[];
}

export interface ReservedRowListDataType {
  id: number;
  refBooking: string;
  topic: string;
  joinAt: string;
  startTime: string;
  endTime: string;
  facilitiesId: number;
  countPeople: number;
  note: string;
  contactNo: string;
  createdAt: string;
  updatedAt: string;
  facilitiesItems: any;
  unit: string;
  bookingUser: BookingUser;
  qrCode: string;
  facilityName: string;
  createdUser: CreatedUser;
  createdByRole: CreatedByRoleType;
  status: ReservedStatusType;
}

export interface ReservedStatusType {
  nameCode:
    | "reserved"
    | "expired"
    | "activated"
    | "completed"
    | "cancel"
    | string;
  nameEn: string;
  nameTh: string;
}
export interface CreatedByRoleType {
  name: string;
  roleCode: string;
  roleManageCode: string;
  roleCodeName: string;
}

export interface BookingUser {
  familyName: string;
  givenName: string;
  middleName?: string;
}
export interface CreatedUser {
  familyName: string;
  givenName: string;
  middleName?: string;
}
export interface FacilitiesItemsType {
  description: string;
  itemName: string;
  label?: string;
}
export interface ReservedDataPayloadType {
  search: string | null;
  facilitiesId?: number;
  curPage: number;
  perPage: number;
  date?: string;
  sortBy?: "status"; // เช่น "status"
  sort?: "asc" | "desc";
}

export interface ReservedUnitDataType {
  id: number;
  unitNo: string;
  roomAddress: string;
  floor?: string;
}

export interface UserDataType {
  id: string;
  lastName: string;
  firstName: string;
  middleName: string;
  nickName: string;
  email: string;
  active: boolean;
  verifyByJuristic: boolean;
  channel: string;
  imageProfile: string;
  contact: string;
  createdAt: string;
  role: UserRoleType;
}
export interface UserRoleType {
  name: string;
  roleCode: string;
  roleManageCode: string;
}

export interface ReservedFormDataType {
  userId: string;
  facilitiesId: number;
  topic: string;
  joinAt: Date;
  startTime: Date;
  endTime: Date;
  note: string;
  contactNo: string;
  numberOfPeople: string;
  unitId?: string;
  adminId?: string;
  gymDeviceId?: string;
  zoneId?: string;
  facilitiesItemId?: number;
}
export interface ResidentDataType {
  familyName: string;
  givenName: string;
  middleName: string;
  fullName: string;
  userId: string;
}
