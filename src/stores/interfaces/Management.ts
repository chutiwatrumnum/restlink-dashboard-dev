// stores/interfaces/Management.ts

export interface Floor {
  id: number;
  floorName: string;
  active: boolean;
  isBasement: boolean;
  numberOfFloor: number;
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

export interface Block {
  id: number;
  blockName: string;
  active: boolean;
  totalOfFloor: number;
}

export interface BlockDataType {
  data: Block[];
  total: number;
}

export interface FloorType {
  data: Floor[];
  total: number;
}

export interface UnitType {
  data: Unit[];
  total: number;
}

export interface MemberType {
  memberId: number;
  memberName: string;
  unitId: number;
  role: string;
}

// สำหรับ Modal
export interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  unitInfo?: {
    address: string;
    roomNo: string;
    unitId: number;
  };
}

export interface MockUser {
  id: number;
  name: string;
  email: string;
  avatar?: string | null;
  status: "Owner" | "Tenant" | "Inhabitant";
}

export interface AddUserFormData {
  name: string;
  email: string;
  phone: string;
  role: "owner" | "tenant" | "inhabitant";
}