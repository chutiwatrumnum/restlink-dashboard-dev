// ไฟล์: src/stores/models/JuristicModel.tsx

import { createModel } from "@rematch/core";
import { JuristicType, conditionPage } from "../interfaces/JuristicManage";
import { RootModel } from "./index";
import axios from "axios";
import { message } from "antd";
import { encryptStorage } from "../../utils/encryptStorage";
const getdatajuristiclist = async (params: conditionPage) => {
  let url: string = `/team-management/list?`;

  // สร้าง query string จาก params
  const queryParams = new URLSearchParams();
  queryParams.append("perPage", params.perPage.toString());
  queryParams.append("curPage", params.curPage.toString());

  if (params.verifyByJuristic !== undefined) {
    queryParams.append("verifyByJuristic", params.verifyByJuristic.toString());
  }
  if (params.reject !== undefined) {
    queryParams.append("reject", params.reject.toString());
  }
  if (params.isActive !== undefined) {
    queryParams.append("isActive", params.isActive.toString());
  }
  if (params.startDate) {
    queryParams.append("startDate", params.startDate);
  }
  if (params.endDate) {
    queryParams.append("endDate", params.endDate);
  }
  if (params.search) {
    queryParams.append("search", params.search);
  }
  if (params.sort && params.sortBy) {
    queryParams.append("sortBy", params.sortBy);
    queryParams.append("sort", params.sort.slice(0, -3)); // remove 'end' from 'ascend'/'descend'
  }

  url = url + queryParams.toString();

  const token = await encryptStorage.getItem("access_token");
  if (token) {
    try {
      const result = await axios.get(url);

      if (result.status < 400) {
        const AllDataJuristic = result.data.result.rows;

        return {
          total: result.data.result.total,
          status: true,
          dataValue: AllDataJuristic,
        };
      } else {
        message.error(result.data.message);
        console.warn("status code:", result.status);
        console.warn("data error:", result.data);
        return {
          total: 0,
          status: false,
          dataValue: [],
        };
      }
    } catch (err) {
      console.error("err:", err);
      return {
        total: 0,
        status: false,
        dataValue: [],
      };
    }
  } else {
    console.log("====================================");
    console.log("token undefined.....");
    console.log("====================================");
    return {
      total: 0,
      status: false,
      dataValue: [],
    };
  }
};

const filterDataInit: conditionPage = {
  perPage: 0,
  curPage: 0,
  verifyByJuristic: false,
  reject: false,
  isActive: false,
};

export const juristic = createModel<RootModel>()({
  state: {
    tableData: [],
    loading: false,
    total: 0,
    juristicMaxLength: 0,
    filterData: filterDataInit,
    qrCode: "",
  } as JuristicType,
  reducers: {
    updateloadingDataState: (state, payload) => ({
      ...state,
      loading: payload,
    }),
    updateloadinfilterData: (state, payload) => ({
      ...state,
      filterData: payload,
    }),
    updatetotalgDataState: (state, payload) => ({
      ...state,
      total: payload,
    }),
    updateTableDataState: (state, payload) => ({
      ...state,
      tableData: payload,
    }),
    updateAnnouncementMaxLengthState: (state, payload) => ({
      ...state,
      juristicMaxLength: payload,
    }),
    updateQrCodeState: (state, payload) => ({
      ...state,
      qrCode: payload,
    }),
  },
  effects: (dispatch) => ({
    async getTableData(payload: conditionPage) {
      dispatch.juristic.updateloadingDataState(true);
      const data: any = await getdatajuristiclist(payload);

      if (data?.status) {
        dispatch.juristic.updateTableDataState(data.dataValue);
        dispatch.juristic.updatetotalgDataState(data.total);
        dispatch.juristic.updateloadingDataState(false);
      } else {
        dispatch.juristic.updateTableDataState([]);
        dispatch.juristic.updatetotalgDataState(0);
        dispatch.juristic.updateloadingDataState(false);
      }
    },
  }),
});
