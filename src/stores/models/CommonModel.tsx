import { createModel } from "@rematch/core";
import { CommonType, MenuItemAccessibilityType } from "../interfaces/Common";
import { RootModel } from "./index";
import axios from "axios";

export const common = createModel<RootModel>()({
  state: {
    masterData: undefined,
    accessibility: undefined,
    unitOptions: [],
    unitFilter: undefined,
  } as CommonType,
  reducers: {
    updateMasterData: (state, payload) => ({
      ...state,
      masterData: payload,
    }),
    updateAccessibility: (state, payload) => ({
      ...state,
      accessibility: payload,
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
        const response = await axios.get<{ data: { unitNo: string; id: number }[] }>("/events/dashboard/unit");

        const formattedUnitOptions = response.data.data.map(({ unitNo, id }) => ({
          label: unitNo,
          value: id,
        }));

        dispatch.common.updateUnitOptions(formattedUnitOptions);
      } catch (error) {
        console.error("Failed to fetch unit options:", error);
      }
    },
    async getRoleaccess_token() {
      try {
        const data = await axios.get("/permission/menu-access");
        if (data.status >= 400) {
          console.error(data.data.message);
          return;
        }
        // console.log("permission:,",data.data.result);

        const result: { [key: string]: MenuItemAccessibilityType } =
          data.data.result.reduce(
            (
              acc: { [key: string]: MenuItemAccessibilityType },
              curr: MenuItemAccessibilityType
            ) => {
              acc[curr.permissionCode] = curr;
              return acc;
            },
            {}
          );
        await dispatch.common.updateAccessibility(result);
      } catch (error) {
        console.error(error);
      }
    },
  }),
});
