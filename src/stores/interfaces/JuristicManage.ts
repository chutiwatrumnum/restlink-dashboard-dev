export interface JuristicAddNew {
  roleId: string | number;
  firstName: string;
  middleName?: string;
  lastName: string;
  contact: string;
  email: string;
  image?: string;
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
  code: string | null;
  firstName: string;
  lastName: string;
  middleName?: string | null;
  contact: string;
  email: string;
  expireDate: string;
  activate: boolean;
  activateBy?: {
    givenName: string;
    middleName?: string;
    familyName: string;
    contact?: string;
  } | null;
  activateDate?: string | null;
  failReason?: string | null;
  createdAt: string;
  project: {
    name: string;
    lat: number;
    long: number;
  };
  role: {
    name: string;
  };
  createdBy: {
    givenName: string;
    familyName: string;
  };
}

export interface JuristicInvitationsPromiseType {
  rows: InvitationsDataType[];
  total: number;
}

export interface JuristicEditPayload {
  givenName: string;
  familyName: string;
  middleName?: string;
  contact: string;
  roleId: string | number;
  image?: string;
}