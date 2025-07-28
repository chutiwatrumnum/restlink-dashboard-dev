import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import {
  callFailedModal,
  callSuccessModal,
} from "../../components/common/Modal";
import {
  AddUserPayload,
  DeleteMemberPayload,
} from "../../stores/interfaces/Management";

// Search user
export const postSearchUserMutation = () => {
  return useMutation({
    retry: 2,
    scope: {
      id: "searchUser",
    },
    mutationFn: (payload: { search: string; curPage: number }) => {
      return axios.post(`/room-management/query-user-by-fullname`, payload);
    },
    onError: (error) => {
      console.warn("Error:", error);
    },
    onSuccess: async (data) => {
      // console.log("Success:", data);
      if (data.status >= 400) {
        callFailedModal(data.data.message);
        throw "Something went wrong!";
      }
    },
  });
};

// Add member
export const postAddMemberMutation = () => {
  return useMutation({
    retry: 2,
    scope: {
      id: "addMember",
    },
    mutationFn: (payload: AddUserPayload) => {
      return axios.post(`/room-management/member/add`, payload);
    },
    onError: (error) => {
      console.warn("Error:", error);
    },
    onSuccess: async (data) => {
      //   console.log("Success:", data);
      callSuccessModal("Successfully added");
      if (data.status >= 400) {
        callFailedModal(data.data.message);
        throw "Something went wrong!";
      }
    },
  });
};

// delete member
export const deleteMemberMutation = () => {
  return useMutation({
    retry: 2,
    scope: {
      id: "deleteMember",
    },
    mutationFn: (payload: DeleteMemberPayload) => {
      return axios.delete(`/room-management/member`, {
        data: payload,
      });
    },
    onError: (error) => {
      console.warn("Error:", error);
    },
    onSuccess: async (data) => {
      if (data.status >= 400) {
        callFailedModal(data.data.message);
        throw "Something went wrong!";
      }
    },
  });
};
