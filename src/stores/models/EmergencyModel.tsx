import { createModel } from "@rematch/core";
import {
  DataEmergencyCreateByType,
  EmergencyPayloadType,
  EmergencyTableDataType,
} from "../interfaces/Emergency";
import { RootModel } from "./index";
import axios from "axios";
import { message } from "antd";
import SuccessModal from "../../components/common/SuccessModal";
import FailedModal from "../../components/common/FailedModal";

export const emergency = createModel<RootModel>()({
  state: {
    tableData: [],
    EmergencyMaxLength: 0,
  } as EmergencyTableDataType,
  reducers: {
    updateTableDataState: (state, payload) => ({
      ...state,
      tableData: payload,
    }),
    updateEmergencyMaxLengthState: (state, payload) => ({
      ...state,
      EmergencyMaxLength: payload,
    }),
  },
  effects: (dispatch) => ({
    async getTableData(payload: EmergencyPayloadType) {
      try {
        const params: any = {
          curPage: payload.curPage,
          perPage: payload.perPage,
        };
        if (payload.search) {
          params.search = payload.search;
        }
        const result = await axios.get("/contact-list/dashboard/list", {
          params,
        });
        console.log("list:", result.data.data);

        dispatch.emergency.updateTableDataState(result.data.data.rows);
        dispatch.emergency.updateEmergencyMaxLengthState(
          result.data.data.total
        );
      } catch (error: any) {
        console.error(error);
        if (error?.response?.data?.message) {
          FailedModal(error.response.data.message);
          return false;
        }
      }
    },
    async deleteTableData(payload: number) {
      try {
        const result = await axios.delete(`/contact-list/${payload}`);
        if (result.status >= 400) console.log(result);
        SuccessModal("Successfully Deleted");
      } catch (error: any) {
        console.error(error);
        if (error?.response?.data?.message) {
          FailedModal(error.response.data.message);
          return false;
        }
      }
    },
    async addNewEmergencyService(payload: DataEmergencyCreateByType) {
      try {
        const result = await axios.post("/contact-list", payload);
        console.log("result", result);

        if (result.status >= 400) {
          console.error(result.data.message);
          FailedModal(result.data.message);
          return false;
        }
        SuccessModal("Successfully Upload");
        return true;
      } catch (error: any) {
        console.error(error);
        if (error?.response?.data?.message) {
          FailedModal(error.response.data.message);
          return false;
        }
      }
    },
    async editEmergencyService(payload: any) {
      try {
        const result = await axios.put("/contact-list", payload);
        if (result.status >= 400) {
          console.error(result.data.message);
          message.error(result.data.message);
          throw false;
        }
        return true;
      } catch (error: any) {
        console.error(error);
        if (error?.response?.data?.message) {
          FailedModal(error.response.data.message);
          return false;
        }
      }
    },
  }),
});
