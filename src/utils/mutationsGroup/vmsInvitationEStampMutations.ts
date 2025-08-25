import { useMutation, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import axiosVMS from "../../configs/axiosVMS";

// === E-STAMP VMS INVITATION ===
export const useEStampVMSInvitationMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ['eStampVMSInvitation'],
        retry: false,
        mutationFn: async (invitationId: string) => {
            console.log('📮 E-Stamping VMS Invitation:', invitationId);

            const response = await axiosVMS.post(
                `/api/collections/invitation/e-stamp/${invitationId}`
            );

            console.log('✅ E-Stamp API Response:', response.data);
            return response.data;
        },
        onSuccess: (data, invitationId) => {
            console.log('✅ E-Stamp invitation success');
            message.success("บัตรเชิญได้รับการประทับตราเรียบร้อย!");

            // Refresh data
            queryClient.invalidateQueries({
                queryKey: ["vmsInvitations"]
            });
            queryClient.invalidateQueries({
                queryKey: ["vmsInvitation", invitationId],
            });
        },
        onError: (error: any) => {
            console.error('❌ E-Stamp invitation error:', error);

            let errorMessage = "ไม่สามารถประทับตราบัตรเชิญได้";

            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.message) {
                errorMessage = error.message;
            }

            message.error(errorMessage);
        }
    });
};