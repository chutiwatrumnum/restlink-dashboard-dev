import { useMutation } from "@tanstack/react-query";
import { CreateFolderType } from "../../stores/interfaces/Document";
import axios from "axios";

export const postCreateFolderMutation = () => {
  return useMutation({
    retry: 2,
    scope: {
      id: "createFolder",
    },
    mutationFn: (payload: CreateFolderType) => {
      return axios.post(`/document-home/dashboard/folder`, payload);
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
