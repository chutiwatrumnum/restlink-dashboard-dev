// ไฟล์: src/utils/qrCodeUtils.ts - Enhanced version with text overlay

import QRCode from 'qrcode';
import dayjs from 'dayjs';

interface QRCodeGenerationOptions {
    size?: number;
    margin?: number;
    color?: {
        dark?: string;
        light?: string;
    };
    errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
}

interface InvitationInfo {
    guestName: string;
    houseAddress: string;
    type: string;
    vehicleLicensePlates: string[];
    authorizedAreas: string[];
    startTime: string;
    expireTime: string;
    code: string;
}

/**
 * Generate QR Code as Data URL
 */
export const generateQRCodeDataURL = async (
    text: string,
    options?: QRCodeGenerationOptions
): Promise<string> => {
    const defaultOptions = {
        width: options?.size || 300,
        margin: options?.margin || 2,
        color: {
            dark: options?.color?.dark || '#000000',
            light: options?.color?.light || '#FFFFFF',
        },
        errorCorrectionLevel: options?.errorCorrectionLevel || 'M',
    };

    try {
        const qrCodeDataURL = await QRCode.toDataURL(text, defaultOptions);
        return qrCodeDataURL;
    } catch (error) {
        console.error('Error generating QR code:', error);
        throw new Error('Failed to generate QR code');
    }
};

/**
 * Create canvas with QR Code and text overlay
 */
export const generateQRCodeWithText = async (
    qrData: string,
    invitationInfo: InvitationInfo,
    options?: QRCodeGenerationOptions
): Promise<string> => {
    try {
        const qrSize = options?.size || 400;
        const margin = 40;
        const textHeight = 280; // เพิ่มความสูงสำหรับข้อมูลเพิ่มเติม
        const canvasWidth = Math.max(qrSize + (margin * 2), 600); // กว้างขั้นต่ำ 600px
        const canvasHeight = qrSize + textHeight + (margin * 2);

        // สร้าง QR Code
        const qrCodeDataURL = await generateQRCodeDataURL(qrData, {
            ...options,
            size: qrSize,
            margin: 0
        });

        // สร้าง Canvas
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;

        // วาดพื้นหลังสีขาว
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        // วาดขอบ
        ctx.strokeStyle = '#E5E5E5';
        ctx.lineWidth = 2;
        ctx.strokeRect(10, 10, canvasWidth - 20, canvasHeight - 20);

        return new Promise((resolve, reject) => {
            const qrImage = new Image();
            qrImage.onload = () => {
                // วาด QR Code ตรงกลาง
                const qrX = (canvasWidth - qrSize) / 2;
                const qrY = margin;
                ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize);

                // ตั้งค่าตำแหน่งเริ่มต้นสำหรับข้อความ
                let textY = qrY + qrSize + 30;

                // วาดเส้นแบ่ง
                ctx.strokeStyle = '#E0E0E0';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(margin, textY);
                ctx.lineTo(canvasWidth - margin, textY);
                ctx.stroke();

                textY += 25;

                // ชื่อแขก (หัวข้อใหญ่)
                ctx.fillStyle = '#000000';
                ctx.font = 'bold 28px Arial, sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(invitationInfo.guestName, canvasWidth / 2, textY);
                textY += 35;

                // ที่อยู่บ้าน
                ctx.font = 'bold 16px Arial, sans-serif';
                ctx.fillStyle = '#333333';
                ctx.textAlign = 'left';
                const leftMargin = 50;
                ctx.fillText('🏠 ที่อยู่:', leftMargin, textY);
                ctx.font = '16px Arial, sans-serif';
                ctx.fillStyle = '#555555';
                ctx.fillText(invitationInfo.houseAddress, leftMargin + 80, textY);
                textY += 25;

                // ประเภท
                ctx.font = 'bold 16px Arial, sans-serif';
                ctx.fillStyle = '#333333';
                ctx.fillText('📋 ประเภท:', leftMargin, textY);
                ctx.font = '16px Arial, sans-serif';
                ctx.fillStyle = '#555555';
                const typeText = invitationInfo.type === 'invitation' ? 'เชิญ' :
                    invitationInfo.type === 'vehicle' ? 'ยานพาหนะ' : invitationInfo.type;
                ctx.fillText(typeText, leftMargin + 80, textY);
                textY += 25;

                // ป้ายทะเบียน (ถ้ามี)
                if (invitationInfo.vehicleLicensePlates.length > 0) {
                    ctx.font = 'bold 16px Arial, sans-serif';
                    ctx.fillStyle = '#333333';
                    ctx.fillText('🚗 ป้ายทะเบียน:', leftMargin, textY);
                    ctx.font = '16px Arial, sans-serif';
                    ctx.fillStyle = '#555555';

                    const vehicleText = invitationInfo.vehicleLicensePlates.length > 2 ?
                        `${invitationInfo.vehicleLicensePlates.slice(0, 2).join(', ')} +${invitationInfo.vehicleLicensePlates.length - 2}` :
                        invitationInfo.vehicleLicensePlates.join(', ');

                    ctx.fillText(vehicleText, leftMargin + 130, textY);
                    textY += 25;
                }

                // พื้นที่ที่ได้รับอนุญาต (ถ้ามี)
                if (invitationInfo.authorizedAreas.length > 0) {
                    ctx.font = 'bold 16px Arial, sans-serif';
                    ctx.fillStyle = '#333333';
                    ctx.fillText('🗺️ พื้นที่อนุญาต:', leftMargin, textY);
                    textY += 20;

                    ctx.font = '14px Arial, sans-serif';
                    ctx.fillStyle = '#666666';

                    // แสดงพื้นที่สูงสุด 3 รายการ
                    const maxAreas = 3;
                    const displayAreas = invitationInfo.authorizedAreas.slice(0, maxAreas);

                    for (let i = 0; i < displayAreas.length; i++) {
                        ctx.fillText(`• ${displayAreas[i]}`, leftMargin + 20, textY);
                        textY += 18;
                    }

                    if (invitationInfo.authorizedAreas.length > maxAreas) {
                        ctx.fillText(`• และอีก ${invitationInfo.authorizedAreas.length - maxAreas} พื้นที่`, leftMargin + 20, textY);
                        textY += 20;
                    } else {
                        textY += 5;
                    }
                }

                // เส้นแบ่งก่อนวันที่
                ctx.strokeStyle = '#E0E0E0';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(margin, textY);
                ctx.lineTo(canvasWidth - margin, textY);
                ctx.stroke();
                textY += 20;

                // วันที่ (จัดตรงกลาง)
                ctx.textAlign = 'center';
                ctx.font = 'bold 16px Arial, sans-serif';
                ctx.fillStyle = '#444444';

                // วันเริ่มต้น
                const startDate = dayjs(invitationInfo.startTime).format('DD/MM/YYYY HH:mm');
                ctx.fillText(`⏰ เริ่มใช้งาน: ${startDate}`, canvasWidth / 2, textY);
                textY += 25;

                // วันหมดอายุ
                const expireDate = dayjs(invitationInfo.expireTime).format('DD/MM/YYYY HH:mm');
                const isExpired = dayjs(invitationInfo.expireTime).isBefore(dayjs());
                ctx.fillStyle = isExpired ? '#ff4d4f' : '#444444';
                ctx.fillText(`⏳ หมดอายุ: ${expireDate}`, canvasWidth / 2, textY);

                // แปลงเป็น Data URL
                const finalDataURL = canvas.toDataURL('image/png', 0.9);
                resolve(finalDataURL);
            };

            qrImage.onerror = () => {
                reject(new Error('Failed to load QR Code image'));
            };

            qrImage.src = qrCodeDataURL;
        });

    } catch (error) {
        console.error('Error generating QR code with text:', error);
        throw error;
    }
};

/**
 * Download QR Code with text overlay
 */
export const downloadQRCodeWithText = async (
    qrData: string,
    invitationInfo: InvitationInfo,
    fileName: string,
    options?: QRCodeGenerationOptions
): Promise<void> => {
    try {
        console.log('🎨 Generating QR Code with text overlay...');

        const enhancedQRDataURL = await generateQRCodeWithText(qrData, invitationInfo, {
            size: 450,
            margin: 2,
            ...options
        });

        // Create download link
        const link = document.createElement('a');
        link.href = enhancedQRDataURL;
        link.download = `${fileName}.png`;

        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        console.log(`✅ Enhanced QR Code downloaded: ${fileName}.png`);
    } catch (error) {
        console.error('Error downloading enhanced QR code:', error);
        throw error;
    }
};

/**
 * Generate VMS Invitation QR Code data
 */
export const generateInvitationQRData = (invitationCode: string, baseUrl?: string): string => {
    if (baseUrl) {
        return `${baseUrl}/invitation/${invitationCode}`;
    } else {
        return invitationCode;
    }
};

/**
 * Download VMS Invitation QR Code with enhanced information
 */
export const downloadInvitationQRCode = async (
    invitationCode: string,
    guestName: string,
    houseAddress: string,
    type: string,
    vehicleLicensePlates: string[],
    authorizedAreas: string[],
    startTime: string,
    expireTime: string,
    options?: QRCodeGenerationOptions
): Promise<void> => {
    try {
        // สร้าง QR data
        const qrData = generateInvitationQRData(invitationCode);

        // สร้างข้อมูลบัตรเชิญ
        const invitationInfo: InvitationInfo = {
            guestName,
            houseAddress,
            type,
            vehicleLicensePlates,
            authorizedAreas,
            startTime,
            expireTime,
            code: invitationCode
        };

        // สร้างชื่อไฟล์
        const sanitizedGuestName = guestName.replace(/[^a-zA-Z0-9ก-๙]/g, '_');
        const shortDate = dayjs(startTime).format('DDMM');
        const fileName = `QR_${sanitizedGuestName}_${shortDate}_${invitationCode.substring(0, 8)}`;

        // Download QR Code พร้อมข้อความ
        await downloadQRCodeWithText(qrData, invitationInfo, fileName, options);

        console.log(`✅ Enhanced Invitation QR Code downloaded for: ${guestName}`);
    } catch (error) {
        console.error('Error downloading enhanced invitation QR code:', error);
        throw error;
    }
};

// Export เดิมเพื่อ backward compatibility
export const downloadQRCode = async (
    text: string,
    fileName: string,
    options?: QRCodeGenerationOptions
): Promise<void> => {
    try {
        const qrCodeDataURL = await generateQRCodeDataURL(text, options);

        const link = document.createElement('a');
        link.href = qrCodeDataURL;
        link.download = `${fileName}.png`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        console.log(`✅ QR Code downloaded: ${fileName}.png`);
    } catch (error) {
        console.error('Error downloading QR code:', error);
        throw error;
    }
};