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
      id: "createFolderProject",
    },
    mutationFn: (payload: CreateFolderType) => {
      return axios.post(`/document-project/dashboard/folder`, payload);
    },
  });
};

export const putEditFileMutation = () => {
  return useMutation({
    retry: 2,
    scope: {
      id: "editProjectFile",
    },
    mutationFn: (payload: EditFileType) => {
      // console.log(payload);
      return axios.put(`/document-project/dashboard/file`, payload);
    },
  });
};

export const putEditFolderMutation = () => {
  return useMutation({
    retry: 2,
    scope: {
      id: "editProjectFolder",
    },
    mutationFn: (payload: CreateFolderType) => {
      // console.log(payload);
      return axios.put(`/document-project/dashboard/folder`, payload);
    },
  });
};

export const deleteFolderMutation = () => {
  return useMutation({
    retry: 2,
    scope: {
      id: "deleteFolderProject",
    },
    mutationFn: (payload: number) => {
      return axios.delete(`/document-project/dashboard/folder/${payload}`);
    },
  });
};
