interface planType{
    id: number;
    masterCode: string;
    nameEn: string; 
    nameTh: string;
}
  
interface unit{
    blockId: number;
    floor: number;
    id: number;
    roomAddress: string;
    unitNo: string; 
}

interface MarkerPosition {
    x: string;
    y: string;
    width: string;
    height: string;
  }
  
  interface Marker {
    id: string;
    name: string;
    color: string;
    shape: string;
    position: MarkerPosition;
    rotation: number;
    rotationDegrees: string;
    markersCount: number;
    unitID?: number;
  }
  

  interface Zone {
    id: number;
    name: string;
    color: string;
    shape: string;
    position: {
        x: string;
        y: string;
        width: string;
        height: string;
    };
    rotationDegrees: string;
}




export interface SosWarningDataType {
    name: string;
    tel: string;
    planType: string;
    address: string;
    lat: string;
    long: string;
}
export interface paginationSosWarning {
    perPage: number
    curPage: number
    search?: string
    startDate?: string
    endDate?: string
    sort?: string
    sortBy?: string
}

export interface BuildingCondo {
    numberOfBuilding: number;
    floor: number;
}


export interface dataSelectPlan{
    planType: planType[];
    planTypeCondo: planType[];
    unit: unit[];
}


export interface createPlan {
    projectName: string;
    planTypeID: number;
    planID: string;
}

export interface createPlanCondo {
    projectName: string;
    planTypeID: number;
    condoTypeID: number;
    floor: number;
    numberOfBuilding: number;
  }




export interface dataAllMap {
  id: string;
  projectName: string;
  planTypeId: number;
  planType: string;
  planTypeCondo: string;
  floor: string;
  planImage: string;
  marker: Marker[];
  zone: Zone[];
}

export  interface MarkerProcess {
    markerId?: string | null;
    villageId: string;
    unitId: number;
    markerType: string;
    markerInfo: {
    //   id: string | number | null;
      name: string;
      status: string;
      position: {
        x: string;
        y: string;
      };
      size: number;
      rotationDegrees: string;
      group: string;
    };
}

export interface SelectMarker {
    id: string;
    name: string;
    x: number;
    y: number;
    originalX: number;
    originalY: number;
    group: string;
    color: string;
    address?: string;
    tel1?: string;
    tel2?: string;
    tel3?: string;
    unitID?: number;
}
export interface Member {
    id: number;
    name: string;
    role: number;
    phone: string;
    lastCall: string;
    status: "pending" | "success" | "failed";
    failedCount: number;
  } 