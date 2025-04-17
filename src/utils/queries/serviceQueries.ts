import {
  useQuery,
  QueryFunctionContext,
  UseQueryResult,
} from "@tanstack/react-query";
import axios from "axios";
import {
  ServiceChatDataType,
  ServiceChatListDataType,
} from "../interfaces/serviceInterface";

// Services Chat
const getServiceChatList = async ({
  queryKey,
}: QueryFunctionContext<
  [string, string, string | undefined]
>): Promise<ServiceChatListDataType> => {
  const [_key, sortBy, status] = queryKey;
  let url = `/service-center-chat/dashboard/chat-list`;
  if (sortBy === "time") {
    url += `?sortBy=${sortBy}`;
  } else {
    url += `?sortBy=${sortBy}&sort=ASC`;
  }
  if (status !== "all") {
    url += `&status=${status}`;
  }
  const res = await axios.get(url);

  return res.data.result;
};

const getServiceChatDataByID = async ({
  queryKey,
}: QueryFunctionContext<
  [string, string]
>): Promise<ServiceChatDataType | null> => {
  const [_key, id] = queryKey;
  if (!id) return null;

  const res = await axios.get(
    `/service-center-chat/dashboard/chat-message/${id}`
    // `/service-center-chat/dashboard/chat-message/${id}?curPage=3`
  );

  // console.log("LENGTH => ", res.data.result);
  return res.data.result;
};

const getMoreServiceChatDataByID = async ({
  queryKey,
}: QueryFunctionContext<[string, string, string]>): Promise<
  ServiceChatDataType[]
> => {
  const [_key, curPage, id] = queryKey;
  if (!id) return [];

  const res = await axios.get(
    `/service-center-chat/dashboard/chat-message/${id}?curPage=${curPage}`
  );
  return res.data.result;
};

const getOptionsChatList = async () => {
  const res = await axios.get(
    `/service-center-chat/dashboard/select-service-to-chat`
  );
  return res.data.result;
};

//  Queries Service Chat
export const getServiceChatListQuery = (payload: {
  sortBy: string;
  status: string | undefined;
}): UseQueryResult<ServiceChatListDataType[]> => {
  const { sortBy, status } = payload;
  return useQuery({
    queryKey: ["serviceChatLists", sortBy, status],
    queryFn: getServiceChatList,
  });
};

export const getServiceChatDataByIDQuery = (payload: {
  id: string;
}): UseQueryResult<ServiceChatDataType[] | null> => {
  const { id } = payload;
  return useQuery({
    queryKey: ["serviceChatDataByID", id],
    queryFn: getServiceChatDataByID,
  });
};

export const getMoreServiceChatDataByIDQuery = (payload: {
  curPage: string;
  id: string;
  shouldFetch: boolean;
}): UseQueryResult<ServiceChatDataType[] | null> => {
  const { curPage, id, shouldFetch } = payload;
  return useQuery({
    queryKey: ["moreServiceChatDataByID", curPage, id],
    queryFn: getMoreServiceChatDataByID,
    enabled: shouldFetch,
  });
};

export const getOptionsChatListQuery = () => {
  return useQuery({
    queryKey: ["serviceChatListOptions"],
    queryFn: getOptionsChatList,
  });
};
