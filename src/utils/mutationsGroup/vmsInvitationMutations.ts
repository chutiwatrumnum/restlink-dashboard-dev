// ไฟล์: src/utils/mutationsGroup/vmsInvitationMutations.ts - Final Schema Handling

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import axiosVMS from "../../configs/axiosVMS";

// Interface สำหรับ Vehicle Object (POST format)
interface VehicleData {
    license_plate: string;
    area_code: string;
}

// Interface สำหรับ Create/Edit Invitation
export interface VMSInvitationPayload {
    guest_name: string;
    start_time: string;
    expire_time: string;
    authorized_area: string[];
    house_id: string;
    type: string;
    vehicle_id?: string[];  // สำหรับ UI
    vehicle?: VehicleData[];  // สำหรับ POST API
    note?: string;
    active: boolean;
}

export interface VMSInvitationEditPayload extends VMSInvitationPayload {
    id: string;
}

// Helper function to convert vehicle IDs to vehicle objects
const convertVehicleIdsToObjects = async (vehicleIds: string[]): Promise<VehicleData[]> => {
    if (!vehicleIds || vehicleIds.length === 0) {
        return [];
    }

    try {
        const vehicleObjects: VehicleData[] = [];

        for (const vehicleId of vehicleIds) {
            try {
                const response = await axiosVMS.get(`/api/collections/vehicle/records/${vehicleId}`);
                if (response.data) {
                    vehicleObjects.push({
                        license_plate: response.data.license_plate,
                        area_code: response.data.area_code || "th-11"
                    });
                }
            } catch (error) {
                continue;
            }
        }

        return vehicleObjects;
    } catch (error) {
        return [];
    }
};

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
                // รับ vehicle_id จาก form
                const vehicleIds = (payload as any).vehicle_id || [];

                // แปลง vehicle IDs เป็น vehicle objects สำหรับ POST API
                const vehicleObjects = await convertVehicleIdsToObjects(vehicleIds);

                // สร้าง payload สำหรับ POST API (format ที่ต้องการ)
                const apiPayload = {
                    guest_name: payload.guest_name,
                    house_id: payload.house_id,
                    type: payload.type || "invitation",
                    start_time: payload.start_time,
                    expire_time: payload.expire_time,
                    authorized_area: payload.authorized_area || [],
                    vehicle: vehicleObjects, // POST format: vehicle array
                    note: payload.note || "",
                    active: payload.active
                };

                // ลบ fields ที่เป็น empty
                if (apiPayload.vehicle.length === 0) {
                    delete apiPayload.vehicle;
                }
                if (!apiPayload.note) {
                    delete apiPayload.note;
                }

                const response = await axiosVMS.post(
                    `/api/collections/invitation/records`,
                    apiPayload
                );

                // API Response จะมี license_plate และ area_code แยกออกมา
                // เราต้องแปลงกลับเป็น vehicle_id สำหรับ UI
                if (response.data) {
                    // สร้าง vehicle_id จาก license_plate ที่ส่งไป
                    // เนื่องจาก API ไม่ return vehicle IDs กลับมา
                    response.data.vehicle_id = vehicleIds;
                }

                if (response.status >= 400) {
                    throw new Error("Create invitation failed");
                }

                return response;
            } catch (error: any) {
                throw new Error(error.message || "Failed to create invitation");
            }
        },
        onSuccess: () => {
            message.success("Invitation created successfully!");
            queryClient.invalidateQueries({ queryKey: ["vmsInvitations"] });
        },
        onError: (error: any) => {
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
                const { id, ...updateData } = payload;

                // รับ vehicle_id จาก form
                const vehicleIds = (updateData as any).vehicle_id || [];

                // แปลง vehicle IDs เป็น vehicle objects สำหรับ PATCH API
                const vehicleObjects = await convertVehicleIdsToObjects(vehicleIds);

                // สร้าง payload สำหรับ PATCH API (format ที่ต้องการ)
                const apiPayload = {
                    guest_name: updateData.guest_name,
                    house_id: updateData.house_id,
                    type: updateData.type || "invitation",
                    start_time: updateData.start_time,
                    expire_time: updateData.expire_time,
                    authorized_area: updateData.authorized_area || [],
                    vehicle: vehicleObjects, // PATCH format: vehicle array
                    note: updateData.note || "",
                    active: updateData.active
                };

                // ลบ fields ที่เป็น empty
                if (apiPayload.vehicle.length === 0) {
                    delete apiPayload.vehicle;
                }
                if (!apiPayload.note) {
                    delete apiPayload.note;
                }

                const response = await axiosVMS.patch(
                    `/api/collections/invitation/records/${id}`,
                    apiPayload
                );

                // API Response จะมี license_plate และ area_code แยกออกมา
                // เราต้องแปลงกลับเป็น vehicle_id สำหรับ UI
                if (response.data) {
                    response.data.vehicle_id = vehicleIds;
                }

                if (response.status >= 400) {
                    throw new Error("Update invitation failed");
                }

                return response;
            } catch (error: any) {
                throw new Error(error.message || "Failed to update invitation");
            }
        },
        onSuccess: (data, payload) => {
            message.success("Invitation updated successfully!");
            queryClient.invalidateQueries({ queryKey: ["vmsInvitations"] });
            queryClient.invalidateQueries({
                queryKey: ["vmsInvitation", payload.id],
            });
        },
        onError: (error: any) => {
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
                const response = await axiosVMS.delete(
                    `/api/collections/invitation/records/${invitationId}`
                );

                if (response.status >= 400) {
                    throw new Error("Delete invitation failed");
                }

                return response;
            } catch (error: any) {
                throw new Error(error.message || "Failed to delete invitation");
            }
        },
        onSuccess: () => {
            message.success("Invitation deleted successfully!");
            queryClient.invalidateQueries({ queryKey: ["vmsInvitations"] });
        },
        onError: (error: any) => {
            message.error(error.message || "Failed to delete invitation");
        },
    });
};