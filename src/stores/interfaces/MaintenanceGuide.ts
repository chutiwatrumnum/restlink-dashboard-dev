export interface MaintenanceGuideFormType {
  isLoading: boolean;
  tableData: MaintenanceGuideDataType[];
  maintenanceGuideFolders: MaintenanceGuideDataType[];
  maintenanceGuideFiles: MaintenanceGuideDataType[];
  currentFoldersMaxLength: number;
  refresh: boolean;
}

export type updateStatus = "active" | "exception" | "success";

export interface MaintenanceGuideDataType {
  idFile?: string;
  folderName: string;
  fileName: string;
  active: boolean;
  folderId: number;
  pathFile: string;
  isMaintenanceGuide: boolean;
  fileType: string;
  fileSize: string;
  createdAt: string;
  updatedAt: string | null;
  createdBy: string;
  updatedBy: string | null;
  fullName: string;
}
export interface GetMaintenanceGuideDataPayloadType {
  curPage?: number;
  perPage?: number;
  search?: string;
  sort?: string;
  sortBy?: string;
  folderId?: number;
  unitId?: number;
}
export interface dataFiles {
  fileName: string;
  fileType: "pdf";
  fileSize: string;
  folderId: number;
  base64: string;
}
export interface dataFilesPersonal {
  fileName: string;
  fileType: "pdf";
  fileSize: string;
  folderId: number;
  unitId: number[];
  unitAll: boolean;
  base64: string;
}
