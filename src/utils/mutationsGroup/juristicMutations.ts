// ไฟล์: src/utils/mutationsGroup/juristicMutations.ts

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { JuristicAddNew, JuristicEditPayload } from "../../stores/interfaces/JuristicManage";
import axios from "axios";
import { message } from "antd";

// === CREATE JURISTIC INVITATION ===
export const postCreateJuristicMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    retry: 2,
    scope: {
      id: "createJuristic",
    },
    mutationFn: async (payload: JuristicAddNew) => {
      try {
        const apiPayload = {
          roleId: payload.roleId,
          firstName: payload.firstName,
          middleName: payload.middleName || "",
          lastName: payload.lastName,
          contact: payload.contact,
          email: payload.email,
          ...(payload.image && { image: payload.image })
        };

        console.log("API Payload:", apiPayload);

        const response = await axios.post(`/team-management/invitation/juristic/create`, apiPayload);

        // ตรวจสอบ response status
        if (response.status >= 400) {
          const errorMessage = response.data?.message || response.data?.data?.message || "Request failed";
          throw new Error(errorMessage);
        }

        return response;

      } catch (error: any) {
        console.error("Mutation Error:", error);

        if (error.response) {
          const errorMessage = error.response.data?.message ||
            error.response.data?.data?.message ||
            `API Error: ${error.response.status}`;
          throw new Error(errorMessage);
        }

        throw error;
      }
    },
    onSuccess: (data) => {
      console.log("Create juristic mutation success:", data);
      message.success("Invitation created successfully!");

      // Invalidate and refetch invitations list
      queryClient.invalidateQueries({ queryKey: ["juristicInvitations"] });
    },
    onError: (error: any) => {
      console.error("Create juristic mutation error:", error);
      message.error(error.message || "Failed to create invitation");
    },
  });
};

// === DELETE JURISTIC ===
export const useDeleteJuristicMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    retry: 1,
    scope: {
      id: "deleteJuristic",
    },
    mutationFn: async (userId: string) => {
      try {
        console.log("Deleting juristic with ID:", userId);
        const response = await axios.delete(`/team-management/${userId}`);

        if (response.status !== 200) {
          throw new Error(response.data?.message || "Delete failed");
        }

        return response.data;

      } catch (error: any) {
        console.error("Delete Error:", error);

        if (error.response) {
          const errorMessage = error.response.data?.message || `Delete failed: ${error.response.status}`;
          throw new Error(errorMessage);
        }

        throw error;
      }
    },
    onSuccess: (data, userId) => {
      console.log("Delete success:", data);
      message.success("User deleted successfully!");

      // Invalidate juristic list to refresh data
      queryClient.invalidateQueries({ queryKey: ["juristicList"] });
      queryClient.invalidateQueries({ queryKey: ["juristicInvitations"] });
    },
    onError: (error: any) => {
      console.error("Delete mutation error:", error);
      message.error(error.message || "Failed to delete user");
    },
  });
};

// === EDIT JURISTIC ===
export const useEditJuristicMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    retry: 1,
    scope: {
      id: "editJuristic",
    },
    mutationFn: async ({ userId, payload }: { userId: string; payload: any }) => {
      try {
        const apiPayload = {
          givenName: payload.givenName,
          familyName: payload.familyName,
          middleName: payload.middleName || "",
          contact: payload.contact,
          roleId: payload.roleId
        };

        console.log("Edit request:", apiPayload);
        const response = await axios.put(`/team-management/${userId}`, apiPayload);

        if (response.status >= 400) {
          throw new Error(response.data?.message || "Update failed");
        }

        return response.data;

      } catch (error: any) {
        console.error("Edit Error:", error);

        if (error.response) {
          const errorMessage = error.response.data?.message || `Update failed: ${error.response.status}`;
          throw new Error(errorMessage);
        }

        throw error;
      }
    },
    onSuccess: (data, { userId }) => {
      console.log("Edit success:", data);
      message.success("User information updated successfully!");

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["juristicList"] });
      queryClient.invalidateQueries({ queryKey: ["juristicProfile", userId] });
    },
    onError: (error: any) => {
      console.error("Edit mutation error:", error);
      message.error(error.message || "Failed to update user information");
    },
  });
};
