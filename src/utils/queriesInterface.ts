// Chat Interface
export interface ChatDataParams {
  sortBy?: string;
}

export interface ChatModelDataType {
  chatListData: ChatListDataType[];
  chatDataById: ChatDataType[];
}

export interface ChatListDataType {
  messageId: number;
  message: string;
  type: "text" | "file" | "image";
  uploadUrl: string | null;
  seen: boolean;
  createdAt: string;
  lastName: string;
  firstName: string;
  middleName: string;
  unit: number;
  unitNo: string;
  roomAddress: string;
  imageProfile: string;
  userId: string;
  juristicSeen: boolean;
  // serviceId: number;
}

export interface ChatDataType {
  messageId: number;
  message: string;
  messageType: string;
  uploadUrl: string;
  seen: boolean;
  createdAt: string;
  isMessageOwner: boolean;
}

export interface SendChatDataType {
  type: "text" | "image" | "file";
  value: string;
  userId: string;
  fileName?: string;
}
