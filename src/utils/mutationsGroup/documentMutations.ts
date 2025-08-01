import { useMutation } from "@tanstack/react-query";
import {
  CreateFolderType,
  EditFileType,
} from "../../stores/interfaces/Document";
import axios from "axios";

export const postCreateFolderMutation = () => {
  return useMutation({
    retry: 2,
    scope: {
      id: "createFolder",
    },
    mutationFn: (payload: CreateFolderType) => {
      // console.log(payload);
      return axios.post(`/document-home/dashboard/folder`, payload);
    },
  });
};

export const putEditFileMutation = () => {
  return useMutation({
    retry: 2,
    scope: {
      id: "editFile",
    },
    mutationFn: (payload: EditFileType) => {
      // console.log(payload);
      return axios.put(`/document-home/dashboard/file`, payload);
    },
  });
};

export const putEditFolderMutation = () => {
  return useMutation({
    retry: 2,
    scope: {
      id: "editFolder",
    },
    mutationFn: (payload: CreateFolderType) => {
      // console.log(payload);
      return axios.put(`/document-home/dashboard/folder`, payload);
    },
  });
};

export const deleteFolderMutation = () => {
  return useMutation({
    retry: 2,
    scope: {
      id: "deleteFolder",
    },
    mutationFn: (payload: number) => {
      return axios.delete(`/document-home/dashboard/folder/${payload}`);
    },
  });
};
