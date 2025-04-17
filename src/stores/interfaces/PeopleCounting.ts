export interface PeopleCountingType {
  peopleCountingData: PeopleCountingDataType[];
}
export interface PeopleCountingDataType {
  id: number;
  totalPeople: number;
  lowStatus: number;
  mediumStatus: number;
  highStatus: number;
  facility: FacilityType;
  status: string;
}
export interface FacilityType {
  name: string;
  imageUrl: string;
  description: string;
}

export interface PeopleCountingFormDataType {
  id?: number;
  roomName?: string;
  detail?: string;
  lowStatus: number;
  mediumStatus: number;
  highStatus: number;
  openTime?: string;
  closedTime?: string;
}
