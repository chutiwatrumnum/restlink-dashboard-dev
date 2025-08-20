import { createModel } from "@rematch/core";
import { VehicleType } from "../interfaces/Vehicle";
import { RootModel } from "./index";
import axiosVMS from "../../configs/axiosVMS";
import { message } from "antd";
import { vehicleMappingService } from "../../utils/services/vehicleMappingService";

export const vehicle = createModel<RootModel>()({
  state: {
    tableData: [],
    loading: false,
    total: 0,
    currentPage: 1,
    perPage: 10,
  } as VehicleType,
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
    async getVehicleList(payload?: {
      page?: number;
      perPage?: number;
      silent?: boolean;
    }) {
      dispatch.vehicle.updateLoadingState(true);

      try {
        const page = payload?.page || 1;
        const perPage = payload?.perPage || 10;
        const silent = payload?.silent || false; // เพิ่ม silent mode

        console.log("🚗 Fetching vehicle list:", { page, perPage });

        const response = await axiosVMS.get(
          `/api/collections/vehicle/records`,
          {
            params: {
              page,
              perPage,
            },
          }
        );

        console.log("✅ Raw Vehicle Response:", response.data);

        if (response.data) {
          const data = response.data;
          const items = data.items || [];
          const totalItems = data.totalItems || items.length || 0;

          dispatch.vehicle.updateTableDataState(items);
          dispatch.vehicle.updateTotalState(totalItems);
          dispatch.vehicle.updateCurrentPageState(page);
          dispatch.vehicle.updatePerPageState(perPage);

          console.log("✅ Vehicle state updated:", {
            itemsCount: items.length,
            total: totalItems,
            page,
            perPage,
          });

          // แก้ไข: แสดง success message เฉพาะเมื่อไม่อยู่ใน silent mode
          if (!silent) {
            // message.success(`Loaded ${items.length} vehicle records!`);
          }
        } else {
          console.warn("⚠️ No vehicle data in response");
          dispatch.vehicle.updateTableDataState([]);
          dispatch.vehicle.updateTotalState(0);

          if (!silent) {
            message.warning("No vehicle data received from VMS");
          }
        }
      } catch (error: any) {
        console.error("❌ Error fetching vehicle list:", error);

        if (error.response) {
          console.error("🚗 Vehicle API Error details:", {
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
          "Failed to fetch vehicle list";

        // แก้ไข: แสดง error message เฉพาะเมื่อไม่อยู่ใน silent mode
        if (!payload?.silent) {
          message.error(`Vehicle API Error: ${errorMessage}`);
        }

        dispatch.vehicle.updateTableDataState([]);
        dispatch.vehicle.updateTotalState(0);
      } finally {
        dispatch.vehicle.updateLoadingState(false);
      }
    },

    async refreshVehicleMapping() {
      try {
        console.log("🔄 Manually refreshing vehicle mapping...");
        await vehicleMappingService.refreshVehicleCache();
        message.success("Vehicle mapping refreshed successfully!");
      } catch (error) {
        console.error("❌ Failed to refresh vehicle mapping:", error);
        message.error("Failed to refresh vehicle mapping");
      }
    },

    async initializeVehicleMapping() {
      try {
        console.log("🚀 Initializing vehicle mapping...");
        await vehicleMappingService.refreshVehicleCache();
        console.log("✅ Vehicle mapping initialized");
      } catch (error) {
        console.error("❌ Failed to initialize vehicle mapping:", error);
      }
    },

    async searchVehiclesByLicensePlate(searchTerm: string) {
      try {
        console.log("🔍 Searching vehicles by license plate:", searchTerm);
        const results =
          await vehicleMappingService.searchVehiclesByLicensePlate(searchTerm);
        console.log("✅ Vehicle search results:", results);
        return results;
      } catch (error) {
        console.error("❌ Failed to search vehicles:", error);
        message.error("Failed to search vehicles");
        return [];
      }
    },

    async getVehiclesByHouseId(houseId: string) {
      try {
        console.log("🏠 Getting vehicles by house ID:", houseId);
        const results = await vehicleMappingService.getVehiclesByHouseId(
          houseId
        );
        console.log("✅ Vehicles for house:", results);
        return results;
      } catch (error) {
        console.error("❌ Failed to get vehicles by house ID:", error);
        message.error("Failed to get vehicles by house ID");
        return [];
      }
    },

    async getVehicleStats() {
      try {
        console.log("📊 Getting vehicle statistics...");
        const stats = vehicleMappingService.getVehicleStats();
        console.log("✅ Vehicle statistics:", stats);
        return stats;
      } catch (error) {
        console.error("❌ Failed to get vehicle statistics:", error);
        return {
          total: 0,
          byTier: {},
          active: 0,
          expired: 0,
        };
      }
    },
  }),
});
