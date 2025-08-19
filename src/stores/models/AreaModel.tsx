// ไฟล์: src/stores/models/AreaModel.tsx

import { createModel } from "@rematch/core";
import { AreaType } from "../interfaces/Area";
import { RootModel } from "./index";
import axiosVMS from "../../configs/axiosVMS";
import { message } from "antd";
import { areaMappingService } from "../../utils/services/areaMappingService";

export const area = createModel<RootModel>()({
  state: {
    tableData: [],
    loading: false,
    total: 0,
    currentPage: 1,
    perPage: 10,
  } as AreaType,
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
    async getAreaList(payload?: { page?: number; perPage?: number }) {
      dispatch.area.updateLoadingState(true);

      try {
        const page = payload?.page || 1;
        const perPage = payload?.perPage || 10;

        console.log("📍 Fetching area list:", { page, perPage });

        const response = await axiosVMS.get(`/api/collections/area/records`, {
          params: {
            page,
            perPage,
          },
        });

        console.log("✅ Raw Area Response:", response.data);

        if (response.data) {
          const data = response.data;
          const items = data.items || [];
          const totalItems = data.totalItems || items.length || 0;

          dispatch.area.updateTableDataState(items);
          dispatch.area.updateTotalState(totalItems);
          dispatch.area.updateCurrentPageState(page);
          dispatch.area.updatePerPageState(perPage);

          console.log("✅ Area state updated:", {
            itemsCount: items.length,
            total: totalItems,
            page,
            perPage,
          });

          message.success(`Loaded ${items.length} area records!`);
        } else {
          console.warn("⚠️ No area data in response");
          dispatch.area.updateTableDataState([]);
          dispatch.area.updateTotalState(0);
          message.warning("No area data received from VMS");
        }
      } catch (error: any) {
        console.error("❌ Error fetching area list:", error);

        if (error.response) {
          console.error("📍 Area API Error details:", {
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
          "Failed to fetch area list";

        message.error(`Area API Error: ${errorMessage}`);

        dispatch.area.updateTableDataState([]);
        dispatch.area.updateTotalState(0);
      } finally {
        dispatch.area.updateLoadingState(false);
      }
    },

    async refreshAreaMapping() {
      try {
        console.log("🔄 Manually refreshing area mapping...");
        await areaMappingService.refreshAreaCache();
        message.success("Area mapping refreshed successfully!");
      } catch (error) {
        console.error("❌ Failed to refresh area mapping:", error);
        message.error("Failed to refresh area mapping");
      }
    },

    async initializeAreaMapping() {
      try {
        console.log("🚀 Initializing area mapping...");
        await areaMappingService.refreshAreaCache();
        console.log("✅ Area mapping initialized");
      } catch (error) {
        console.error("❌ Failed to initialize area mapping:", error);
      }
    },
  }),
});
