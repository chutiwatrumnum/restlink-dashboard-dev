// ไฟล์: src/utils/mutationsGroup/qrCodeMutations.ts

import { useMutation } from "@tanstack/react-query";
import { message } from "antd";
import { downloadInvitationQRCode } from "../qrCodeUtils";
import { InvitationRecord } from "../../stores/interfaces/Invitation";

interface QRCodeDownloadPayload {
    invitation: InvitationRecord;
    options?: {
        size?: number;
        includeDetails?: boolean;
    };
}

export const useDownloadQRCodeMutation = () => {
    return useMutation({
        mutationKey: ['downloadQRCode'],
        retry: false,
        mutationFn: async ({ invitation, options }: QRCodeDownloadPayload) => {
            console.log('📱 Downloading QR Code for invitation:', invitation.id);

            // ตรวจสอบว่ามี code หรือไม่
            if (!invitation.code || !invitation.code.trim()) {
                throw new Error('ไม่พบรหัสบัตรเชิญ (Invitation code not found)');
            }

            // ตั้งค่า options สำหรับ QR Code
            const qrOptions = {
                size: options?.size || 300,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF',
                },
                errorCorrectionLevel: 'M' as const,
            };

            // Download QR Code
            await downloadInvitationQRCode(
                invitation.code,
                invitation.guest_name,
                qrOptions
            );

            return {
                success: true,
                invitationId: invitation.id,
                guestName: invitation.guest_name,
                code: invitation.code
            };
        },
        onSuccess: (data) => {
            console.log('✅ QR Code download success:', data);
            message.success(`ดาวน์โหลด QR Code สำหรับ ${data.guestName} เรียบร้อย!`);
        },
        onError: (error: any) => {
            console.error('❌ QR Code download error:', error);

            let errorMessage = "ไม่สามารถดาวน์โหลด QR Code ได้";

            if (error.message) {
                errorMessage = error.message;
            }

            message.error(errorMessage);
        }
    });
};