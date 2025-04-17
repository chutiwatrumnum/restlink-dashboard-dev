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
    async getRoleAccessToken() {
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
