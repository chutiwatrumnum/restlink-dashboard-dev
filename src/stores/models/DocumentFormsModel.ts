import {
  DocumentFormType,
  GetPublicDataPayloadType,
} from "../interfaces/Document";
import { createModel } from "@rematch/core";
import { RootModel } from "./index";
import axios from "axios";

export const document = createModel<RootModel>()({
  state: {
    isLoading: true,
    tableData: [],
    currentFoldersMaxLength: 0,
    foldersLength: 0,
    refresh: false,
  } as DocumentFormType,
  reducers: {
    updateIsLoadingState: (state, payload) => ({
      ...state,
      isLoading: payload,
    }),
    updateTableDataState: (state, payload) => ({
      ...state,
      tableData: payload,
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
    updateFoldersLengthState: (state, payload) => ({
      ...state,
      foldersLength: payload,
    }),
  },
  effects: (dispatch) => ({
    async getPublicData(payload: GetPublicDataPayloadType) {
      let item = payload;
      let search = item.search ? `&search=${item.search}` : "";
      let sort = item.sort ? `&sort=${item.sort}` : "";
      let sortBy = item.sortBy ? `&sortBy=${item.sortBy}` : "";
      let folderId = `&folderId=${payload.folderId}`;

      try {
        dispatch.document.updateIsLoadingState(true);
        const result = await axios.get(
          `/document-home/dashboard?curPage=${item.curPage}&perPage=${item.perPage}${search}${sort}${sortBy}${folderId}`
        );
        // console.log("Doc result : ", result.data.result);

        if (result.data.statusCode >= 400) {
          console.error(result.data.message);
          return;
        }
        dispatch.document.updateCurrentFolderMaxLengthState(
          result.data.result.totalFolder + result.data.result.totalFiles
        );
        dispatch.document.updateFoldersLengthState(
          result.data.result.totalFolder
        );
        dispatch.document.updateTableDataState([
          ...result.data.result.folder,
          ...result.data.result.files,
        ]);
        dispatch.document.updateIsLoadingState(false);
      } catch (error) {
        console.error("ERROR", error);
      }
    },
  }),
});
