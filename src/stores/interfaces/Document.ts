export interface DocumentFormType {
  isLoading: boolean;
  tableData: DocumentDataType[];
  publicFolders: DocumentDataType[];
  publicFiles: DocumentDataType[];
  currentFoldersMaxLength: number;
  refresh: boolean;
}
export type updateStatus = "active" | "exception" | "success";
// export type fileSizeType=`${number} MB`
export interface DocumentDataType {
  idFile?: string;
  folderName: string;
  fileName: string;
  active: boolean;
  folderId: number;
  pathFile: string;
  isPublic: boolean;
  fileType: string;
  fileSize: string;
  createdAt: string;
  updatedAt: string | null;
  createdBy: string;
  updatedBy: string | null;
  fullName: string;
}
export interface GetPublicDataPayloadType {
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
