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
} from "./queriesInterface";

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
  return res.data.result;
};

const getChatDataByID = async ({
  queryKey,
}: QueryFunctionContext<[string, string]>): Promise<ChatDataType | null> => {
  const [_key, id] = queryKey;
  if (!id) return null;
  const res = await axios.get(`/chat/dashboard/chat-message/${id}`);
  return res.data.result;
};

const getMoreChatDataByID = async ({
  queryKey,
}: QueryFunctionContext<[string, string, string]>): Promise<ChatDataType[]> => {
  const [_key, curPage, id] = queryKey;
  if (!id) return [];
  const res = await axios.get(
    `/chat/dashboard/chat-message/${id}?curPage=${curPage}`
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
}): UseQueryResult<ChatDataType[] | null> => {
  const { id } = payload;
  return useQuery({
    queryKey: ["chatDataByID", id],
    queryFn: getChatDataByID,
  });
};

export const getMoreChatDataByIDQuery = (payload: {
  curPage: string;
  id: string;
  shouldFetch: boolean;
}): UseQueryResult<ChatDataType[] | null> => {
  const { curPage, id, shouldFetch } = payload;
  return useQuery({
    queryKey: ["moreChatDataByID", curPage, id],
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
