// ไฟล์: src/stores/models/InvitationModel.tsx

import { createModel } from "@rematch/core";
import { InvitationType } from "../interfaces/Invitation";
import { RootModel } from "./index";
import axiosVMS from "../../configs/axiosVMS";
import { message } from "antd";
import { houseMappingService } from "../../utils/services/houseMappingService";

export const invitation = createModel<RootModel>()({
  state: {
    tableData: [],
    loading: false,
    total: 0,
    currentPage: 1,
    perPage: 10,
    houseMapping: new Map<string, string>(), // เพิ่ม house mapping
  } as InvitationType & { houseMapping: Map<string, string> },
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
    updateHouseMappingState: (state, payload) => ({
      ...state,
      houseMapping: payload,
    }),
  },
  effects: (dispatch) => ({
    async getInvitationList(payload?: { page?: number; perPage?: number }) {
      dispatch.invitation.updateLoadingState(true);

      try {
        const page = payload?.page || 1;
        const perPage = payload?.perPage || 10;

        console.log("🔄 Fetching invitation list:", { page, perPage });

        const response = await axiosVMS.get(
          `/api/collections/invitation/records`,
          {
            params: {
              page,
              perPage,
            },
          }
        );

        console.log("✅ Raw VMS Response:", response.data);

        if (response.data) {
          const data = response.data;
          const items = data.items || [];

          // ดึง house IDs ทั้งหมดที่มีใน invitation
          const houseIds = items
            .map((item: any) => item.house_id)
            .filter(Boolean);
          console.log("🏠 House IDs found in invitations:", houseIds);

          // โหลด house mapping
          if (houseIds.length > 0) {
            const houseMapping =
              await houseMappingService.getMultipleHouseAddresses(houseIds);
            dispatch.invitation.updateHouseMappingState(houseMapping);
            console.log(
              "🗺️ House mapping loaded:",
              Array.from(houseMapping.entries())
            );
          }

          const totalItems = data.totalItems || items.length || 0;

          dispatch.invitation.updateTableDataState(items);
          dispatch.invitation.updateTotalState(totalItems);
          dispatch.invitation.updateCurrentPageState(page);
          dispatch.invitation.updatePerPageState(perPage);

          console.log("✅ State updated:", {
            itemsCount: items.length,
            total: totalItems,
            page,
            perPage,
            houseMappingSize: houseIds.length,
          });

          message.success(
            `Loaded ${items.length} invitation records with house mapping!`
          );
        } else {
          console.warn("⚠️ No data in response");
          dispatch.invitation.updateTableDataState([]);
          dispatch.invitation.updateTotalState(0);
          message.warning("No data received from VMS");
        }
      } catch (error: any) {
        console.error("❌ Error fetching invitation list:", error);

        // แสดงข้อมูล error ที่ละเอียดมากขึ้น
        if (error.response) {
          console.error("📋 Error details:", {
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
          "Failed to fetch invitation list";

        message.error(`Error: ${errorMessage}`);

        dispatch.invitation.updateTableDataState([]);
        dispatch.invitation.updateTotalState(0);
      } finally {
        dispatch.invitation.updateLoadingState(false);
      }
    },

    async refreshHouseMapping() {
      try {
        console.log("🔄 Manually refreshing house mapping...");
        await houseMappingService.refreshHouseCache();

        // รีเฟรช invitation list เพื่อใช้ mapping ใหม่
        const { currentPage, perPage } = dispatch.getState().invitation;
        await dispatch.invitation.getInvitationList({
          page: currentPage,
          perPage,
        });

        message.success("House mapping refreshed successfully!");
      } catch (error) {
        console.error("❌ Failed to refresh house mapping:", error);
        message.error("Failed to refresh house mapping");
      }
    },
  }),
});
