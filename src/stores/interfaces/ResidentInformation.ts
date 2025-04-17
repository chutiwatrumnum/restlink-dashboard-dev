export interface ResidentInformationDataType {
  key: string;
  firstName: string;
  lastName: string;
  roomAddress:string;
  email: string;
  role: string;
  hobby: string;
  moveInDate: string;
  moveOutDate: string;
  channel: string;
  lockerCode?: string;
  updatedAt?: string;
  updatedBy?: string;
  id?: string;
  middleName?: string;
  nickName?: string;
  birthDate?: string;
  active?: boolean;
  verifyByJuristic?: boolean;
  imageProfile?: string;
  contact?: string;
  reject?: boolean;
  rejectReason?: string;
  rejectAt?: string;
  createdAt?: string;
  rejectUser?: string;
  reSendStatus:boolean
}

export interface ResidentInformationFormDataType {
  key: string;
  firstName: string;
  lastName: string;
  roomAddress:string;
  email: string;
  role: string;
  hobby: string;
  moveInDate: string;
}
