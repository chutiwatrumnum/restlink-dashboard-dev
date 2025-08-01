import { createModel } from "@rematch/core";
import {
  AnnounceType,
  AnnouncePayloadType,
  AddNewAnnouncementType,
} from "../interfaces/Announcement";
import { RootModel } from "./index";
import axios from "axios";
import { message } from "antd";
import {
  callSuccessModal,
  callFailedModal,
} from "../../components/common/Modal";
import SuccessModal from "../../components/common/SuccessModal";
import FailedModal from "../../components/common/FailedModal";

export const announcement = createModel<RootModel>()({
  state: {
    tableData: [],
    announcementMaxLength: 0,
  } as AnnounceType,
  reducers: {
    updateTableDataState: (state, payload) => ({
      ...state,
      tableData: payload,
    }),
    updateAnnouncementMaxLengthState: (state, payload) => ({
      ...state,
      announcementMaxLength: payload,
    }),
  },
  effects: (dispatch) => ({
    async getTableData(payload: AnnouncePayloadType) {
      const item = payload;
      const searchWord = item.search ? `&search=${item.search}` : "";
      let timeRange = "";

      if (item.startDate && item.endDate) {
        timeRange = `&startDate=${item.startDate}&endDate=${item.endDate}`;
      }

      try {
        let url = `/announcement/list/dashboard?curPage=${item.curPage}&perPage=${item.perPage}${searchWord}${timeRange}&sort=asc&sortBy=createdAt`;
        if (payload.fetchType === "projectNews") {
          url = `/project-news/list/dashboard?curPage=${item.curPage}&perPage=${item.perPage}${searchWord}${timeRange}&sort=asc&sortBy=createdAt`;
        } else if (payload.fetchType === "devNews") {
          url = `/news/list/dashboard?curPage=${item.curPage}&perPage=${item.perPage}${searchWord}${timeRange}&sort=asc&sortBy=createdAt`;
        }
        const result = await axios.get(url);

        if (result.data.statusCode >= 400) {
          console.error(result.data.message);
          return;
        }
        // console.log(result.data.result);

        dispatch.announcement.updateTableDataState(result.data.result.rows);
        dispatch.announcement.updateAnnouncementMaxLengthState(
          result.data.result.total
        );
      } catch (error) {
        console.error("ERROR", error);
      }
    },
    async deleteTableData(payload: {
      id: number;
      type: "projectNews" | "announcement" | "devNews";
    }) {
      try {
        let url = `/announcement/${payload.id}`;
        if (payload.type === "projectNews") {
          url = `/project-news/${payload.id}`;
        } else if (payload.type === "devNews") {
          url = `/news/${payload.id}`;
        }
        const result = await axios.delete(url);
        if (result.status >= 400) console.log(result);
        callSuccessModal("Successfully deleted");
      } catch (error) {
        console.error("ERROR", error);
      }
    },

    async addNewAnnounce(payload: AddNewAnnouncementType) {
      try {
        let url = `/announcement`;
        if (payload.type === "projectNews") {
          url = `/project-news`;
        } else if (payload.type === "devNews") {
          url = `/news`;
        }
        const newData = {
          title: payload.title,
          description: payload.description,
          url: payload.url,
          imageUrl: payload.imageUrl,
          startDate: payload.startDate,
          endDate: payload.endDate,
        };
        // console.log(payload.type);

        const result = await axios.post(url, newData);
        if (result.status >= 400) {
          console.error(result.data.message);
          FailedModal(result.data.message);
          return false;
        }
        SuccessModal("Successfully upload");
        return true;
      } catch (error) {
        console.error(error);
      }
    },

    async editAnnounce(payload: AddNewAnnouncementType) {
      // console.log(payload);
      const base64 = payload?.imageUrl;

      try {
        let url = `/announcement`;
        if (payload.type === "projectNews") {
          url = `/project-news`;
        } else if (payload.type === "devNews") {
          url = `/news`;
        }
        if (!base64) {
          console.log("image not change");
          const newData = {
            id: payload.id,
            title: payload.title,
            description: payload.description,
            url: payload.url,
            startDate: payload.startDate,
            endDate: payload.endDate,
          };

          const result = await axios.put(url, newData);
          if (result.status >= 400) {
            console.error(result.data.message);
            message.error(result.data.message);
            throw false;
          }
          return true;
        } else {
          const newData = {
            id: payload.id,
            title: payload.title,
            description: payload.description,
            url: payload.link,
            imageUrl: payload.imageUrl,
            startDate: payload.startDate,
            endDate: payload.endDate,
          };
          const result = await axios.put(url, newData);
          if (result.status >= 400) {
            console.error(result.data.message);
            message.error(result.data.message);
            throw false;
          }
          return true;
        }
      } catch (error) {
        console.error(error);
      }
    },
  }),
});
