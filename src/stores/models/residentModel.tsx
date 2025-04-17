import { createModel } from "@rematch/core";
import {
  residentType,
  conditionPage,
  rejectRequest,
} from "../interfaces/ResidentInformation";
import { RootModel } from "./index";
import { getdataresidentlist } from "../../modules/userManagement/service/api/ResidentServiceAPI";
const filterDataInit: conditionPage = {
  perPage: 0,
  curPage: 0,
  verifyByJuristic: false,
  reject: false,
  isActive: false,
};
export const resident = createModel<RootModel>()({
  state: {
    tableData: [],
    loading: false,
    total: 0,
    residentMaxLength: 0,
    filterData: filterDataInit,
  } as residentType,
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
      residentMaxLength: payload,
    }),
  },
  effects: (dispatch) => ({
    async getTableData(payload: conditionPage) {
      dispatch.resident.updateloadingDataState(true);
      const data: any = await getdataresidentlist(payload);

      if (data?.status) {
        dispatch.resident.updateTableDataState(data.dataValue);
        dispatch.resident.updatetotalgDataState(data.total);
        dispatch.resident.updateloadingDataState(false);
      } else {
        dispatch.resident.updateloadingDataState(false);
      }
    },
  }),
});
