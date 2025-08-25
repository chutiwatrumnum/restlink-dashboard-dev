import { createModel } from "@rematch/core";
import { CommonType } from "../interfaces/Common";
import { RootModel } from "./index";
import axios from "axios";

export const common = createModel<RootModel>()({
  state: {
    masterData: undefined,
    permission: [],
    unitOptions: [],
    unitFilter: undefined,
  } as CommonType,
  reducers: {
    updateMasterData: (state, payload) => ({
      ...state,
      masterData: payload,
    }),
    updatePermission: (state, payload) => ({
      ...state,
      permission: payload,
    }),
    updateUnitOptions: (state, payload) => ({
      ...state,
      unitOptions: payload,
    }),
  },
  effects: (dispatch) => ({
    async getMasterData() {
      try {
        const data = await axios.get("/master");
        if (data.status >= 400) {
          console.error(data.data.message);
          return;
        }
        dispatch.common.updateMasterData(data.data.result);
      } catch (error) {
        console.error(error);
      }
    },
    async fetchUnitOptions() {
      try {
        const response = await axios.get<{
          data: { roomAddress: string; id: number }[];
        }>("/events/dashboard/unit");

        const formattedUnitOptions = (response?.data?.data || []).map(
          ({ roomAddress, id }) => ({
            label: roomAddress,
            value: id,
          })
        );

        dispatch.common.updateUnitOptions(formattedUnitOptions);
      } catch (error) {
        console.error("Failed to fetch room address options:", error);
      }
    },
  }),
});
