// ไฟล์: src/stores/models/LogAccessModel.tsx

import { createModel } from "@rematch/core";
import { LogAccessType } from "../interfaces/LogAccess";
import { RootModel } from "./index";
import axiosVMS from "../../configs/axiosVMS";
import { message } from "antd";

export const logAccess = createModel<RootModel>()({
  state: {
    tableData: [],
    loading: false,
    total: 0,
    currentPage: 1,
    perPage: 10,
  } as LogAccessType,
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
    async getLogAccessList(payload?: {
      page?: number;
      perPage?: number;
      silent?: boolean;
      filters?: any;
    }) {
      dispatch.logAccess.updateLoadingState(true);

      try {
        const page = payload?.page || 1;
        const perPage = payload?.perPage || 10;
        const silent = payload?.silent || false;

        console.log("📊 Fetching log access list:", { page, perPage });

        const params: any = {
          page,
          perPage,
          sort: "-created", // เรียงตามวันที่สร้างล่าสุด
        };

        // เพิ่ม filters ถ้ามี
        if (payload?.filters) {
          const { filters } = payload;
          if (filters.result) {
            params.filter = `result="${filters.result}"`;
          }
          if (filters.tier) {
            const tierFilter = `tier="${filters.tier}"`;
            params.filter = params.filter
              ? `${params.filter} && ${tierFilter}`
              : tierFilter;
          }
          if (filters.gate_state) {
            const gateStateFilter = `gate_state="${filters.gate_state}"`;
            params.filter = params.filter
              ? `${params.filter} && ${gateStateFilter}`
              : gateStateFilter;
          }
          if (filters.gate_name) {
            const gateNameFilter = `gate_name~"${filters.gate_name}"`;
            params.filter = params.filter
              ? `${params.filter} && ${gateNameFilter}`
              : gateNameFilter;
          }
          if (filters.dateRange) {
            const startDate = `created>="${filters.dateRange.start}"`;
            const endDate = `created<="${filters.dateRange.end}"`;
            const dateFilter = `${startDate} && ${endDate}`;
            params.filter = params.filter
              ? `${params.filter} && ${dateFilter}`
              : dateFilter;
          }
        }

        const response = await axiosVMS.get(
          `/api/collections/access_log/records`,
          {
            params,
          }
        );

        console.log("✅ Raw Log Access Response:", response.data);

        if (response.data) {
          const data = response.data;
          const items = data.items || [];
          const totalItems = data.totalItems || items.length || 0;

          dispatch.logAccess.updateTableDataState(items);
          dispatch.logAccess.updateTotalState(totalItems);
          dispatch.logAccess.updateCurrentPageState(page);
          dispatch.logAccess.updatePerPageState(perPage);

          console.log("✅ Log Access state updated:", {
            itemsCount: items.length,
            total: totalItems,
            page,
            perPage,
          });

          if (!silent) {
            // message.success(`Loaded ${items.length} access log records!`);
          }
        } else {
          console.warn("⚠️ No log access data in response");
          dispatch.logAccess.updateTableDataState([]);
          dispatch.logAccess.updateTotalState(0);

          if (!silent) {
            message.warning("No log access data received from VMS");
          }
        }
      } catch (error: any) {
        console.error("❌ Error fetching log access list:", error);

        if (error.response) {
          console.error("📊 Log Access API Error details:", {
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
          "Failed to fetch log access list";

        if (!payload?.silent) {
          message.error(`Log Access API Error: ${errorMessage}`);
        }

        dispatch.logAccess.updateTableDataState([]);
        dispatch.logAccess.updateTotalState(0);
      } finally {
        dispatch.logAccess.updateLoadingState(false);
      }
    },

    async getLogAccessStats() {
      try {
        console.log("📊 Getting log access statistics...");

        // ดึงข้อมูลทั้งหมดเพื่อคำนวณ stats
        const response = await axiosVMS.get(
          `/api/collections/access_log/records`,
          {
            params: {
              perPage: 1000, // ดึงจำนวนมากเพื่อคำนวณ stats
              page: 1,
              sort: "-created",
            },
          }
        );

        const items = response.data?.items || [];

        const stats = {
          total: items.length,
          byResult: {} as Record<string, number>,
          byTier: {} as Record<string, number>,
          byGateState: {} as Record<string, number>,
          todayCount: 0,
          successRate: 0,
        };

        const today = new Date().toISOString().split("T")[0];
        let successCount = 0;

        items.forEach((item: any) => {
          // Count by result
          stats.byResult[item.result] = (stats.byResult[item.result] || 0) + 1;

          // Count by tier
          stats.byTier[item.tier] = (stats.byTier[item.tier] || 0) + 1;

          // Count by gate state
          stats.byGateState[item.gate_state] =
            (stats.byGateState[item.gate_state] || 0) + 1;

          // Count today's records
          if (item.created.startsWith(today)) {
            stats.todayCount++;
          }

          // Count success
          if (item.result === "success") {
            successCount++;
          }
        });

        // Calculate success rate
        stats.successRate =
          items.length > 0 ? (successCount / items.length) * 100 : 0;

        console.log("✅ Log Access statistics:", stats);
        return stats;
      } catch (error) {
        console.error("❌ Failed to get log access statistics:", error);
        return {
          total: 0,
          byResult: {},
          byTier: {},
          byGateState: {},
          todayCount: 0,
          successRate: 0,
        };
      }
    },
  }),
});
