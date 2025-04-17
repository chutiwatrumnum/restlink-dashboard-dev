import { createModel } from "@rematch/core";
import { deliveryLogsType, conditionPage } from "../interface/DeliveryLogs";
import { RootModel } from "./index";
import { getdataDeliveryLogslist } from '../../modules/deliveryLogs/service/api/DeliveryLogsServiceAPI'
const filterDataInit:conditionPage={
  perPage: 0,
  curPage: 0
}
export const deliveryLogs = createModel<RootModel>()({
  state: {
    tableData: [],
    loading: false,
    total: 0,
    EventMaxLength: 0,
    tableDataDeliveryLog:[],
    filterData:filterDataInit,
  } as deliveryLogsType,
  reducers: {
    updateloadingDataState: (state, payload) => ({
      ...state,
      loading: payload,
    }),
    updateloadingDataDeliveryLogsState: (state, payload) => ({
      ...state,
      tableDataDeliveryLog: payload,
    }),
    updatetotalDataState: (state, payload) => ({
      ...state,
      total: payload,
    }),
  },
  effects: (dispatch) => ({
    async getTableDataDeliveryLogs(payload: conditionPage) {
      dispatch.deliveryLogs.updateloadingDataState(true);
      const data: any = await getdataDeliveryLogslist(payload);
      if (data?.status) {
        dispatch.deliveryLogs.updateloadingDataDeliveryLogsState(data.datavalue);
        dispatch.deliveryLogs.updatetotalDataState(data.total);
        dispatch.deliveryLogs.updateloadingDataState(false);
      } else {
        dispatch.deliveryLogs.updateloadingDataState(false);
      }
    },
  }),
});