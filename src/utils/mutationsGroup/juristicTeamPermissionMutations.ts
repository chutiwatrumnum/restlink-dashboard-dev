// src/utils/mutationsGroup/juristicTeamPermissionMutations.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { message } from "antd";
import { PermissionType } from "../../stores/interfaces/Common";

// ใช้ interface ที่มีอยู่แล้วและเพิ่มเฉพาะ id
export interface UpdateJuristicPermissionPayload extends PermissionType {
    id: number;
}

// Update juristic team permissions
export const useUpdateJuristicTeamPermissionsMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        retry: 1,
        scope: { id: "updateJuristicTeamPermissions" },
        mutationFn: async (payload: UpdateJuristicPermissionPayload[]) => {
            try {
                const url = `/permission/dashboard`;
                const response = await axios.put(url, payload);

                if (response.status >= 400) {
                    const errorMessage = response.data?.message || "Update failed";
                    throw new Error(errorMessage);
                }

                return response.data;
            } catch (error: any) {
                if (error.response) {
                    const errorMessage = error.response.data?.message ||
                        `Update failed: ${error.response.status}`;
                    throw new Error(errorMessage);
                }
                throw error;
            }
        },
        onSuccess: (data) => {
            message.success("Permissions updated successfully!");
            // Invalidate and refetch permissions data
            queryClient.invalidateQueries({ queryKey: ["juristicTeamPermissions"] });
        },
        onError: (error: any) => {
            message.error(error.message || "Failed to update permissions");
        },
    });
};