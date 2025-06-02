export interface DocumentFormType {
  isLoading: boolean;
  tableData: DocumentDataType[];
  publicFolders: DocumentDataType[];
  publicFiles: DocumentDataType[];
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
