import { createModel } from "@rematch/core";
import { VMSVisitorType } from "../interfaces/VMSVisitor";
import { RootModel } from "./index";
import axiosVMS from "../../configs/axiosVMS";
import { message } from "antd";

export const vmsVisitor = createModel<RootModel>()({
  state: {
    tableData: [],
    loading: false,
    total: 0,
    currentPage: 1,
    perPage: 10,
  } as VMSVisitorType,
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
    async getVMSVisitorList(payload?: {
      page?: number;
      perPage?: number;
      silent?: boolean;
      filters?: any;
    }) {
      dispatch.vmsVisitor.updateLoadingState(true);

      try {
        const page = payload?.page || 1;
        const perPage = payload?.perPage || 10;
        const silent = payload?.silent || false;

        console.log("👥 Fetching VMS visitor list:", { page, perPage });

        const params: any = {
          page,
          perPage,
          sort: "-created", // Sort by created date (newest first)
        };

        // Add filters if provided
        if (payload?.filters) {
          const { filters } = payload;
          const filterConditions: string[] = [];

          if (filters.gender) {
            filterConditions.push(`gender="${filters.gender}"`);
          }

          if (filters.stamped !== undefined) {
            if (filters.stamped) {
              filterConditions.push(`stamped_time!=""&&stamped_time!=null`);
            } else {
              filterConditions.push(`(stamped_time=""||stamped_time=null)`);
            }
          }

          if (filters.house_id) {
            filterConditions.push(`house_id="${filters.house_id}"`);
          }

          if (filters.name) {
            filterConditions.push(
              `(first_name~"${filters.name}"||last_name~"${filters.name}")`
            );
          }

          if (filters.dateRange) {
            const startDate = `created>="${filters.dateRange.start}"`;
            const endDate = `created<="${filters.dateRange.end}"`;
            filterConditions.push(`${startDate}&&${endDate}`);
          }

          if (filterConditions.length > 0) {
            params.filter = filterConditions.join("&&");
          }
        }

        const response = await axiosVMS.get(
          `/api/collections/visitor/records`,
          { params }
        );

        console.log("✅ Raw VMS Visitor Response:", response.data);

        if (response.data) {
          const data = response.data;
          const items = data.items || [];
          const totalItems = data.totalItems || items.length || 0;

          dispatch.vmsVisitor.updateTableDataState(items);
          dispatch.vmsVisitor.updateTotalState(totalItems);
          dispatch.vmsVisitor.updateCurrentPageState(page);
          dispatch.vmsVisitor.updatePerPageState(perPage);

          console.log("✅ VMS Visitor state updated:", {
            itemsCount: items.length,
            total: totalItems,
            page,
            perPage,
          });

          if (!silent) {
            // message.success(`Loaded ${items.length} VMS visitor records!`);
          }
        } else {
          console.warn("⚠️ No VMS visitor data in response");
          dispatch.vmsVisitor.updateTableDataState([]);
          dispatch.vmsVisitor.updateTotalState(0);

          if (!silent) {
            message.warning("No VMS visitor data received from VMS");
          }
        }
      } catch (error: any) {
        console.error("❌ Error fetching VMS visitor list:", error);

        if (error.response) {
          console.error("👥 VMS Visitor API Error details:", {
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
          "Failed to fetch VMS visitor list";

        if (!payload?.silent) {
          message.error(`VMS Visitor API Error: ${errorMessage}`);
        }

        dispatch.vmsVisitor.updateTableDataState([]);
        dispatch.vmsVisitor.updateTotalState(0);
      } finally {
        dispatch.vmsVisitor.updateLoadingState(false);
      }
    },

    async getVMSVisitorStats() {
      try {
        console.log("📊 Getting VMS visitor statistics...");

        // Get all data to calculate stats
        const response = await axiosVMS.get(
          `/api/collections/visitor/records`,
          {
            params: {
              perPage: 1000, // Get many records to calculate stats
              page: 1,
              sort: "-created",
            },
          }
        );

        const items = response.data?.items || [];

        const stats = {
          total: items.length,
          byGender: {} as Record<string, number>,
          stamped: 0,
          unstamped: 0,
          todayCount: 0,
          byHouse: {} as Record<string, number>,
        };

        const today = new Date().toISOString().split("T")[0];

        items.forEach((item: any) => {
          // Count by gender
          stats.byGender[item.gender] = (stats.byGender[item.gender] || 0) + 1;

          // Count stamped/unstamped
          if (item.stamped_time && item.stamped_time.trim()) {
            stats.stamped++;
          } else {
            stats.unstamped++;
          }

          // Count today's records
          if (item.created.startsWith(today)) {
            stats.todayCount++;
          }

          // Count by house
          if (item.house_id) {
            stats.byHouse[item.house_id] =
              (stats.byHouse[item.house_id] || 0) + 1;
          }
        });

        console.log("✅ VMS Visitor statistics:", stats);
        return stats;
      } catch (error) {
        console.error("❌ Failed to get VMS visitor statistics:", error);
        return {
          total: 0,
          byGender: {},
          stamped: 0,
          unstamped: 0,
          todayCount: 0,
          byHouse: {},
        };
      }
    },
  }),
});
