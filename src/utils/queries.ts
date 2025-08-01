import {
  useQuery,
  QueryFunctionContext,
  UseQueryResult,
} from "@tanstack/react-query";
import axios from "axios";
import {
  ChatDataParams,
  ChatListDataType,
  ChatDataType,
} from "../stores/interfaces/Chat";

// API
// Chat
const getChatList = async ({
  queryKey,
}: QueryFunctionContext<
  [string, ChatDataParams]
>): Promise<ChatListDataType> => {
  const [_key, { sortBy }] = queryKey;
  let url = `/chat/dashboard/chat-list`;
  if (sortBy === "time") {
    url += `?sortBy=${sortBy}`;
  } else {
    url += `?sortBy=${sortBy}&sort=ASC`;
  }
  const res = await axios.get(url);
  console.log("CHAT LIST : ", res.data.result);

  return res.data.result;
};

const getChatDataByID = async ({
  queryKey,
}: QueryFunctionContext<
  [string, string, number]
>): Promise<ChatDataType | null> => {
  const [_key, id, unitId] = queryKey;
  if (!id) return null;
  const res = await axios.get(
    `/chat/dashboard/chat-message/${id}?unitId=${unitId}`
  );
  return res.data.result;
};

const getMoreChatDataByID = async ({
  queryKey,
}: QueryFunctionContext<[string, string, string, number]>): Promise<
  ChatDataType[]
> => {
  const [_key, curPage, id, unitId] = queryKey;
  if (!id) return [];
  const res = await axios.get(
    `/chat/dashboard/chat-message/${id}?curPage=${curPage}?unitId=${unitId}`
  );
  return res.data.result;
};

const getUnit = async () => {
  const res = await axios.get(`/chat/dashboard/unit`);
  return res.data.data;
};

const getNameByUnitID = async ({
  queryKey,
}: QueryFunctionContext<[string, string]>) => {
  const [_key, id] = queryKey;
  if (!id) return null;
  const res = await axios.get(`/chat/dashboard/user-by-unit?unitId=${id}`);
  // console.log(res.data.data);

  return res.data.data;
};

// Queries Chat
export const getChatListQuery = (
  payload: ChatDataParams
): UseQueryResult<ChatListDataType[]> => {
  return useQuery({
    queryKey: ["chatLists", payload],
    queryFn: getChatList,
  });
};

export const getChatDataByIDQuery = (payload: {
  id: string;
  unitId: number;
}): UseQueryResult<ChatDataType[] | null> => {
  const { id, unitId } = payload;
  return useQuery({
    queryKey: ["chatDataByID", id, unitId],
    queryFn: getChatDataByID,
  });
};

export const getMoreChatDataByIDQuery = (payload: {
  curPage: string;
  id: string;
  unitId: number;
  shouldFetch: boolean;
}): UseQueryResult<ChatDataType[] | null> => {
  const { curPage, id, unitId, shouldFetch } = payload;
  return useQuery({
    queryKey: ["moreChatDataByID", curPage, id, unitId],
    queryFn: getMoreChatDataByID,
    enabled: shouldFetch,
  });
};

export const getUnitQuery = () => {
  return useQuery({
    queryKey: ["unitsList"],
    queryFn: getUnit,
  });
};

export const getNameByUnitIDQuery = (payload: {
  id: string;
  shouldFetch: boolean;
}) => {
  const { id, shouldFetch } = payload;
  return useQuery({
    queryKey: ["nameByID", id],
    queryFn: getNameByUnitID,
    enabled: shouldFetch,
  });
};
