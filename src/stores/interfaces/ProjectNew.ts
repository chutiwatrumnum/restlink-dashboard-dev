import type { Dayjs } from "dayjs";

export interface ProjectNewType {
  tableData: DataProjectNewType[];
  announcementMaxLength: number;
}
export interface DataProjectNewType {
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
  createBy: DataProjectNewCreateByType;
}
export interface DataProjectNewCreateByType {
  id: string;
  lastName: string;
  firstName: string;
  middleName: string;
}
export interface ProjectNewPayloadType {
  search: string | null;
  curPage: number;
  perPage: number;
  startDate: Date | null | undefined;
  endDate: Date | null | undefined;
}

export interface AddNewProjectNewType {
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

export interface ProjectNewFormDataType {
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
  createBy?: DataProjectNewCreateByType;
}
