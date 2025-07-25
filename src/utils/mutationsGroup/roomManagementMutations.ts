// utils/mutationsGroup/roomManagementMutations.ts

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AddUserFormData } from "../../stores/interfaces/Management";
import axios from "axios";

// Add new user to room
export const postAddUserToRoomMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        retry: 2,
        scope: {
            id: "addUserToRoom",
        },
        mutationFn: (payload: AddUserFormData & { unitId: number }) => {
            return axios.post(`/room-management/user`, payload);
        },
        onError: (error) => {
            console.warn("Error adding user to room:", error);
        },
        onSuccess: (data, variables) => {
            console.log("User added successfully:", data);

            // Invalidate relevant queries to refresh data
            queryClient.invalidateQueries({
                queryKey: ["unitList"]
            });

            queryClient.invalidateQueries({
                queryKey: ["memberList", variables.unitId]
            });
        },
    });
};

// Update user in room
export const putUpdateUserInRoomMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        retry: 2,
        scope: {
            id: "updateUserInRoom",
        },
        mutationFn: (payload: AddUserFormData & { userId: number; unitId: number }) => {
            return axios.put(`/room-management/user/${payload.userId}`, payload);
        },
        onError: (error) => {
            console.warn("Error updating user in room:", error);
        },
        onSuccess: (data, variables) => {
            console.log("User updated successfully:", data);

            // Invalidate relevant queries to refresh data
            queryClient.invalidateQueries({
                queryKey: ["unitList"]
            });

            queryClient.invalidateQueries({
                queryKey: ["memberList", variables.unitId]
            });
        },
    });
};

// Remove user from room
export const deleteUserFromRoomMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        retry: 2,
        scope: {
            id: "removeUserFromRoom",
        },
        mutationFn: (payload: { userId: number; unitId: number }) => {
            return axios.delete(`/room-management/user/${payload.userId}`);
        },
        onError: (error) => {
            console.warn("Error removing user from room:", error);
        },
        onSuccess: (data, variables) => {
            console.log("User removed successfully:", data);

            // Invalidate relevant queries to refresh data
            queryClient.invalidateQueries({
                queryKey: ["unitList"]
            });

            queryClient.invalidateQueries({
                queryKey: ["memberList", variables.unitId]
            });
        },
    });
};

// Search users (for adding existing users)
export const getSearchUsersMutation = () => {
    return useMutation({
        retry: 2,
        scope: {
            id: "searchUsers",
        },
        mutationFn: (payload: { searchTerm: string; role?: string }) => {
            return axios.get(`/room-management/search-users`, {
                params: payload
            });
        },
        onError: (error) => {
            console.warn("Error searching users:", error);
        },
        onSuccess: (data) => {
            console.log("Search results:", data);
        },
    });
};

// Assign existing user to room
export const postAssignUserToRoomMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        retry: 2,
        scope: {
            id: "assignUserToRoom",
        },
        mutationFn: (payload: { userId: number; unitId: number; role: string }) => {
            return axios.post(`/room-management/assign-user`, payload);
        },
        onError: (error) => {
            console.warn("Error assigning user to room:", error);
        },
        onSuccess: (data, variables) => {
            console.log("User assigned successfully:", data);

            // Invalidate relevant queries to refresh data
            queryClient.invalidateQueries({
                queryKey: ["unitList"]
            });

            queryClient.invalidateQueries({
                queryKey: ["memberList", variables.unitId]
            });
        },
    });
};