import { createModel } from "@rematch/core";
import { JuristicType, conditionPage } from "../interfaces/JuristicManage";
import { RootModel } from "./index";
import { getdatajuristiclist } from "../../modules/juristicManagement/service/api/JuristicServiceAPI";
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
        dispatch.juristic.updateloadingDataState(false);
      }
    },
  }),
});
