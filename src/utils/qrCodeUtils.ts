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
        const qrSize = options?.size || 380;
        const margin = 30;

        // คำนวณความสูงแบบไดนามิก
        let baseTextHeight = 280; // ความสูงพื้นฐาน

        // เพิ่มความสูงตามจำนวนพื้นที่
        if (invitationInfo.authorizedAreas.length > 0) {
            const areasPerColumn = Math.ceil(invitationInfo.authorizedAreas.length / 3); // 3 คอลัมน์
            baseTextHeight += (areasPerColumn * 22) + 40;
        }

        // เพิ่มความสูงสำหรับป้ายทะเบียน
        if (invitationInfo.vehicleLicensePlates.length > 0) {
            const vehiclesPerColumn = Math.ceil(invitationInfo.vehicleLicensePlates.length / 3); // 3 คอลัมน์
            baseTextHeight += (vehiclesPerColumn * 22) + 40;
        }

        const canvasWidth = 600; // ขนาดคงที่เพื่อสมดุล
        const canvasHeight = qrSize + baseTextHeight + (margin * 2) + 20;

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

        // วาดขอบธรรมดา
        ctx.strokeStyle = '#E0E0E0';
        ctx.lineWidth = 1;
        ctx.strokeRect(15, 15, canvasWidth - 30, canvasHeight - 30);

        return new Promise((resolve, reject) => {
            const qrImage = new Image();
            qrImage.onload = () => {
                // วาด QR Code ตรงกลาง
                const qrX = (canvasWidth - qrSize) / 2;
                const qrY = margin + 10;
                ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize);

                // ตั้งค่าตำแหน่งเริ่มต้นสำหรับข้อความ (ใต้ QR Code)
                let textY = qrY + qrSize + 30;

                // จัดเรียงข้อมูลแบบ 2 คอลัมน์
                const leftColumn = 60;
                const rightColumn = canvasWidth / 2 + 20;
                const lineHeight = 25;

                // คอลัมน์ซ้าย - วันเริ่มใช้งาน
                ctx.textAlign = 'left';
                ctx.font = 'bold 14px Arial, sans-serif';
                ctx.fillStyle = '#333333';
                const startDate = dayjs(invitationInfo.startTime).format('DD/MM/YYYY HH:mm');
                ctx.fillText(`start : ${startDate}`, leftColumn, textY);

                // คอลัมน์ขวา - วันหมดอายุ
                const expireDate = dayjs(invitationInfo.expireTime).format('DD/MM/YYYY HH:mm');
                ctx.fillText(`expire : ${expireDate}`, rightColumn, textY);
                textY += lineHeight;

                // คอลัมน์ซ้าย - ชื่อแขก
                ctx.fillText(`guest name : ${invitationInfo.guestName}`, leftColumn, textY);

                // คอลัมน์ขวา - ที่อยู่
                ctx.fillText(`address : ${invitationInfo.houseAddress}`, rightColumn, textY);
                textY += lineHeight;

                // คอลัมน์ซ้าย - ประเภท
                const typeText = invitationInfo.type === 'invitation' ? 'เชิญ' :
                    invitationInfo.type === 'vehicle' ? 'ยานพาหนะ' : invitationInfo.type;
                ctx.fillText(`type : ${invitationInfo.type}`, leftColumn, textY);
                textY += lineHeight + 15;

                // พื้นที่ที่ได้รับอนุญาต
                if (invitationInfo.authorizedAreas.length > 0) {
                    // หัวข้อ
                    ctx.font = 'bold 16px Arial, sans-serif';
                    ctx.fillStyle = '#333333';
                    ctx.fillText('authorized areas :', leftColumn, textY);
                    textY += 25;

                    ctx.font = '14px Arial, sans-serif';
                    ctx.fillStyle = '#333333';

                    // แบ่งเป็น 3 คอลัมน์
                    const col1X = leftColumn;
                    const col2X = leftColumn + 170;
                    const col3X = leftColumn + 340;

                    const itemsPerColumn = Math.ceil(invitationInfo.authorizedAreas.length / 3);

                    // คอลัมน์ที่ 1
                    let col1Y = textY;
                    for (let i = 0; i < itemsPerColumn && i < invitationInfo.authorizedAreas.length; i++) {
                        ctx.fillText(`• ${invitationInfo.authorizedAreas[i]}`, col1X, col1Y);
                        col1Y += 22;
                    }

                    // คอลัมน์ที่ 2
                    let col2Y = textY;
                    for (let i = itemsPerColumn; i < itemsPerColumn * 2 && i < invitationInfo.authorizedAreas.length; i++) {
                        ctx.fillText(`• ${invitationInfo.authorizedAreas[i]}`, col2X, col2Y);
                        col2Y += 22;
                    }

                    // คอลัมน์ที่ 3
                    let col3Y = textY;
                    for (let i = itemsPerColumn * 2; i < invitationInfo.authorizedAreas.length; i++) {
                        ctx.fillText(`• ${invitationInfo.authorizedAreas[i]}`, col3X, col3Y);
                        col3Y += 22;
                    }

                    textY += (itemsPerColumn * 22) + 20;
                }

                // ป้ายทะเบียน (ถ้ามี)
                if (invitationInfo.vehicleLicensePlates.length > 0) {
                    // หัวข้อ
                    ctx.font = 'bold 16px Arial, sans-serif';
                    ctx.fillStyle = '#333333';
                    ctx.fillText('license plates :', leftColumn, textY);
                    textY += 25;

                    ctx.font = '14px Arial, sans-serif';
                    ctx.fillStyle = '#333333';

                    // แบ่งเป็น 3 คอลัมน์
                    const col1X = leftColumn;
                    const col2X = leftColumn + 170;
                    const col3X = leftColumn + 340;

                    const itemsPerColumn = Math.ceil(invitationInfo.vehicleLicensePlates.length / 3);

                    // คอลัมน์ที่ 1
                    let col1Y = textY;
                    for (let i = 0; i < itemsPerColumn && i < invitationInfo.vehicleLicensePlates.length; i++) {
                        ctx.fillText(`• ${invitationInfo.vehicleLicensePlates[i]}`, col1X, col1Y);
                        col1Y += 22;
                    }

                    // คอลัมน์ที่ 2
                    let col2Y = textY;
                    for (let i = itemsPerColumn; i < itemsPerColumn * 2 && i < invitationInfo.vehicleLicensePlates.length; i++) {
                        ctx.fillText(`• ${invitationInfo.vehicleLicensePlates[i]}`, col2X, col2Y);
                        col2Y += 22;
                    }

                    // คอลัมน์ที่ 3
                    let col3Y = textY;
                    for (let i = itemsPerColumn * 2; i < invitationInfo.vehicleLicensePlates.length; i++) {
                        ctx.fillText(`• ${invitationInfo.vehicleLicensePlates[i]}`, col3X, col3Y);
                        col3Y += 22;
                    }
                }

                // แปลงเป็น Data URL
                const finalDataURL = canvas.toDataURL('image/png', 0.95);
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