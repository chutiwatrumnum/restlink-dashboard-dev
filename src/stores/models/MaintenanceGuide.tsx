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
    currentFoldersMaxLength: 0,
    foldersLength: 0,
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
    updateCurrentFolderMaxLengthState: (state, payload) => ({
      ...state,
      currentFoldersMaxLength: payload,
    }),
    updateRefreshState: (state, payload) => ({
      ...state,
      refresh: payload,
    }),
    updateFoldersLengthState: (state, payload) => ({
      ...state,
      foldersLength: payload,
    }),
  },
  effects: (dispatch) => ({
    async getMaintenanceGuideData(payload: GetMaintenanceGuideDataPayloadType) {
      let item = payload;
      let search = item.search ? `&search=${item.search}` : "";
      let sort = item.sort ? `&sort=${item.sort}` : "";
      let sortBy = item.sortBy ? `&sortBy=${item.sortBy}` : "";
      let folderId = `&folderId=${payload.folderId}`;

      try {
        dispatch.maintenanceGuide.updateIsLoadingState(true);
        const result = await axios.get(
          `/document-project/dashboard?curPage=${item.curPage}&perPage=${item.perPage}${search}${sort}${sortBy}${folderId}`
        );
        // console.log("Doc project result : ", result);

        if (result.data.statusCode >= 400) {
          console.error(result.data.message);
          return;
        }
        dispatch.maintenanceGuide.updateCurrentFolderMaxLengthState(
          result.data.result.totalFolder + result.data.result.totalFiles
        );
        dispatch.maintenanceGuide.updateFoldersLengthState(
          result.data.result.folder.length
        );
        dispatch.maintenanceGuide.updateTableDataState([
          ...result.data.result.folder,
          ...result.data.result.files,
        ]);
        dispatch.maintenanceGuide.updateIsLoadingState(false);
      } catch (error) {
        console.error("ERROR", error);
      }
    },
  }),
});
