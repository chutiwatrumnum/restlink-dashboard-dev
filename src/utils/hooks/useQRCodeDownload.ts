// ไฟล์: src/utils/hooks/useQRCodeDownload.ts - Updated with text overlay

import { useState } from "react";
import { message } from "antd";
import { downloadQRCodeWithText, generateInvitationQRData } from "../qrCodeUtils";
import { InvitationRecord } from "../../stores/interfaces/Invitation";
import dayjs from "dayjs";

export const useQRCodeDownload = () => {
    const [isDownloading, setIsDownloading] = useState(false);

    const downloadQRCode = async (invitation: InvitationRecord) => {
        if (!invitation.code || !invitation.code.trim()) {
            message.error("ไม่พบรหัสบัตรเชิญสำหรับการสร้าง QR Code");
            return;
        }

        setIsDownloading(true);
        try {
            console.log('📱 Downloading enhanced QR Code for invitation:', invitation.id);

            const qrData = generateInvitationQRData(invitation.code);

            const invitationInfo = {
                guestName: invitation.guest_name,
                houseAddress: invitation.house_address || 'ไม่ระบุที่อยู่',
                type: invitation.type,
                vehicleLicensePlates: invitation.vehicle_license_plates || [],
                authorizedAreas: invitation.authorized_area_names || [],
                startTime: invitation.start_time,
                expireTime: invitation.expire_time,
                code: invitation.code
            };

            // สร้างชื่อไฟล์
            const sanitizedGuestName = invitation.guest_name.replace(/[^a-zA-Z0-9ก-๙]/g, '_');
            const shortDate = dayjs(invitation.start_time).format('DDMM');
            const fileName = `QR_${sanitizedGuestName}_${shortDate}_${invitation.code.substring(0, 8)}`;

            await downloadQRCodeWithText(qrData, invitationInfo, fileName, {
                size: 500,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF',
                },
                errorCorrectionLevel: 'M'
            });

            message.success(`ดาวน์โหลด QR Code สำหรับ ${invitation.guest_name} เรียบร้อย!`);
        } catch (error: any) {
            console.error('❌ Enhanced QR Code download error:', error);

            let errorMessage = "ไม่สามารถดาวน์โหลด QR Code ได้";
            if (error.message) {
                errorMessage = error.message;
            }

            message.error(errorMessage);
        } finally {
            setIsDownloading(false);
        }
    };

    return {
        downloadQRCode,
        isDownloading
    };
};