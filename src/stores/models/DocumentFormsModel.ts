import {
  DocumentFormType,
  GetPublicDataPayloadType,
} from "../interfaces/Document";
import { createModel } from "@rematch/core";
import { RootModel } from "./index";
import axios from "axios";
import { message } from "antd";

export const document = createModel<RootModel>()({
  state: {
    isLoading: true,
    tableData: [],
    publicFolders: [],
    publicFiles: [],
    currentFoldersMaxLength: 0,
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
    updatePublicFoldersState: (state, payload) => ({
      ...state,
      publicFolders: payload,
    }),
    updatePublicFilesState: (state, payload) => ({
      ...state,
      publicFiles: payload,
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
    async getPublicData(payload: GetPublicDataPayloadType) {
      let item = payload;
      let search = item.search ? `&search=${item.search}` : "";
      let sort = item.sort ? `&sort=${item.sort}` : "&sort=asc";
      let sortBy = item.sortBy ? `&sortBy=${item.sortBy}` : "&sortBy=createdAt";
      // let folderId = `&folderId=0`;

      try {
        const result = await axios.get(
          `/document-form/dashboard/public/folders?curPage=${item.curPage}&perPage=${item.perPage}${search}${sort}${sortBy}`
        );
        if (result.data.statusCode >= 400) {
          console.error(result.data.message);
          return;
        }
        dispatch.document.updatePublicFoldersState(result.data.result.folders);
        dispatch.document.updatePublicFilesState(result.data.result.files);
        dispatch.document.updateCurrentFolderMaxLengthState(
          result.data.result.totals
        );
        dispatch.document.updateTableDataState([
          ...result.data.result.folders,
          ...result.data.result.files,
        ]);
        dispatch.document.updateIsLoadingState(false);
      } catch (error) {
        console.error("ERROR", error);
      }
    },
    async getSearchPublicData(payload: GetPublicDataPayloadType) {
      let item = payload;
      let search = item.search ? `&search=${item.search}` : "";
      let sort = item.sort ? `&sort=${item.sort}` : "&sort=asc";
      let sortBy = item.sortBy ? `&sortBy=${item.sortBy}` : "&sortBy=createdAt";

      try {
        console.log(
          `/document-form/dashboard/public/folders?curPage=${item.curPage}&perPage=${item.perPage}${search}${sort}${sortBy}`
        );

        const result = await axios.get(
          `/document-form/dashboard/public/folders?curPage=${item.curPage}&perPage=${item.perPage}${search}${sort}${sortBy}`
        );
        if (result.data.statusCode >= 400) {
          console.error(result.data.message);
          return;
        }
        dispatch.document.updateTableDataState([
          ...result.data.result.folders,
          ...result.data.result.files,
        ]);
        dispatch.document.updateIsLoadingState(false);
      } catch (error) {
        console.error("ERROR", error);
      }
    },
    async getFolderData(payload: GetPublicDataPayloadType) {
      let item = payload;
      let search = item.search ? `&search=${item.search}` : "";
      let sort = item.sort ? `&sort=${item.sort}` : "&sort=asc";
      let sortBy = item.sortBy ? `&sortBy=${item.sortBy}` : "&sortBy=createdAt";
      let folderId =
        item.folderId || item.folderId === 0
          ? `&folderId=${item.folderId}`
          : -1;

      if (folderId === -1) return message.error("File is no action!");
      dispatch.document.updateIsLoadingState(true);

      try {
        const result = await axios.get(
          `/document-form/dashboard/public/folders?curPage=${item.curPage}&perPage=${item.perPage}${search}${sort}${sortBy}${folderId}`
        );
        // console.log("RES", result);

        if (result.data.statusCode >= 400) {
          throw new Error(result.data.message);
        }
        dispatch.document.updateCurrentFolderMaxLengthState(
          result.data.result.totals
        );
        dispatch.document.updateTableDataState([
          ...result.data.result.folders,
          ...result.data.result.files,
        ]);
        dispatch.document.updateIsLoadingState(false);
      } catch (error) {
        console.error("ERROR", error);
      }
    },
  }),
});
