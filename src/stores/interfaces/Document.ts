export interface DocumentFormType {
  isLoading: boolean;
  tableData: DocumentDataType[];
  currentFoldersMaxLength: number;
  foldersLength: number;
  refresh: boolean;
}
export type updateStatus = "active" | "exception" | "success";
// export type fileSizeType=`${number} MB`
export interface DocumentDataType {
  id: number | string;
  fullName: string;
  // Folder Type
  name?: string;
  folderOwnerId?: number;
  createdAt?: string;
  // File type
  documentHomeFolderId?: number;
  fileName?: string;
  filePath?: string;
  fileSize?: number;
  fileSizeDescription?: string;
  fileType?: "pdf";
  projectId?: string;
}
export interface GetPublicDataPayloadType {
  curPage: number;
  perPage: number;
  folderId: number;
  search?: string;
  sort?: string;
  sortBy?: string;
  unitId?: number;
}
export interface dataFiles {
  fileName: string;
  fileType: "pdf";
  fileSize: string;
  folderId: number;
  base64: string;
  allowAll: "y" | "n";
  unitId: number[];
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

export interface CreateFolderType {
  allowAll: "y" | "n";
  folderName: string;
  unitId?: number[];
  folderOwnerId?: number;
}

export type ModalModeType = "create" | "edit";

export interface FileDataType {
  id: string;
  fileName: string;
  filePath: string;
  fileType: string;
  fileSize: number;
  fileSizeDescription: string;
  documentHomeFolderId: number;
  projectId: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  allowUnitAll: boolean;
  byUnit: ByUnit[];
}

export interface ByUnit {
  unitId: number;
  unitInfo: UnitInfo;
}

export interface UnitInfo {
  unitNo: string;
  roomAddress: string;
}

export interface EditFileType {
  fileID: string;
  allowAll: "y" | "n";
  fileName: string;
  unitId: number[];
}

export interface EditFolderType {
  folderId: number;
  allowAll: "y" | "n";
  folderName: string;
  unitId: number[];
}

export interface FolderDataType {
  id: number;
  name: string;
  projectId: string;
  folderOwnerId: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  allowUnitAll: boolean;
  byUnit: ByUnitFolder[];
}

export interface ByUnitFolder extends ByUnit {}
