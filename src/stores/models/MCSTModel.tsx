import { createModel } from "@rematch/core";
import { MSCTType, conditionPage } from "../interfaces/Management";
import { RootModel } from "./index";
import { getDataManagement } from "../../modules/management/service/api/ManagementServiceAPI";
export const MCST = createModel<RootModel>()({
  state: {
    tableData: [],
    loading: false,
    total: 0,
    residentMaxLength: 0,
  } as MSCTType,
  reducers: {
    updateloadingDataState: (state, payload) => ({
      ...state,
      loading: payload,
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
      dispatch.MCST.updateloadingDataState(true);
      const data: any = await getDataManagement(payload);
      if (data?.status) {
        dispatch.MCST.updateTableDataState(data.data);
        dispatch.MCST.updatetotalgDataState(data.total);
        dispatch.MCST.updateloadingDataState(false);
      } else {
        dispatch.MCST.updateloadingDataState(false);
      }
    },
  }),
});
