import {
  MaintenanceGuideFormType,
  GetMaintenanceGuideDataPayloadType,
} from "../interfaces/MaintenanceGuide";
import { createModel } from "@rematch/core";
import { RootModel } from "./index";
import axios from "axios";
import { message } from "antd";

export const maintenanceGuide = createModel<RootModel>()({
  state: {
    isLoading: true,
    tableData: [],
    maintenanceGuideFolders: [],
    maintenanceGuideFiles: [],
    currentFoldersMaxLength: 0,
    refresh: false,
  } as MaintenanceGuideFormType,
  reducers: {
    updateIsLoadingState: (state, payload) => ({
      ...state,
      isLoading: payload,
    }),
    updateTableDataState: (state, payload) => ({
      ...state,
      tableData: payload,
    }),
    updateMaintenanceGuideFoldersState: (state, payload) => ({
      ...state,
      maintenanceGuideFolders: payload,
    }),
    updateMaintenanceGuideFilesState: (state, payload) => ({
      ...state,
      maintenanceGuideFiles: payload,
    }),
    updateCurrentFolderState: (state, payload) => ({
      ...state,
      currentFolder: payload,
    }),
    updateCurrentFolderMaxLengthState: (state, payload) => ({
      ...state,
      currentFoldersMaxLength: payload,
    }),
    updateRefreshState: (state, payload) => ({
      ...state,
      refresh: payload,
    }),
  },
  effects: (dispatch) => ({
    async getMaintenanceGuideData(payload: GetMaintenanceGuideDataPayloadType) {
      let item = payload;
      let search = item.search ? `&search=${item.search}` : "";
      let sort = item.sort ? `&sort=${item.sort}` : "&sort=asc";
      let sortBy = item.sortBy ? `&sortBy=${item.sortBy}` : "&sortBy=createdAt";
      // let folderId = `&folderId=0`;

      try {
        const result = await axios.get(
          `/maintenance-guide/dashboard/folders?curPage=${item.curPage}&perPage=${item.perPage}${search}${sort}${sortBy}`
        );
        if (result.data.statusCode >= 400) {
          console.error(result.data.message);
          return;
        }
        dispatch.maintenanceGuide.updateMaintenanceGuideFoldersState(
          result.data.result.folders
        );
        dispatch.maintenanceGuide.updateMaintenanceGuideFilesState(
          result.data.result.files
        );
        dispatch.maintenanceGuide.updateCurrentFolderMaxLengthState(
          result.data.result.totals
        );
        dispatch.maintenanceGuide.updateTableDataState([
          ...result.data.result.folders,
          ...result.data.result.files,
        ]);
        dispatch.maintenanceGuide.updateIsLoadingState(false);
      } catch (error) {
        console.error("ERROR", error);
      }
    },
    async getSearchMaintenanceGuideData(
      payload: GetMaintenanceGuideDataPayloadType
    ) {
      let item = payload;
      let search = item.search ? `&search=${item.search}` : "";
      let sort = item.sort ? `&sort=${item.sort}` : "&sort=asc";
      let sortBy = item.sortBy ? `&sortBy=${item.sortBy}` : "&sortBy=createdAt";

      try {
        const result = await axios.get(
          `/maintenance-guide/dashboard/folders?curPage=${item.curPage}&perPage=${item.perPage}${search}${sort}${sortBy}`
        );
        if (result.data.statusCode >= 400) {
          console.error(result.data.message);
          return;
        }
        dispatch.maintenanceGuide.updateTableDataState([
          ...result.data.result.folders,
          ...result.data.result.files,
        ]);
        dispatch.maintenanceGuide.updateIsLoadingState(false);
      } catch (error) {
        console.error("ERROR", error);
      }
    },
    async getFolderData(payload: GetMaintenanceGuideDataPayloadType) {
      let item = payload;
      let search = item.search ? `&search=${item.search}` : "";
      let sort = item.sort ? `&sort=${item.sort}` : "&sort=asc";
      let sortBy = item.sortBy ? `&sortBy=${item.sortBy}` : "&sortBy=createdAt";
      let folderId =
        item.folderId || item.folderId === 0
          ? `&folderId=${item.folderId}`
          : -1;

      if (folderId === -1) return message.error("File is no action!");
      dispatch.maintenanceGuide.updateIsLoadingState(true);

      try {
        const result = await axios.get(
          `/maintenance-guide/dashboard/folders?curPage=${item.curPage}&perPage=${item.perPage}${search}${sort}${sortBy}${folderId}`
        );
        // console.log("RES", result);

        if (result.data.statusCode >= 400) {
          throw new Error(result.data.message);
        }
        dispatch.maintenanceGuide.updateCurrentFolderMaxLengthState(
          result.data.result.totals
        );
        dispatch.maintenanceGuide.updateTableDataState([
          ...result.data.result.folders,
          ...result.data.result.files,
        ]);
        dispatch.maintenanceGuide.updateIsLoadingState(false);
      } catch (error) {
        console.error("ERROR", error);
      }
    },
  }),
});
