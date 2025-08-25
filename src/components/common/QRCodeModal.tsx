// ไฟล์: src/components/common/QRCodeModal.tsx

import React, { useState, useEffect } from "react";
import { Modal, Button, Spin, message } from "antd";
import { DownloadOutlined, QrcodeOutlined } from "@ant-design/icons";
import {
  generateQRCodeWithText,
  downloadQRCodeWithText,
  generateInvitationQRData,
} from "../../utils/qrCodeUtils";
import { InvitationRecord } from "../../stores/interfaces/Invitation";
import dayjs from "dayjs";

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  invitation: InvitationRecord | null;
}

const QRCodeModal: React.FC<QRCodeModalProps> = ({
  isOpen,
  onClose,
  invitation,
}) => {
  const [qrCodeDataURL, setQrCodeDataURL] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // Generate QR Code when modal opens
  useEffect(() => {
    if (isOpen && invitation && invitation.code) {
      generateQRCode();
    }
  }, [isOpen, invitation]);

  const generateQRCode = async () => {
    if (!invitation || !invitation.code) return;

    setLoading(true);
    try {
      console.log("🔄 Generating QR Code for invitation:", invitation.id);

      const qrData = generateInvitationQRData(invitation.code);

      // สร้าง QR Code พร้อมข้อความสำหรับ preview
      const invitationInfo = {
        guestName: invitation.guest_name,
        houseAddress: invitation.house_address || "ไม่ระบุที่อยู่", // ใช้ข้อมูลจาก context หรือ default
        type: invitation.type,
        vehicleLicensePlates: invitation.vehicle_license_plates || [], // ใช้ข้อมูลที่ประมวลผลแล้ว
        authorizedAreas: invitation.authorized_area_names || [], // ใช้ชื่อพื้นที่ที่แปลแล้ว
        startTime: invitation.start_time,
        expireTime: invitation.expire_time,
        code: invitation.code,
      };

      const dataURL = await generateQRCodeWithText(qrData, invitationInfo, {
        size: 350,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
        errorCorrectionLevel: "M",
      });

      setQrCodeDataURL(dataURL);
      console.log("✅ Enhanced QR Code generated successfully");
    } catch (error) {
      console.error("❌ Error generating QR Code:", error);
      message.error("ไม่สามารถสร้าง QR Code ได้");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!invitation || !invitation.code) return;

    setDownloading(true);
    try {
      const qrData = generateInvitationQRData(invitation.code);

      const invitationInfo = {
        guestName: invitation.guest_name,
        houseAddress: invitation.house_address || "ไม่ระบุที่อยู่",
        type: invitation.type,
        vehicleLicensePlates: invitation.vehicle_license_plates || [],
        authorizedAreas: invitation.authorized_area_names || [],
        startTime: invitation.start_time,
        expireTime: invitation.expire_time,
        code: invitation.code,
      };

      // สร้างชื่อไฟล์
      const sanitizedGuestName = invitation.guest_name.replace(
        /[^a-zA-Z0-9ก-๙]/g,
        "_"
      );
      const shortDate = dayjs(invitation.start_time).format("DDMM");
      const fileName = `QR_${sanitizedGuestName}_${shortDate}_${invitation.code.substring(
        0,
        8
      )}`;

      await downloadQRCodeWithText(qrData, invitationInfo, fileName, {
        size: 500, // ขนาดใหญ่สำหรับดาวน์โหลด
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
        errorCorrectionLevel: "M",
      });

      message.success(
        `ดาวน์โหลด QR Code สำหรับ ${invitation.guest_name} เรียบร้อย!`
      );
    } catch (error) {
      console.error("❌ Error downloading QR Code:", error);
      message.error("ไม่สามารถดาวน์โหลด QR Code ได้");
    } finally {
      setDownloading(false);
    }
  };

  const handleModalClose = () => {
    setQrCodeDataURL("");
    setLoading(false);
    setDownloading(false);
    onClose();
  };

  if (!invitation) return null;

  return (
    <Modal
      open={isOpen}
      onCancel={handleModalClose}
      centered
      width={500}
      footer={[
        <Button key="close" onClick={handleModalClose} size="large">
          Close
        </Button>,
        <Button
          key="download"
          type="primary"
          icon={<DownloadOutlined />}
          onClick={handleDownload}
          disabled={loading || !qrCodeDataURL}
          loading={downloading}
          size="large"
          style={{
            background: "#1890ff",
            borderColor: "#1890ff",
            fontWeight: 600,
            minWidth: 120,
          }}>
          Download
        </Button>,
      ]}
      destroyOnClose
      className="qr-code-modal"
      styles={{
        header: {
          borderBottom: "1px solid #f0f0f0",
          paddingBottom: 16,
        },
        body: {
          padding: "24px 24px 16px 24px",
        },
        footer: {
          borderTop: "1px solid #f0f0f0",
          paddingTop: 16,
        },
      }}>
      <div style={{ textAlign: "center" }}>
        {/* QR Code Display */}
        <div
          style={{
            marginBottom: 24,
            display: "flex",
            justifyContent: "center",
          }}>
          {loading ? (
            <div
              style={{
                height: 500,
                width: 450,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#f5f5f5",
                borderRadius: 12,
                border: "2px solid #d9d9d9",
              }}>
              <div style={{ textAlign: "center" }}>
                <Spin size="large" />
                <div style={{ marginTop: 16, color: "#666", fontSize: 14 }}>
                  กำลังสร้าง QR Code พร้อมข้อมูล...
                </div>
              </div>
            </div>
          ) : qrCodeDataURL ? (
            <div
              style={{
                padding: 15,
                backgroundColor: "#fff",
                borderRadius: 12,
                border: "2px solid #f0f0f0",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}>
              <img
                src={qrCodeDataURL}
                alt="QR Code with Information"
                style={{
                  maxWidth: "100%",
                  height: "auto",
                  display: "block",
                }}
              />
            </div>
          ) : (
            <div
              style={{
                height: 500,
                width: 450,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#f9f9f9",
                border: "2px dashed #d9d9d9",
                borderRadius: 12,
              }}>
              <div style={{ textAlign: "center" }}>
                <QrcodeOutlined
                  style={{ fontSize: 48, color: "#bfbfbf", marginBottom: 16 }}
                />
                <div style={{ color: "#999", fontSize: 14 }}>
                  QR Code ไม่สามารถแสดงได้
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div
          style={{
            marginTop: 16,
            padding: 12,
            backgroundColor: "#e6f7ff",
            border: "1px solid #91d5ff",
            borderRadius: 6,
            fontSize: 12,
            color: "#0050b3",
            textAlign: "left",
          }}>
          <strong>💡 How to use : </strong>Present this QR Code at the checkpoint
          to gain access to the authorized area.
        </div>
      </div>
    </Modal>
  );
};

export default QRCodeModal;
