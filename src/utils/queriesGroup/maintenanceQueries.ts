import { useQuery, QueryFunctionContext } from "@tanstack/react-query";
import axios from "axios";
import {
  FileDataType,
  FolderDataType,
} from "../../stores/interfaces/MaintenanceGuide";

// Functions section
const getUnitList = async (folderId?: number) => {
  let url = `/document-project/dashboard/unit-list`;
  const res = await axios.get(url, {
    params: folderId ? { folderId } : {}, // ส่งเฉพาะตอนมีค่า
  });

  return res.data.result;
};

const getFileInfo = async ({
  queryKey,
}: QueryFunctionContext<[string, string]>): Promise<FileDataType> => {
  const [_key, id] = queryKey;
  let url = `/document-project/dashboard/file-info?fileID=${id}`;
  const res = await axios.get(url);
  // console.log("RES : ", res);

  return res.data.result;
};

const getFolderInfo = async ({
  queryKey,
}: QueryFunctionContext<[string, string]>): Promise<FolderDataType> => {
  const [_key, id] = queryKey;
  let url = `/document-project/dashboard/folder-info?folderId=${id}`;
  const res = await axios.get(url);
  // console.log("RES : ", res);

  return res.data.result;
};

// Queries section
export const getUnitListQuery = (folderId?: number) => {
  return useQuery({
    queryKey: ["unitList", folderId],
    queryFn: () => getUnitList(folderId),
  });
};

export const getFileInfoQuery = (payload: {
  id: string;
  shouldFetch: boolean;
}) => {
  const { id, shouldFetch } = payload;
  return useQuery({
    queryKey: ["fileProjectInfo", id],
    queryFn: getFileInfo,
    enabled: shouldFetch,
  });
};

export const getFolderInfoQuery = (payload: {
  id: string;
  shouldFetch: boolean;
}) => {
  const { id, shouldFetch } = payload;
  return useQuery({
    queryKey: ["folderProjectInfo", id],
    queryFn: getFolderInfo,
    enabled: shouldFetch,
  });
};
