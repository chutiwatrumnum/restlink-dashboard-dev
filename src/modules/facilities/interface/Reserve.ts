export interface ReserveSlotModalPropsType {
  roomSelected: RoomType;
  dateSelected: string;
  onCancel: Function;
  isLoading: boolean;
  isOpen: boolean;
}
export interface SlotSelectedType {
  index: number;
  startTime: string;
  endTime: string;
  timeShow: string;
}

export interface DataType {
  id: number;
  active: boolean;
  blockNo: string;
  unit: UnitRoomType[];
}

export interface UnitRoomType {
  id: number;
  active: boolean;
  unitNo: string;
  blockId: number;
}

export interface UserDataType {
  id: string;
  lastName: string;
  firstName: string;
  nickName: string;
  email: string;
  birthDate: string | null;
  moveInDate: string | null;
  moveOutDate: string | null;
  channel: string;
  iuNumber: string;
  imageProfile: string;
  contact: string;
  allowNotifications: boolean;
  rejectReason: any;
  createdBy: any;
  createdAt: string;
  role: RoleUserDataType;
  unit: UnitUserDataType;
}

export interface RoleUserDataType {
  id: number;
  name: string;
}

export interface UnitUserDataType {
  id: number;
  unitNo: string;
  blockId: number;
  blockNo: string;
}

export interface ReserveFacilityPropsType {
  room: RoomType;
}

export interface RoomType {
  label: string;
  value: number;
}
