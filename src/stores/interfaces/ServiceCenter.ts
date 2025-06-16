export interface ServiceCenterSelectListType {
  label: string;
  value: string;
}

export interface ServiceCenterPayloadType {
  search: string | null;
  curPage: number;
  perPage: number;
  status: string | null;
  startMonth?: Date;
  endMonth?: Date;
  serviceTypeId?: string;
  unitId?: string;
}

// Updated interface for appointment slots with date and time
export interface AppointmentSlot {
  id: string;
  date: string | null; // ISO date string format
  startTime: string | null; // HH:mm format
  endTime: string | null; // HH:mm format
}

// Interface for appointment data in component state (using dayjs)
export interface AppointmentSlotState {
  id: string;
  date: any | null; // dayjs object
  timeRange: [any | null, any | null] | null; // dayjs objects for time range
}

export interface ServiceCenterDataType {
  id: number;
  description: string;
  fullname: string;
  serviceTypeName: string;
  statusName: string;
  roomAddress: string;
  actionDate: null;
  completedDate: null;
  acknowledgeDate: null;
  cause: null;
  solution: null;
  tel: string;
  createdAt: Date;
  status: ServiceType;
  statusId: number | null;
  createdBy: CreatedBy;
  unit: Unit;
  serviceType: ServiceType;
  imageItems: ImageItem[];
  closedWithReject: boolean;
  // ✅ เปลี่ยนจาก optional เป็น required พร้อม default value
  requestCloseCase: boolean;
  requestNewAppointment: boolean;
  requestReschedule: boolean; // ✅ ลบ ? ออกเพื่อให้เป็น required
  appointmentDate: Date | AppointmentSlot[] | AppointmentSlotLegacy[]; // Updated to support both formats
  appointmentDateConfirmAppointment?: Date;
  appointmentDateConfirmAppointmentID?: number;
  appointmentDeclined?: boolean; // Added for decline functionality
}

// Legacy format for backward compatibility
export interface AppointmentSlotLegacy {
  date: string;
  // No startTime/endTime for legacy format
}

export interface CreatedBy {
  familyName: string;
  givenName: string;
  middleName: string;
}

export interface ImageItem {
  id: number;
  imageUrl: string;
  imageStatus: ServiceType;
  imageStatusId?: number; // Added for status ID reference
}

export interface ServiceType {
  nameCode: string;
  nameEn: string;
}

export interface Unit {
  unitNo: string;
  roomAddress: string;
  floor: number;
}

export interface ServiceCenterModelDataType {
  status: "pending" | "repairing" | "success" | "all";
}

export interface EditDataServiceCenter {
  id: number;
  statusId: number;
  acknowledgeDate?: string;
  actionDate?: string;
  cause?: string;
  completedDate?: string;
  solution?: string;
  currentStatus: string;
  appointmentDate?: string[] | AppointmentSlot[] | FormattedAppointmentData[]; // Updated to support new format
  appointmentDateConfirmAppointment?: string;
  appointmentDateConfirmAppointmentID?: number;
}

export interface UploadImage {
  serviceId: number | null;
  imageStatus: number | null;
  image: string;
}

export interface disableColumnServiceCenter {
  actionDate: boolean;
  cause: boolean;
  solution: boolean;
  completedDate: boolean;
  acknowledgeDate: boolean;
}

export interface DeleteImage {
  serviceId: number;
  imageBucketId: number;
}

export interface ChartPileServiceCenter {
  statusNameCode: string;
  status: string;
  total: number;
}

export interface ServiceCenterChartPayloadType {
  startMonth: string;
  endMonth: string;
  serviceTypeId?: string;
}

export interface StatCardProps {
  title: string;
  value: number | string;
  icon?: React.ReactNode;
  color?: string;
}

// Updated interfaces for appointment slot validation and formatting
export interface AppointmentValidationResult {
  isValid: boolean;
  message?: string;
}

export interface FormattedAppointmentData {
  date: string;
  startTime: string;
  endTime: string;
}