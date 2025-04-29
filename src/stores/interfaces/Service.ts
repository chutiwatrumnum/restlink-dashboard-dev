// Service Chat Interface

// export interface ServiceChatListDataType {
//   messageId: number;
//   message: string;
//   type: "text" | "file" | "image";
//   uploadUrl?: string;
//   fileName?: string;
//   userId: string;
//   seen: boolean;
//   createdAt: string;
//   lastName: string;
//   firstName: string;
//   middleName: string;
//   unit: number;
//   serviceDescription: string;
//   serviceType: string;
//   serviceStatusNameCode: string;
//   serviceStatus: string;
//   unitNo: string;
//   roomAddress: string;
//   serviceId: number;
//   imageProfile: string;
//   juristicSeen: boolean;
// }

export interface ServiceChatListDataType {
  message: string;
  type: "text" | "file" | "image";
  uploadUrl?: string;
  fileName?: string;
  seen: boolean;
  juristicSeen: boolean;
  createdAt: string;
  user: User;
  service: Service;
  messageId: number;
  userId: string;
  serviceId: number;
  myHome: MyHome;
  serviceType?: string;
  roomAddress?: string;
}

export interface User {
  familyName: string;
  givenName: string;
  imageProfile: string;
}

export interface Service {
  description: string;
  serviceType: ServiceType;
  serviceStatus: ServiceStatus;
}

export interface ServiceType {
  nameEn: string;
}

export interface ServiceStatus {
  nameCode: string;
  nameEn: string;
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

export interface MyHome {
  unitId: number;
  unit: Unit;
}

export interface Unit {
  unitNo: string;
  roomAddress: string;
}

export interface OwnerMessage {
  familyName: string;
  givenName: string;
  imageProfile: string;
}

export interface SendServiceChatDataType {
  type: "text" | "image" | "file";
  value: string;
  serviceId: number;
  userId: string;
  fileName?: string;
}
