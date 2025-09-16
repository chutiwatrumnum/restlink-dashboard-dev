export interface PeopleCountingType {
  peopleCountingData: PeopleCountingDataType[];
}
export interface FacilityType {
  name: string;
  image: string;
  description: string;
}

export interface PeopleCountingFormDataType {
  id?: number | string;
  name?: string;
  description: string;
  statusLow: number | string;
  statusMedium: number | string;
  statusHigh: number | string;
  sort?: number | string;
  image?: File | string;
  active?: boolean;
  cameraIp?: number;
  icon?: File | string;
}

export interface PeopleCountingDataType {
  id?: number | string;
  name?: string;
  description?: string;
  active?: boolean;
  currentCount?: number;
  image?: File | string;
  status?: string;
  statusLow?: number | string;
  statusMedium?: number | string;
  statusHigh?: number | string;
  cameraIp?: number;
  icon?: string;
  sort?: number | string;
}
