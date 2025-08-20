// ไฟล์: src/utils/mutationsGroup/vmsInvitationMutations.ts - Working Implementation

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import axiosVMS from "../../configs/axiosVMS";

// Interface ตาม API spec จริง
export interface VMSInvitationPayload {
    guest_name: string;
    start_time: string;
    expire_time: string;
    authorized_area: string[];
    house_id: string;
    type?: string;
    note?: string;
    vehicles?: Array<{
        license_plate: string;
        area_code: string;
    }>;
}

export interface VMSInvitationEditPayload extends VMSInvitationPayload {
    id: string;
}

// === CREATE VMS INVITATION ===
export const useCreateVMSInvitationMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ['createVMSInvitation'],
        retry: false,
        mutationFn: async (payload: VMSInvitationPayload) => {
            console.log('🚀 Creating VMS Invitation');
            console.log('📥 Payload received:', payload);

            // สร้าง payload ตาม API spec ที่เห็นในภาพ
            const apiPayload: any = {
                guest_name: payload.guest_name,
                start_time: payload.start_time,
                expire_time: payload.expire_time,
                authorized_area: payload.authorized_area || [],
                house_id: payload.house_id,
                type: payload.type || "invitation"
            };

            // เพิ่ม note ถ้ามี
            if (payload.note && payload.note.trim()) {
                apiPayload.note = payload.note.trim();
            }

            // เพิ่ม vehicles ถ้ามี (ตามรูปแบบในภาพ)
            if (payload.vehicles && payload.vehicles.length > 0) {
                apiPayload.vehicles = payload.vehicles;
            }

            console.log('📤 Final API payload:', JSON.stringify(apiPayload, null, 2));

            // เรียก API
            const response = await axiosVMS.post(
                '/api/collections/invitation/records',
                apiPayload
            );

            console.log('✅ API Response:', response.data);
            return response.data;
        },
        onSuccess: (data) => {
            console.log('✅ Create invitation success');
            message.success("บันทึกคำเชิญสำเร็จ!");

            // Refresh data
            queryClient.invalidateQueries({
                queryKey: ["vmsInvitations"]
            });
        },
        onError: (error: any) => {
            console.error('❌ Create invitation error:', error);

            let errorMessage = "ไม่สามารถสร้างคำเชิญได้";

            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.message) {
                errorMessage = error.message;
            }

            message.error(errorMessage);
        }
    });
};

// === UPDATE VMS INVITATION ===
export const useUpdateVMSInvitationMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ['updateVMSInvitation'],
        retry: false,
        mutationFn: async (payload: VMSInvitationEditPayload) => {
            console.log('🔄 Updating VMS Invitation');

            const { id, ...updateData } = payload;

            const apiPayload: any = {
                guest_name: updateData.guest_name,
                start_time: updateData.start_time,
                expire_time: updateData.expire_time,
                authorized_area: updateData.authorized_area || [],
                house_id: updateData.house_id,
                type: updateData.type || "invitation"
            };

            if (updateData.note && updateData.note.trim()) {
                apiPayload.note = updateData.note.trim();
            }

            if (updateData.vehicles && updateData.vehicles.length > 0) {
                apiPayload.vehicles = updateData.vehicles;
            }

            console.log('📤 Update API payload:', JSON.stringify(apiPayload, null, 2));

            const response = await axiosVMS.patch(
                `/api/collections/invitation/records/${id}`,
                apiPayload
            );

            console.log('✅ Update API Response:', response.data);
            return response.data;
        },
        onSuccess: (data, variables) => {
            console.log('✅ Update invitation success');
            message.success("อัปเดตคำเชิญสำเร็จ!");

            queryClient.invalidateQueries({
                queryKey: ["vmsInvitations"]
            });
            queryClient.invalidateQueries({
                queryKey: ["vmsInvitation", variables.id],
            });
        },
        onError: (error: any) => {
            console.error('❌ Update invitation error:', error);

            let errorMessage = "ไม่สามารถอัปเดตคำเชิญได้";

            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.message) {
                errorMessage = error.message;
            }

            message.error(errorMessage);
        }
    });
};

// === DELETE VMS INVITATION ===
export const useDeleteVMSInvitationMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ['deleteVMSInvitation'],
        retry: false,
        mutationFn: async (invitationId: string) => {
            console.log('🗑️ Deleting VMS Invitation:', invitationId);

            const response = await axiosVMS.delete(
                `/api/collections/invitation/records/${invitationId}`
            );

            console.log('✅ Delete API Response:', response.data);
            return response.data;
        },
        onSuccess: () => {
            console.log('✅ Delete invitation success');
            message.success("ลบคำเชิญสำเร็จ!");

            queryClient.invalidateQueries({
                queryKey: ["vmsInvitations"]
            });
        },
        onError: (error: any) => {
            console.error('❌ Delete invitation error:', error);

            let errorMessage = "ไม่สามารถลบคำเชิญได้";

            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.message) {
                errorMessage = error.message;
            }

            message.error(errorMessage);
        }
    });
};