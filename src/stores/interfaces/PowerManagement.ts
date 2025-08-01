export interface PowerManagementDataType {
  areaData: AreaDataType[];
  devicesData: DevicesDataType[];
}

export interface AreaDataType {
  id: number;
  name: string;
  subName: string;
  imageUrl: string;
  startTime: string;
  endTime: string;
  active: boolean;
  status: number;
  rcuConfigList: RcuConfigList[];
}

export interface RcuConfigList {
  id: number;
  rcuControlAreaId: number;
  name: string;
  subName: string;
  imageUrl: string;
  active: boolean;
  groupShow: string;
  deviceType: string;
  status: number;
}

export interface AreaPutDataType {
  id: string;
  start: string;
  end: string;
  time: string;
}

export interface AreaPostDataType {
  id: string;
  start: string;
  end: string;
  time: string;
}

export interface DevicesDataType {
  id: number;
  name: string;
  imageUrl: string;
  deviceList: DeviceListType[];
}

export interface DeviceListType {
  id: number;
  rcuControlAreaId: number;
  name: string;
  snumOpen: number;
  snumClose: number;
  ip: string;
}
