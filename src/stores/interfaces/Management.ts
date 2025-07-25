export interface ManagementDataType {
  key: string;
  image?: string;
  name?: string;
  firstName: string;
  lastName: string;
  role: string;
  contact: string;
  email: string;
  middleName: string;
  activate: boolean;
  updatedAt: string;
  updatedByUser?: UpdateByUserType;
}

export interface UpdateByUserType {
  lastName: string;
  firstName: string;
  email: string;
}

export interface ManagementFormDataType {
  key?: string;
  image?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  middleName?: string | null;
  role?: string;
  contact?: string;
  email?: string;
}

export interface ManagementAddDataType {
  firstName: string;
  lastName: string;
  middleName: string;
  email: string;
  roleId: number;
  contact: string;
  channel: string;
  imageProfile?: string;
}
export interface blockDetail {
  label: string;
  value: number;
}
export interface unitDetail {
  label: string;
  value: number;
}
export interface roleDetail {
  label: string;
  value: number;
}
export interface hobbyDetail {
  label: string;
  value: number;
}
export interface resdata {
  status: number;
  data: any;
}
export interface MSCTType {
  tableData: ManagementDataType[];
  loading: boolean;
  total: number;
  residentMaxLength: number;
}

export interface conditionPage {
  perPage: number;
  curPage: number;
  search?: string;
  startDate?: string;
  endDate?: string;
  sort?: string;
  sortBy?: string;
}

export interface BlockDataType {
  data: Block[];
  total: number;
}

export interface Block {
  active: boolean;
  blockName: string;
  id: number;
  totalOfFloor: number;
}

export interface FloorType {
  data: Floor[];
  total: number;
}

export interface Floor {
  active: boolean;
  floorName: string;
  id: number;
  isBasement: boolean;
  numberOfFloor: number;
}

// Unit
export interface UnitType {
  data: Unit[];
  total: number;
}

export interface Unit {
  id: number;
  roomAddress: string;
  unitNo: string;

  family?: number;
  unitOwner?: UnitOwner;
}

export interface UnitOwner {
  familyName: string;
  givenName: string;
  middleName?: string;
  contact: string;
}

// Member
export interface MemberType {
  memberId: number;
  memberName: string;
  unitId: number;
  role: string;
}
