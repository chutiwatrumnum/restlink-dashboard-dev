// Chat Interface
export interface ChatDataParams {
  sortBy?: string;
}
export interface ChatModelDataType {
  chatListSortBy: "time" | "unread";
  curPageChatData: number;
}

export interface ChatListDataType {
  message: string;
  type: "text" | "file" | "image";
  uploadUrl: string | null;
  fileName: string | null;
  seen: boolean;
  juristicSeen: boolean;
  createdAt: string;
  myHome: MyHome;
  user: User;
  messageId: number;
  userId: string;
  firstName?: string;
  floor?: number;
  fullName?: string;
  lastName?: string;
  roomAddress?: string;
  unitId?: number;
}

export interface MyHome {
  unitId: number;
  unit: Unit;
}

export interface Unit {
  unitNo: string;
  roomAddress: string;
}

export interface User {
  familyName: string;
  givenName: string;
  imageProfile: string;
}

export interface ChatDataType {
  messageId: number;
  message: string;
  messageType: string;
  uploadUrl: string;
  seen: boolean;
  createdAt: string;
  isMessageOwner: boolean;
  fileName?: string;
}

export interface SendChatDataType {
  type: "text" | "image" | "file";
  value: string;
  userId: string;
  unitId: number;
  fileName?: string;
}
