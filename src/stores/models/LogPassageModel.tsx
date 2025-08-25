import { createModel } from "@rematch/core";
import { LogPassageType } from "../interfaces/LogPassage";
import { RootModel } from "./index";
import axiosVMS from "../../configs/axiosVMS";
import { message } from "antd";

export const logPassage = createModel<RootModel>()({
  state: {
    tableData: [],
    loading: false,
    total: 0,
    currentPage: 1,
    perPage: 10,
  } as LogPassageType,
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
    async getLogPassageList(payload?: {
      page?: number;
      perPage?: number;
      silent?: boolean;
      filters?: any;
    }) {
      dispatch.logPassage.updateLoadingState(true);

      try {
        const page = payload?.page || 1;
        const perPage = payload?.perPage || 10;
        const silent = payload?.silent || false;

        console.log("🚗 Fetching log passage list:", { page, perPage });

        const params: any = {
          page,
          perPage,
          sort: "-created", // เรียงตามวันที่สร้างล่าสุด
        };

        // เพิ่ม filters ถ้ามี
        if (payload?.filters) {
          const { filters } = payload;
          if (filters.isSuccess !== undefined) {
            params.filter = `isSuccess=${filters.isSuccess}`;
          }
          if (filters.tier) {
            const tierFilter = `tier="${filters.tier}"`;
            params.filter = params.filter
              ? `${params.filter} && ${tierFilter}`
              : tierFilter;
          }
          if (filters.region) {
            const regionFilter = `region="${filters.region}"`;
            params.filter = params.filter
              ? `${params.filter} && ${regionFilter}`
              : regionFilter;
          }
          if (filters.license_plate) {
            const plateFilter = `license_plate~"${filters.license_plate}"`;
            params.filter = params.filter
              ? `${params.filter} && ${plateFilter}`
              : plateFilter;
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
          `/api/collections/passage_log/records`,
          {
            params,
          }
        );

        console.log("✅ Raw Log Passage Response:", response.data);

        if (response.data) {
          const data = response.data;
          const items = data.items || [];
          const totalItems = data.totalItems || items.length || 0;

          dispatch.logPassage.updateTableDataState(items);
          dispatch.logPassage.updateTotalState(totalItems);
          dispatch.logPassage.updateCurrentPageState(page);
          dispatch.logPassage.updatePerPageState(perPage);

          console.log("✅ Log Passage state updated:", {
            itemsCount: items.length,
            total: totalItems,
            page,
            perPage,
          });

          if (!silent) {
            // message.success(`Loaded ${items.length} passage log records!`);
          }
        } else {
          console.warn("⚠️ No log passage data in response");
          dispatch.logPassage.updateTableDataState([]);
          dispatch.logPassage.updateTotalState(0);

          if (!silent) {
            message.warning("No log passage data received from VMS");
          }
        }
      } catch (error: any) {
        console.error("❌ Error fetching log passage list:", error);

        if (error.response) {
          console.error("🚗 Log Passage API Error details:", {
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
          "Failed to fetch log passage list";

        if (!payload?.silent) {
          message.error(`Log Passage API Error: ${errorMessage}`);
        }

        dispatch.logPassage.updateTableDataState([]);
        dispatch.logPassage.updateTotalState(0);
      } finally {
        dispatch.logPassage.updateLoadingState(false);
      }
    },

    async getLogPassageStats() {
      try {
        console.log("🚗 Getting log passage statistics...");

        // ดึงข้อมูลทั้งหมดเพื่อคำนวณ stats
        const response = await axiosVMS.get(
          `/api/collections/passage_log/records`,
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
          bySuccess: {} as Record<string, number>,
          byTier: {} as Record<string, number>,
          byRegion: {} as Record<string, number>,
          todayCount: 0,
          successRate: 0,
        };

        const today = new Date().toISOString().split("T")[0];
        let successCount = 0;

        items.forEach((item: any) => {
          // Count by success status
          const successKey = item.isSuccess ? "Success" : "Failed";
          stats.bySuccess[successKey] = (stats.bySuccess[successKey] || 0) + 1;

          // Count by tier
          stats.byTier[item.tier] = (stats.byTier[item.tier] || 0) + 1;

          // Count by region
          stats.byRegion[item.region] = (stats.byRegion[item.region] || 0) + 1;

          // Count today's records
          if (item.created.startsWith(today)) {
            stats.todayCount++;
          }

          // Count success
          if (item.isSuccess) {
            successCount++;
          }
        });

        // Calculate success rate
        stats.successRate =
          items.length > 0 ? (successCount / items.length) * 100 : 0;

        console.log("✅ Log Passage statistics:", stats);
        return stats;
      } catch (error) {
        console.error("❌ Failed to get log passage statistics:", error);
        return {
          total: 0,
          bySuccess: {},
          byTier: {},
          byRegion: {},
          todayCount: 0,
          successRate: 0,
        };
      }
    },
  }),
});
