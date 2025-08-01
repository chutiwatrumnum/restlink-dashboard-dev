import { createModel } from "@rematch/core";
import { eventLogType, conditionPage } from "../interfaces/EventLog";
import { RootModel } from "./index";
import {
  getDataEventJoinLogList,
  getDataEventLogList,
} from "../../modules/eventLogs/service/api/EventLogsServiceAPI";
const filterDataInit: conditionPage = {
  perPage: 0,
  curPage: 0,
};
export const eventLog = createModel<RootModel>()({
  state: {
    tableData: [],
    loading: false,
    total: 0,
    EventMaxLength: 0,
    tableDataEventLog: [],
    filterData: filterDataInit,
  } as eventLogType,
  reducers: {
    updateloadingDataState: (state, payload) => ({
      ...state,
      loading: payload,
    }),
    updateloadingDataEvenLogsState: (state, payload) => ({
      ...state,
      tableDataEventLog: payload,
    }),
    updatetotalgDataState: (state, payload) => ({
      ...state,
      total: payload,
    }),
    updateTableDataState: (state, payload) => ({
      ...state,
      tableData: payload,
    }),
    updateChildDataVisitorState: (state, payload) => ({
      ...state,
      childrenVisitor: payload,
    }),
  },
  effects: (dispatch) => ({
    async getTableData(payload: conditionPage) {
      dispatch.eventLog.updateloadingDataState(true);
      const data: any = await getDataEventJoinLogList(payload);
      if (data?.status) {
        dispatch.eventLog.updateChildDataVisitorState(data.childdata);
        dispatch.eventLog.updateTableDataState(data.datavalue);
        dispatch.eventLog.updatetotalgDataState(data.total);
        dispatch.eventLog.updateloadingDataState(false);
      } else {
        dispatch.eventLog.updateloadingDataState(false);
      }
    },
    async getTableDataEventLogs(payload: conditionPage) {
      dispatch.eventLog.updateloadingDataState(true);
      const data: any = await getDataEventLogList(payload);
      if (data?.status) {
        dispatch.eventLog.updateChildDataVisitorState(data.childdata);
        dispatch.eventLog.updateloadingDataEvenLogsState(data.datavalue);
        dispatch.eventLog.updatetotalgDataState(data.total);
        dispatch.eventLog.updateloadingDataState(false);
      } else {
        dispatch.eventLog.updateloadingDataState(false);
      }
    },
  }),
});
