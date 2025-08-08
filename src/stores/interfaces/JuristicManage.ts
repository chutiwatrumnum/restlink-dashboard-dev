// อัพเดต interface สำหรับ JuristicAddNew ในไฟล์ stores/interfaces/JuristicManage.ts

export interface JuristicAddNew {
  roleId: string | number;
  firstName: string;
  middleName?: string;
  lastName: string;
  contact: string;
  email: string;
  image?: string; // เพิ่มฟิลด์ image (optional)

  // เก็บฟิลด์เก่าไว้เพื่อความเข้ากันได้ (deprecated)
  givenName?: string;
  familyName?: string;
}

export interface JuristicManageDataType {
  userId: string;
  givenName: string;
  middleName?: string;
  familyName: string;
  nickName?: string;
  contact: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  role: {
    id: string;
    name: string;
  };
  unit: {
    id: number;
    roomAddress: string;
  };
  // เพิ่มฟิลด์ใหม่
  firstName?: string;
  lastName?: string;
  image?: string;
}

export interface conditionPage {
  perPage: number;
  curPage: number;
  verifyByJuristic?: boolean;
  reject?: boolean;
  isActive?: boolean;
  startDate?: string;
  endDate?: string;
  search?: string;
  sort?: string;
  sortBy?: string;
}

export interface roleDetail {
  label: string;
  value: string;
}

export interface hobbyDetail {
  label: string;
  value: string;
}

export interface unitDetail {
  label: string;
  value: string;
}

export interface rejectRequest {
  userId: string;
  reason: string;
}

export interface JoinPayloadType {
  firstName: string;
  middleName?: string;
  lastName: string;
  contact: string;
  image?: string;
}

export interface GetInvitationsType {
  activate: boolean;
  curPage: number;
}

export interface InvitationsDataType {
  id: string;
  code: string;
  roleId: string;
  expireDate: string;
  activateDate?: string;
  createdAt: string;
  activateBy?: {
    givenName: string;
    middleName?: string;
    familyName: string;
    contact?: string;
  };
  role: {
    id: string;
    name: string;
  };
  createdBy: {
    givenName: string;
    middleName?: string;
    familyName: string;
  };
}

export interface JuristicInvitationsPromiseType {
  rows: InvitationsDataType[];
  total: number;
}