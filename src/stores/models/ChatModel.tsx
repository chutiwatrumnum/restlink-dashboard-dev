import { createModel } from "@rematch/core";
import { ChatModelDataType, SendChatDataType } from "../interfaces/Chat";
import { RootModel } from "./index";
import axios from "axios";

export const chat = createModel<RootModel>()({
  state: {
    chatListSortBy: "time",
    curPageChatData: 2,
  } as ChatModelDataType,
  reducers: {
    updateSortByData: (state, payload) => ({
      ...state,
      chatListSortBy: payload,
    }),
    updateCurPageChatData: (state, payload) => ({
      ...state,
      curPageChatData: payload,
    }),
  },
  effects: (dispatch) => ({
    // async getChatData() {
    //   await axios
    //     .get("/chat/dashboard/chat-list")
    //     .then((res) => {
    //       // console.log("SUCCESS => ", res.data.result);
    //       dispatch.chat.updateChatListData(res.data.result);
    //     })
    //     .catch((err) => {
    //       console.error(err);
    //     });
    // },
    // async postMessageByJuristic(payload: SendChatDataType) {
    //   const res = await axios.post(`/chat/dashboard/send-message`, payload);
    //   if (res.status >= 400) {
    //     console.error(res.data.message);
    //     return;
    //   }
    // },
  }),
});
