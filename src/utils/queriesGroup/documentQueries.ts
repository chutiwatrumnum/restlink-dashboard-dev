import { useQuery, QueryFunctionContext } from "@tanstack/react-query";
import axios from "axios";
import { FileDataType, FolderDataType } from "../../stores/interfaces/Document";

// Functions section
const getUnitList = async () => {
  let url = `/document-home/dashboard/unit-list`;
  const res = await axios.get(url);
  // console.log("RES : ", res);

  return res.data.result;
};

const getFileInfo = async ({
  queryKey,
}: QueryFunctionContext<[string, string]>): Promise<FileDataType> => {
  const [_key, id] = queryKey;
  let url = `/document-home/dashboard/file-info?fileID=${id}`;
  const res = await axios.get(url);
  // console.log("RES : ", res);

  return res.data.result;
};

const getFolderInfo = async ({
  queryKey,
}: QueryFunctionContext<[string, string]>): Promise<FolderDataType> => {
  const [_key, id] = queryKey;
  let url = `/document-home/dashboard/folder-info?folderId=${id}`;
  const res = await axios.get(url);
  // console.log("RES : ", res);

  return res.data.result;
};

// Queries section
export const getUnitListQuery = () => {
  return useQuery({
    queryKey: ["unitList"],
    queryFn: getUnitList,
  });
};

export const getFileInfoQuery = (payload: {
  id: string;
  shouldFetch: boolean;
}) => {
  const { id, shouldFetch } = payload;
  return useQuery({
    queryKey: ["fileInfo", id],
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
    queryKey: ["folderInfo", id],
    queryFn: getFolderInfo,
    enabled: shouldFetch,
  });
};
