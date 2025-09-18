// src/utils/queriesGroup/juristicTeamPermissionQueries.ts
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { PermissionType } from "../../stores/interfaces/Common";

// ใช้ interface ที่มีอยู่แล้วและเพิ่มเฉพาะส่วนที่ต้องการ
export interface JuristicPermissionItem extends PermissionType {
    id: number;
    nameCode: string;
    lock?: boolean;
}

export interface JuristicRolePermissions {
    roleManageCode: string;
    permissions: JuristicPermissionItem[];
}

export interface JuristicPermissionDashboardResponse {
    statusCode: number;
    result: {
        total: number;
        data: JuristicRolePermissions[];
    };
}

// Service function to get juristic permissions dashboard
const getJuristicTeamPermissions = async (): Promise<JuristicPermissionDashboardResponse> => {
    try {
        const url = `/permission/dashboard/juristic-permission`;
        const response = await axios.get<JuristicPermissionDashboardResponse>(url);
        return response.data;
    } catch (error: any) {
        throw error;
    }
};

// Query hook
export const getJuristicTeamPermissionsQuery = () => {
    return useQuery({
        queryKey: ["juristicTeamPermissions"],
        queryFn: getJuristicTeamPermissions,
        retry: 2,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        staleTime: 5 * 60 * 1000, // 5 minutes
        cacheTime: 10 * 60 * 1000, // 10 minutes
    });
};