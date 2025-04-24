// Service Chat Interface

export interface ServiceChatListDataType {
  messageId: number;
  message: string;
  type: "text" | "file" | "image";
  uploadUrl?: string;
  fileName?: string;
  userId: string;
  seen: boolean;
  createdAt: string;
  lastName: string;
  firstName: string;
  middleName: string;
  unit: number;
  serviceDescription: string;
  serviceType: string;
  serviceStatusNameCode: string;
  serviceStatus: string;
  unitNo: string;
  roomAddress: string;
  serviceId: number;
  imageProfile: string;
  juristicSeen: boolean;
}

export interface ServiceChatDataType {
  id: number;
  message: string;
  type: string;
  uploadUrl: string;
  seen: boolean;
  createdAt: string;
  isMessageOwner: boolean;
  isResident: boolean;
  ownerMessage: OwnerMessage;
  serviceId: number;
  fileName?: string;
}

export interface OwnerMessage {
  lastName: string;
  firstName: string;
  middleName: string;
  imageProfile: string;
}

export interface SendServiceChatDataType {
  type: "text" | "image" | "file";
  value: string;
  serviceId: number;
  userId: string;
  fileName?: string;
}
