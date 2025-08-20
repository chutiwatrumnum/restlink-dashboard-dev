import { createModel } from "@rematch/core";
import { HouseType } from "../interfaces/House";
import { RootModel } from "./index";
import axiosVMS from "../../configs/axiosVMS";
import { message } from "antd";

export const house = createModel<RootModel>()({
  state: {
    tableData: [],
    loading: false,
    total: 0,
    currentPage: 1,
    perPage: 10,
  } as HouseType,
  reducers: {
    updateLoadingState: (state, payload) => ({
      ...state,
      loading: payload,
    }),
    updateTableDataState: (state, payload) => ({
      ...state,
      tableData: payload,
    }),
    updateTotalState: (state, payload) => ({
      ...state,
      total: payload,
    }),
    updateCurrentPageState: (state, payload) => ({
      ...state,
      currentPage: payload,
    }),
    updatePerPageState: (state, payload) => ({
      ...state,
      perPage: payload,
    }),
  },
  effects: (dispatch) => ({
    async getHouseList(payload?: {
      page?: number;
      perPage?: number;
      silent?: boolean;
    }) {
      dispatch.house.updateLoadingState(true);

      try {
        const page = payload?.page || 1;
        const perPage = payload?.perPage || 10;
        const silent = payload?.silent || false; // เพิ่ม silent mode

        console.log("🏠 Fetching house list:", { page, perPage });

        const response = await axiosVMS.get(`/api/collections/house/records`, {
          params: {
            page,
            perPage,
          },
        });

        console.log("✅ Raw House Response:", response.data);

        if (response.data) {
          const data = response.data;
          const items = data.items || [];
          const totalItems = data.totalItems || items.length || 0;

          dispatch.house.updateTableDataState(items);
          dispatch.house.updateTotalState(totalItems);
          dispatch.house.updateCurrentPageState(page);
          dispatch.house.updatePerPageState(perPage);

          console.log("✅ House state updated:", {
            itemsCount: items.length,
            total: totalItems,
            page,
            perPage,
          });

          // แก้ไข: แสดง success message เฉพาะเมื่อไม่อยู่ใน silent mode
          if (!silent) {
            message.success(`Loaded ${items.length} house records!`);
          }
        } else {
          console.warn("⚠️ No house data in response");
          dispatch.house.updateTableDataState([]);
          dispatch.house.updateTotalState(0);

          if (!silent) {
            message.warning("No house data received from VMS");
          }
        }
      } catch (error: any) {
        console.error("❌ Error fetching house list:", error);

        if (error.response) {
          console.error("🏠 House API Error details:", {
            status: error.response.status,
            statusText: error.response.statusText,
            data: error.response.data,
            headers: error.response.headers,
            config: {
              url: error.config?.url,
              method: error.config?.method,
              baseURL: error.config?.baseURL,
              params: error.config?.params,
            },
          });
        }

        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch house list";

        // แก้ไข: แสดง error message เฉพาะเมื่อไม่อยู่ใน silent mode
        if (!payload?.silent) {
          message.error(`House API Error: ${errorMessage}`);
        }

        dispatch.house.updateTableDataState([]);
        dispatch.house.updateTotalState(0);
      } finally {
        dispatch.house.updateLoadingState(false);
      }
    },
  }),
});
