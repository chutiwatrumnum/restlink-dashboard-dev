// ไฟล์: src/stores/models/invitation.ts - Complete Version

import { createModel } from "@rematch/core";
import { RootModel } from "./";
import axiosVMS from "../../configs/axiosVMS";
import {
  InvitationType,
  InvitationRecord,
  VMSInvitationResponse,
  InvitationPaginationParams,
} from "../interfaces/Invitation";

const initialState: InvitationType = {
  tableData: [],
  loading: false,
  total: 0,
  currentPage: 1,
  perPage: 10,
  houseMapping: new Map(),
};

export const invitation = createModel<RootModel>()({
  state: initialState,
  reducers: {
    setLoading: (state, loading: boolean) => ({
      ...state,
      loading,
    }),
    setInvitationList: (
      state,
      payload: {
        data: InvitationRecord[];
        total: number;
        page: number;
        perPage: number;
      }
    ) => ({
      ...state,
      tableData: payload.data,
      total: payload.total,
      currentPage: payload.page,
      perPage: payload.perPage,
      loading: false,
    }),
    setHouseMapping: (state, houseMapping: Map<string, string>) => ({
      ...state,
      houseMapping,
    }),
    updateInvitation: (state, updatedInvitation: InvitationRecord) => ({
      ...state,
      tableData: state.tableData.map((item) =>
        item.id === updatedInvitation.id ? updatedInvitation : item
      ),
    }),
    removeInvitation: (state, invitationId: string) => ({
      ...state,
      tableData: state.tableData.filter((item) => item.id !== invitationId),
      total: state.total - 1,
    }),
    addInvitation: (state, newInvitation: InvitationRecord) => ({
      ...state,
      tableData: [newInvitation, ...state.tableData],
      total: state.total + 1,
    }),
  },
  effects: (dispatch) => ({
    async getInvitationList(payload: InvitationPaginationParams) {
      try {
        dispatch.invitation.setLoading(true);
        console.log("📡 Fetching VMS invitations...", payload);

        const params: any = {
          page: payload.page,
          perPage: payload.perPage,
        };

        // เพิ่ม filters ถ้ามี
        if (payload.filters) {
          if (payload.filters.active !== undefined) {
            params.filter = `active=${payload.filters.active}`;
          }
          if (payload.filters.type) {
            params.filter = params.filter
              ? `${params.filter} && type="${payload.filters.type}"`
              : `type="${payload.filters.type}"`;
          }
          if (payload.filters.guest_name) {
            params.filter = params.filter
              ? `${params.filter} && guest_name~"${payload.filters.guest_name}"`
              : `guest_name~"${payload.filters.guest_name}"`;
          }
        }

        // เพิ่ม sorting ถ้ามี
        if (payload.sortBy) {
          params.sort =
            payload.sortOrder === "desc"
              ? `-${payload.sortBy}`
              : payload.sortBy;
        }

        const response = await axiosVMS.get(
          "/api/collections/invitation/records",
          {
            params,
          }
        );

        console.log("✅ VMS invitations response:", response.data);

        if (response.data && response.data.items) {
          // แปลง VMSInvitationResponse เป็น InvitationRecord
          const invitations: InvitationRecord[] = response.data.items.map(
            (item: VMSInvitationResponse) => ({
              id: item.id,
              code: item.code || "",
              guest_name: item.guest_name,
              house_id: item.house_id,
              issuer: item.issuer || "",
              note: item.note || "",
              type: item.type,
              active: item.active,
              authorized_area: Array.isArray(item.authorized_area)
                ? item.authorized_area
                : [],
              vehicle_id: Array.isArray(item.vehicle_id) ? item.vehicle_id : [], // เก็บ vehicle IDs เดิมไว้
              start_time: item.start_time,
              expire_time: item.expire_time,
              stamped_time: item.stamped_time || "",
              stamper: item.stamper || "",
              created: item.created,
              updated: item.updated,
            })
          );

          dispatch.invitation.setInvitationList({
            data: invitations,
            total: response.data.totalItems || 0,
            page: payload.page,
            perPage: payload.perPage,
          });

          console.log(`✅ Loaded ${invitations.length} invitations`);
        } else {
          dispatch.invitation.setInvitationList({
            data: [],
            total: 0,
            page: payload.page,
            perPage: payload.perPage,
          });
        }
      } catch (error: any) {
        console.error("❌ Error fetching VMS invitations:", error);
        dispatch.invitation.setLoading(false);
      }
    },

    async refreshHouseMapping() {
      try {
        console.log("🏠 Refreshing house mapping...");

        // ดึงข้อมูล house จาก state หรือ API
        const houseState = dispatch.getState().house;
        let houseData = houseState.tableData;

        if (!houseData || houseData.length === 0) {
          // ถ้ายังไม่มีข้อมูล house ให้ดึงจาก API
          await dispatch.house.getHouseList({ page: 1, perPage: 500 });
          houseData = dispatch.getState().house.tableData;
        }

        // สร้าง mapping จาก house ID เป็น address
        const mapping = new Map<string, string>();
        houseData.forEach((house) => {
          mapping.set(house.id, house.address);
        });

        dispatch.invitation.setHouseMapping(mapping);
        console.log(
          `✅ House mapping refreshed with ${mapping.size} addresses`
        );
      } catch (error) {
        console.error("❌ Error refreshing house mapping:", error);
      }
    },

    // Helper method สำหรับ update invitation หลังจาก CRUD operations
    async refreshSingleInvitation(invitationId: string) {
      try {
        console.log(`🔄 Refreshing invitation ${invitationId}...`);

        const response = await axiosVMS.get(
          `/api/collections/invitation/records/${invitationId}`
        );

        if (response.data) {
          const updatedInvitation: InvitationRecord = {
            id: response.data.id,
            code: response.data.code || "",
            guest_name: response.data.guest_name,
            house_id: response.data.house_id,
            issuer: response.data.issuer || "",
            note: response.data.note || "",
            type: response.data.type,
            active: response.data.active,
            authorized_area: Array.isArray(response.data.authorized_area)
              ? response.data.authorized_area
              : [],
            vehicle_id: Array.isArray(response.data.vehicle_id)
              ? response.data.vehicle_id
              : [],
            start_time: response.data.start_time,
            expire_time: response.data.expire_time,
            stamped_time: response.data.stamped_time || "",
            stamper: response.data.stamper || "",
            created: response.data.created,
            updated: response.data.updated,
          };

          dispatch.invitation.updateInvitation(updatedInvitation);
          console.log(`✅ Invitation ${invitationId} refreshed`);
        }
      } catch (error) {
        console.error(`❌ Error refreshing invitation ${invitationId}:`, error);
      }
    },
  }),
});
