import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SendChatDataType } from "./queriesInterface";
import { useSelector } from "react-redux";
import { RootState } from "../stores";
import axios from "axios";

export const postMessageByJuristicMutation = () => {
  const { chatListSortBy } = useSelector((state: RootState) => state.chat);
  const queryClient = useQueryClient();
  return useMutation({
    retry: 2,
    scope: {
      id: "sendChatMessage",
    },
    mutationFn: (payload: SendChatDataType) => {
      return axios.post(`/chat/dashboard/send-message`, payload);
    },
    onError: (error) => {
      console.warn("Error:", error);
    },
    onSuccess: (data) => {
      // console.log("Success:", data.data.chatList.result);
      queryClient.setQueryData(
        ["chatLists", { sortBy: chatListSortBy }],
        () => {
          return data.data.chatList.result;
        }
      );
    },
  });
};
