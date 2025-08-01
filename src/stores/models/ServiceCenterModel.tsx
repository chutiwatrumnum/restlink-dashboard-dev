import { createModel } from "@rematch/core";
import { ServiceCenterModelDataType } from "../interfaces/ServiceCenter";
import { RootModel } from "./index";
// import axios from "axios";

export const serviceCenter = createModel<RootModel>()({
  state: {
    status: "all",
  } as ServiceCenterModelDataType,
  reducers: {
    updateStatusData: (state, payload) => ({
      ...state,
      status: payload,
    }),
  },
  //   effects: (dispatch) => ({}),
});
