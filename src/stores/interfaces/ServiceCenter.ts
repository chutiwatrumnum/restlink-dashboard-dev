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
  acknowledgeDate: string;
  actionDate: string;
  cause: string;
  completedDate: string;
  solution: string;
  currentStatus: string;
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
