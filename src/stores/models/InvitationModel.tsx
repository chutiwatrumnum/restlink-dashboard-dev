// ไฟล์: src/stores/models/InvitationModel.tsx - Updated with Filtering Support

import { createModel } from "@rematch/core";
import { RootModel } from "./";
import axiosVMS from "../../configs/axiosVMS";
import {
  InvitationType,
  InvitationRecord,
  VMSInvitationResponse,
  InvitationPaginationParams,
} from "../interfaces/Invitation";
import { vmsInvitationSearchService } from "../../utils/services/vmsInvitationSearchService";

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

        // ถ้ามี searchText ให้ใช้ search service
        if (payload.filters?.searchText && payload.filters.searchText.trim()) {
          console.log(
            "🔍 Using search service for:",
            payload.filters.searchText
          );

          const searchResults =
            await vmsInvitationSearchService.searchInvitations(
              payload.filters.searchText,
              payload.page,
              payload.perPage
            );

          // Apply other filters to search results
          let filteredResults = searchResults.data;

          if (payload.filters) {
            // Apply active filter
            if (payload.filters.active !== undefined) {
              filteredResults = filteredResults.filter(
                (item) => item.active === payload.filters.active
              );
            }

            // Apply type filter
            if (payload.filters.type) {
              filteredResults = filteredResults.filter(
                (item) => item.type === payload.filters.type
              );
            }

            // Apply stamped filter
            if (payload.filters.stamped !== undefined) {
              if (payload.filters.stamped) {
                filteredResults = filteredResults.filter(
                  (item) => item.stamped_time && item.stamped_time.trim()
                );
              } else {
                filteredResults = filteredResults.filter(
                  (item) => !item.stamped_time || !item.stamped_time.trim()
                );
              }
            }

            // Apply date range filter
            if (
              payload.filters.dateRange &&
              payload.filters.dateRange.length === 2
            ) {
              const [startDate, endDate] = payload.filters.dateRange;
              const startISO = startDate.startOf("day").toISOString();
              const endISO = endDate.endOf("day").toISOString();

              filteredResults = filteredResults.filter((item) => {
                if (!item.start_time) return false;
                const itemDate = new Date(item.start_time).toISOString();
                return itemDate >= startISO && itemDate <= endISO;
              });
            }
          }

          dispatch.invitation.setInvitationList({
            data: filteredResults,
            total: filteredResults.length,
            page: payload.page,
            perPage: payload.perPage,
          });

          console.log(`✅ Search completed: ${filteredResults.length} results`);
          return;
        }

        // ถ้าไม่มี search ให้ใช้ API filter ปกติ
        const params: any = {
          page: payload.page,
          perPage: payload.perPage,
        };

        // สร้าง filter string สำหรับ API
        const filterConditions: string[] = [];

        if (payload.filters) {
          // Active filter
          if (payload.filters.active !== undefined) {
            filterConditions.push(`active=${payload.filters.active}`);
          }

          // Type filter
          if (payload.filters.type) {
            filterConditions.push(`type="${payload.filters.type}"`);
          }

          // Stamped filter (ตรวจสอบว่า stamped_time มีค่าหรือไม่)
          if (payload.filters.stamped !== undefined) {
            if (payload.filters.stamped) {
              // ประทับตราแล้ว - stamped_time ไม่เป็น null หรือ empty
              filterConditions.push(`stamped_time!=""&&stamped_time!=null`);
            } else {
              // ยังไม่ประทับตรา - stamped_time เป็น null หรือ empty
              filterConditions.push(`(stamped_time=""||stamped_time=null)`);
            }
          }

          // Date range filter (ใช้กับ start_time)
          if (
            payload.filters.dateRange &&
            payload.filters.dateRange.length === 2
          ) {
            const [startDate, endDate] = payload.filters.dateRange;
            const startISO = startDate.startOf("day").toISOString();
            const endISO = endDate.endOf("day").toISOString();
            filterConditions.push(
              `start_time>="${startISO}"&&start_time<="${endISO}"`
            );
          }
        }

        // รวม filter conditions
        if (filterConditions.length > 0) {
          params.filter = filterConditions.join("&&");
          console.log("🔍 Applied filters:", params.filter);
        }

        // เพิ่ม sorting ถ้ามี
        if (payload.sortBy) {
          params.sort =
            payload.sortOrder === "desc"
              ? `-${payload.sortBy}`
              : payload.sortBy;
        } else {
          // Default sort by created date (newest first)
          params.sort = "-created";
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

          // แสดงสถิติ filter
          if (filterConditions.length > 0) {
            console.log(
              `📊 Filter results: ${invitations.length}/${response.data.totalItems} records`
            );
          }
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

    // เพิ่ม method สำหรับ get statistics ตาม filter
    async getInvitationStats(filters?: any) {
      try {
        console.log("📊 Getting invitation statistics...");

        // สร้าง params เหมือนกับ getInvitationList แต่ขอข้อมูลทั้งหมด
        const params: any = {
          page: 1,
          perPage: 1000, // ขอเยอะๆ เพื่อคำนวณ stats
        };

        const filterConditions: string[] = [];

        if (filters) {
          if (filters.active !== undefined) {
            filterConditions.push(`active=${filters.active}`);
          }
          if (filters.type) {
            filterConditions.push(`type="${filters.type}"`);
          }
          if (filters.searchText && filters.searchText.trim()) {
            filterConditions.push(`guest_name~"${filters.searchText.trim()}"`);
          }
          if (filters.stamped !== undefined) {
            if (filters.stamped) {
              filterConditions.push(`stamped_time!=""&&stamped_time!=null`);
            } else {
              filterConditions.push(`(stamped_time=""||stamped_time=null)`);
            }
          }
          if (filters.dateRange && filters.dateRange.length === 2) {
            const [startDate, endDate] = filters.dateRange;
            const startISO = startDate.startOf("day").toISOString();
            const endISO = endDate.endOf("day").toISOString();
            filterConditions.push(
              `start_time>="${startISO}"&&start_time<="${endISO}"`
            );
          }
        }

        if (filterConditions.length > 0) {
          params.filter = filterConditions.join("&&");
        }

        const response = await axiosVMS.get(
          "/api/collections/invitation/records",
          { params }
        );

        if (response.data && response.data.items) {
          const invitations = response.data.items;
          const now = new Date();

          const stats = {
            total: invitations.length,
            active: invitations.filter((item: any) => item.active === true)
              .length,
            inactive: invitations.filter((item: any) => item.active === false)
              .length,
            stamped: invitations.filter(
              (item: any) => item.stamped_time && item.stamped_time.trim()
            ).length,
            unstamped: invitations.filter(
              (item: any) => !item.stamped_time || !item.stamped_time.trim()
            ).length,
            expired: invitations.filter((item: any) => {
              if (!item.expire_time) return false;
              return new Date(item.expire_time) < now;
            }).length,
            byType: invitations.reduce((acc: any, item: any) => {
              acc[item.type] = (acc[item.type] || 0) + 1;
              return acc;
            }, {}),
          };

          console.log("📊 Invitation statistics:", stats);
          return stats;
        }

        return {
          total: 0,
          active: 0,
          inactive: 0,
          stamped: 0,
          unstamped: 0,
          expired: 0,
          byType: {},
        };
      } catch (error) {
        console.error("❌ Error getting invitation statistics:", error);
        return {
          total: 0,
          active: 0,
          inactive: 0,
          stamped: 0,
          unstamped: 0,
          expired: 0,
          byType: {},
        };
      }
    },
  }),
});
