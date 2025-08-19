// ไฟล์: src/utils/mutationsGroup/vmsInvitationMutations.ts

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import axiosVMS from "../../configs/axiosVMS";

// Interface สำหรับ Create/Edit Invitation
export interface VMSInvitationPayload {
    guest_name: string;
    start_time: string; // ISO string format
    expire_time: string; // ISO string format  
    authorized_area: string[];
    house_id: string;
    type: string;
    vehicle_id?: string[];
    note?: string;
    active: boolean;
}

export interface VMSInvitationEditPayload extends VMSInvitationPayload {
    id: string;
}

// === CREATE VMS INVITATION ===
export const useCreateVMSInvitationMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        retry: 2,
        scope: {
            id: "createVMSInvitation",
        },
        mutationFn: async (payload: VMSInvitationPayload) => {
            try {
                console.log("🔄 Creating VMS Invitation:", payload);

                const response = await axiosVMS.post(
                    `/api/collections/invitation/records`,
                    payload
                );

                if (response.status >= 400) {
                    const errorMessage =
                        response.data?.message ||
                        response.data?.data?.message ||
                        "Create invitation failed";
                    throw new Error(errorMessage);
                }

                console.log("✅ VMS Invitation created successfully:", response.data);
                return response;
            } catch (error: any) {
                console.error("❌ Create VMS Invitation Error:", error);

                if (error.response) {
                    const errorMessage =
                        error.response.data?.message ||
                        error.response.data?.data?.message ||
                        `API Error: ${error.response.status}`;
                    throw new Error(errorMessage);
                }

                throw error;
            }
        },
        onSuccess: (data) => {
            console.log("Create VMS invitation mutation success:", data);
            message.success("Invitation created successfully!");

            // Invalidate and refetch invitations list
            queryClient.invalidateQueries({ queryKey: ["vmsInvitations"] });
        },
        onError: (error: any) => {
            console.error("Create VMS invitation mutation error:", error);
            message.error(error.message || "Failed to create invitation");
        },
    });
};

// === UPDATE VMS INVITATION ===
export const useUpdateVMSInvitationMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        retry: 2,
        scope: {
            id: "updateVMSInvitation",
        },
        mutationFn: async (payload: VMSInvitationEditPayload) => {
            try {
                console.log("🔄 Updating VMS Invitation:", payload);

                const { id, ...updateData } = payload;

                const response = await axiosVMS.patch(
                    `/api/collections/invitation/records/${id}`,
                    updateData
                );

                if (response.status >= 400) {
                    const errorMessage =
                        response.data?.message ||
                        response.data?.data?.message ||
                        "Update invitation failed";
                    throw new Error(errorMessage);
                }

                console.log("✅ VMS Invitation updated successfully:", response.data);
                return response;
            } catch (error: any) {
                console.error("❌ Update VMS Invitation Error:", error);

                if (error.response) {
                    const errorMessage =
                        error.response.data?.message ||
                        error.response.data?.data?.message ||
                        `API Error: ${error.response.status}`;
                    throw new Error(errorMessage);
                }

                throw error;
            }
        },
        onSuccess: (data, payload) => {
            console.log("Update VMS invitation mutation success:", data);
            message.success("Invitation updated successfully!");

            // Invalidate and refetch invitations list
            queryClient.invalidateQueries({ queryKey: ["vmsInvitations"] });
            queryClient.invalidateQueries({
                queryKey: ["vmsInvitation", payload.id],
            });
        },
        onError: (error: any) => {
            console.error("Update VMS invitation mutation error:", error);
            message.error(error.message || "Failed to update invitation");
        },
    });
};

// === DELETE VMS INVITATION ===
export const useDeleteVMSInvitationMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        retry: 1,
        scope: {
            id: "deleteVMSInvitation",
        },
        mutationFn: async (invitationId: string) => {
            try {
                console.log("🗑️ Deleting VMS Invitation ID:", invitationId);

                const response = await axiosVMS.delete(
                    `/api/collections/invitation/records/${invitationId}`
                );

                if (response.status >= 400) {
                    const errorMessage =
                        response.data?.message ||
                        response.data?.data?.message ||
                        "Delete invitation failed";
                    throw new Error(errorMessage);
                }

                console.log("✅ VMS Invitation deleted successfully");
                return response;
            } catch (error: any) {
                console.error("❌ Delete VMS Invitation Error:", error);

                if (error.response) {
                    const errorMessage =
                        error.response.data?.message ||
                        error.response.data?.data?.message ||
                        `API Error: ${error.response.status}`;
                    throw new Error(errorMessage);
                }

                throw error;
            }
        },
        onSuccess: (data, invitationId) => {
            console.log("Delete VMS invitation mutation success");
            message.success("Invitation deleted successfully!");

            // Invalidate and refetch invitations list
            queryClient.invalidateQueries({ queryKey: ["vmsInvitations"] });
            queryClient.invalidateQueries({
                queryKey: ["vmsInvitation", invitationId],
            });
        },
        onError: (error: any) => {
            console.error("Delete VMS invitation mutation error:", error);
            message.error(error.message || "Failed to delete invitation");
        },
    });
};