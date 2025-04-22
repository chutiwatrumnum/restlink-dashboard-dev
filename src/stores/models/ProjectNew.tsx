import { createModel } from "@rematch/core";
import {
  ProjectNewType,
  ProjectNewPayloadType,
  AddNewProjectNewType,
} from "../interfaces/ProjectNew";
import { RootModel } from "./index";
import axios from "axios";
import { message } from "antd";
import SuccessModal from "../../components/common/SuccessModal";
import FailedModal from "../../components/common/FailedModal";

export const projectNew = createModel<RootModel>()({
  state: {
    tableData: [],
    announcementMaxLength: 0,
  } as ProjectNewType,
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
    async getTableData(payload: ProjectNewPayloadType) {
      const item = payload;
      const searchWord = item.search ? `&search=${item.search}` : "";
      let timeRange = "";

      if (item.startDate && item.endDate) {
        timeRange = `&startDate=${item.startDate}&endDate=${item.endDate}`;
      }
      try {
        const result = await axios.get(
          `/project-news/list/dashboard?curPage=${item.curPage}&perPage=${item.perPage}${searchWord}${timeRange}&sort=asc&sortBy=createdAt`
        );

        if (result.data.statusCode >= 400) {
          console.error(result.data.message);
          return;
        }
        console.log(result.data.result);

        dispatch.projectNew.updateTableDataState(result.data.result.rows);
        dispatch.projectNew.updateAnnouncementMaxLengthState(
          result.data.result.total
        );
      } catch (error) {
        console.error("ERROR", error);
      }
    },
    async deleteTableData(payload: number) {
      try {
        const result = await axios.delete(`/project-news/${payload}`);
        if (result.status >= 400) console.log(result);
        SuccessModal("Successfully deleted");
      } catch (error) {
        console.error("ERROR", error);
      }
    },
    async addNewAnnounce(payload: AddNewProjectNewType) {
      try {
        const newData = {
          title: payload.title,
          description: payload.description,
          url: payload.url,
          imageUrl: payload.imageUrl,
          startDate: payload.startDate,
          endDate: payload.endDate,
        };

        const result = await axios.post("/project-news", newData);
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
    async editAnnounce(payload: AddNewProjectNewType) {
      // console.log(payload);

      const base64 = payload?.imageUrl;

      try {
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

          const result = await axios.put("/project-news", newData);
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
          const result = await axios.put("/project-news", newData);
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
