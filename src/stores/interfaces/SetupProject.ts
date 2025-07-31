export interface ProjectData {
    status: boolean;
    id: string;
    name: string;
    lat: number;
    long: number;
    developer: {
        id: string;
        name: string;
    };
    projectType: {
        id: number;
        masterCode: string;
        nameCode: string;
        nameEn: string;
    };
    projectImage: string;
    projectManagerName: string;
    contactNo: string;
    location: string;
}

export interface UnitPreviewType {
    No: string;
    Address: string;
    UnitNo: string;
    HomeType: string;
}

export interface UnitPreviewCondoType {
    no: string;
    address: string;
    floor: string;
    unit: string;
    sizeSQM: string;
}


export type BlockType = {
    id: number;
    blockName: string;
    unit: UnitType[];
};

export type FloorType = {
    id: number;
    blockId: number;
    floorName: string;
    numberOfFloor: number;
    isBasement: boolean;
    createdAt: string;
  }


export type DataSetupUnitType = {
    block: BlockType[];
    floor: FloorType[];
};
  



export interface SetupProjectState {
    // Project data state
    projectData: any;
    // Excel data state
    excelData: UploadFileSentApiType;
    // Data setup unit state
    dataSetupUnit: DataSetupUnitType;
    uploadedFileName: string;
    isExcelUploaded: boolean;
    // Image data state
    imageFileObject: File | null;
    uploadedImage: string | null;
    uploadedImageFileName: string;
    isImageUploaded: boolean;
    step: number;
    ////////////////////////// village

}



export type CondoUnit = {
  buildingName: string;
  floor: number;
  floorName: string;
  unitNo: string;
  floorOfUnit: number;
  address: string;
  roomType: string;
  size: number;
};

export type Basement = {
  buildingName: string;
  basementFloor: number;
  basementName: string;
};

export type UploadFileSentApiType = {
  Condo: CondoUnit[];
  Basement: Basement[];
  Home?: any[];
};


export type UnitType = {
  id: number;
  unitNo: string;
  roomAddress: string;
  totalSizePrivateDoc: string;
  unitTypeId: number;
  unitType: {
    name: string;
    sizeInSqm: string;
    numberOfFloor: number;
  };
  floor: {
    id: number;
    floorName: string;
    numberOfFloor: number;
    isBasement: boolean;
  };
};



