import { Button, Modal, QRCode, Flex, Input, message } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { Dispatch, RootState } from "../../../../stores";
import MediumActionButton from "../../../../components/common/MediumActionButton";

const QrCodeModal = () => {
  // variables
  const dispatch = useDispatch<Dispatch>();
  const { qrCode } = useSelector((state: RootState) => state.resident);
  // Functions
  const doDownload = (url: string, fileName: string) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const downloadCanvasQRCode = () => {
    const qrCanvas = document
      .getElementById("myQrCode")
      ?.querySelector<HTMLCanvasElement>("canvas");

    if (qrCanvas) {
      const padding = 8; // กำหนด Padding 4px ในทุกด้าน
      const newWidth = qrCanvas.width + padding * 2;
      const newHeight = qrCanvas.height + padding * 2;

      // สร้าง Canvas ใหม่
      const canvas = document.createElement("canvas");
      canvas.width = newWidth;
      canvas.height = newHeight;
      const ctx = canvas.getContext("2d");

      if (ctx) {
        ctx.fillStyle = "#fff"; // กำหนดพื้นหลังสีขาว
        ctx.fillRect(0, 0, newWidth, newHeight); // เติมสีพื้นหลัง
        ctx.drawImage(qrCanvas, padding, padding); // วาด QR Code พร้อม padding

        const url = canvas.toDataURL("image/png");
        doDownload(url, "Invite_QRCode.png");
      }
    } else {
      console.error("ไม่พบ Canvas QR Code");
      alert("ไม่พบ Canvas QR Code");
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(qrCode).then(() => {
      message.success("Copied to clipboard");
    });
  };

  return (
    <Modal
      open={qrCode !== ""}
      onCancel={() => {
        dispatch.resident.updateQrCodeState("");
      }}
      footer={() => {
        return (
          <Flex justify="center" align="center">
            <MediumActionButton
              key="close"
              message="Close"
              onClick={() => {
                dispatch.resident.updateQrCodeState("");
              }}
            />
          </Flex>
        );
      }}
    >
      <Flex justify="center" align="center" vertical>
        <Flex justify="center" align="center">
          <div id="myQrCode">
            <QRCode
              // id="myQrCode"
              type="canvas"
              value={qrCode}
              bgColor="#fff"
              style={{ marginRight: 16, marginBottom: 16 }}
            />
          </div>
          <Button type="primary" onClick={downloadCanvasQRCode}>
            Download
          </Button>
        </Flex>
        <Flex justify="center" align="center" style={{ marginBottom: 16 }}>
          <Input
            value={qrCode}
            readOnly
            style={{ width: 200, marginRight: 16 }}
          />
          <Button onClick={copyToClipboard}>Copy</Button>
        </Flex>
      </Flex>
    </Modal>
  );
};

export default QrCodeModal;
