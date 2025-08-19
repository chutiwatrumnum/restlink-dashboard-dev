// ไฟล์: src/stores/models/InvitationModel.tsx - Final Version

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
    houseMapping: new Map<string, string>(),
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

        const response = await axiosVMS.get(
          `/api/collections/invitation/records`,
          {
            params: {
              page,
              perPage,
            },
          }
        );

        if (response.data) {
          const data = response.data;
          const items = data.items || [];

          // แปลงข้อมูลจาก VMS format เป็น UI format
          const processedItems = items.map((item: any) => {
            // VMS API ส่ง license_plate และ area_code แยกออกมา (GET format)
            // เราต้องสร้าง vehicle_id เพื่อใช้ในตาราง

            let vehicleIds: string[] = [];

            // ถ้ามี license_plate อยู่ใน item (flattened format)
            if (item.license_plate) {
              // ใช้ license_plate เป็น vehicle_id ชั่วคราวสำหรับแสดงใน UI
              vehicleIds = [item.license_plate];
            }

            // ถ้ามี vehicle_id อยู่แล้ว (ในบางกรณี)
            if (item.vehicle_id && Array.isArray(item.vehicle_id)) {
              vehicleIds = item.vehicle_id;
            }

            return {
              ...item,
              vehicle_id: vehicleIds, // เพิ่ม vehicle_id สำหรับ UI
            };
          });

          // ดึง house IDs ทั้งหมดที่มีใน invitation
          const houseIds = processedItems
            .map((item: any) => item.house_id)
            .filter(Boolean);

          // โหลด house mapping
          if (houseIds.length > 0) {
            const houseMapping =
              await houseMappingService.getMultipleHouseAddresses(houseIds);
            dispatch.invitation.updateHouseMappingState(houseMapping);
          }

          const totalItems = data.totalItems || processedItems.length || 0;

          dispatch.invitation.updateTableDataState(processedItems);
          dispatch.invitation.updateTotalState(totalItems);
          dispatch.invitation.updateCurrentPageState(page);
          dispatch.invitation.updatePerPageState(perPage);

          message.success(
            `Loaded ${processedItems.length} invitation records!`
          );
        } else {
          dispatch.invitation.updateTableDataState([]);
          dispatch.invitation.updateTotalState(0);
          message.warning("No data received from VMS");
        }
      } catch (error: any) {
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
        await houseMappingService.refreshHouseCache();

        const { currentPage, perPage } = dispatch.getState().invitation;
        await dispatch.invitation.getInvitationList({
          page: currentPage,
          perPage,
        });

        message.success("House mapping refreshed successfully!");
      } catch (error) {
        message.error("Failed to refresh house mapping");
      }
    },
  }),
});
