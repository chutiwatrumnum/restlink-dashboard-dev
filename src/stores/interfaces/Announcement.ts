import type { Dayjs } from "dayjs";

export interface AnnounceType {
  tableData: DataAnnouncementType[];
  announcementMaxLength: number;
}
export interface DataAnnouncementType {
  id: number;
  title: string;
  description?: string;
  active: boolean;
  url?: string;
  imageUrl?: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  createBy: DataAnnouncementCreateByType;
}
export interface DataAnnouncementCreateByType {
  id: string;
  lastName: string;
  firstName: string;
  middleName: string;
}
export interface AnnouncePayloadType {
  search: string | null;
  curPage: number;
  perPage: number;
  startDate: Date | null | undefined;
  endDate: Date | null | undefined;
}

export interface AddNewAnnouncementType {
  id?: number | null | undefined;
  title: string;
  description: string;
  link?: string;
  url?: string;
  image?: string;
  startDate: string;
  endDate: string;
  // unitList?: number[];
  imageUrl?: string;
  // all?: boolean;
}

export interface AnnounceFormDataType {
  id?: number;
  title?: string;
  image?: string;
  imageUrl?: string | null | undefined;
  status?: string;
  startDate?: string;
  startTime?: string;
  endDate?: string;
  endTime?: string;
  description?: string;
  link?: string;
  createdAt?: string;
  createBy?: DataAnnouncementCreateByType;
}
