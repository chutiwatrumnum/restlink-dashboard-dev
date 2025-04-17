import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SendServiceChatDataType } from "../interfaces/serviceInterface";
import { useSelector } from "react-redux";
import { RootState } from "../../stores";
import axios from "axios";

export const postServiceMessageByJuristicMutation = () => {
  const { chatListSortBy } = useSelector((state: RootState) => state.chat);
  const { status } = useSelector((state: RootState) => state.serviceCenter);
  const queryClient = useQueryClient();
  return useMutation({
    retry: 2,
    scope: {
      id: "sendServiceChatMessage",
    },
    mutationFn: (payload: SendServiceChatDataType) => {
      return axios.post(`/service-center-chat/dashboard/send-message`, payload);
    },
    onError: (error) => {
      console.warn("Error:", error);
    },
    onSuccess: (data) => {
      // console.log("Success:", data.data.chatList.result);
      queryClient.setQueryData(
        ["serviceChatLists", chatListSortBy, status],
        () => {
          return data.data.chatList.result;
        }
      );
    },
  });
};
