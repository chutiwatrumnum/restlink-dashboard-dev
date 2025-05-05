import { createModel } from "@rematch/core";
import { visitorType, conditionPage } from "../interfaces/Visitor";
import { RootModel } from "./index";
import {
  getdataVisitorLoglist,
  getdataVisitorlist,
} from "../../modules/vistorManagement/service/api/VisitorServiceAPI";
const filterDataInit: conditionPage = {
  perPage: 0,
  curPage: 0,
  keyTab: "1",
};
export const visitor = createModel<RootModel>()({
  state: {
    tableData: [],
    loading: false,
    total: 0,
    residentMaxLength: 0,
    filterData: filterDataInit,
    childrenVisitor: {},
  } as visitorType,
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
    updateChildDataVisitorState: (state, payload) => ({
      ...state,
      childrenVisitor: payload,
    }),
  },
  effects: (dispatch) => ({
    async getTableData(payload: conditionPage) {
      dispatch.resident.updateloadingDataState(true);
      const data: any = await getdataVisitorLoglist(payload);
      if (data?.status) {
        dispatch.visitor.updateChildDataVisitorState(data.childdata);
        dispatch.visitor.updateTableDataState(data.datavlaue);
        dispatch.visitor.updatetotalgDataState(data.total);
        dispatch.visitor.updateloadingDataState(false);
      } else {
        dispatch.visitor.updateloadingDataState(false);
      }
    },
  }),
});
