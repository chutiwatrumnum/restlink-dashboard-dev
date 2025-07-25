import { Button, Modal, QRCode, Flex, Input, message } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { Dispatch, RootState } from "../../../stores";

const QrCodeModal = () => {
  // variables
  const dispatch = useDispatch<Dispatch>();
  const { qrCode } = useSelector((state: RootState) => state.juristic);
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
      open={!!qrCode}
      onCancel={() => {
        dispatch.juristic.updateQrCodeState("");
      }}
      width={340}
      footer={null}
      closable={false}
    >
      <div className="flex flex-col items-center justify-center w-full">
        <div className="w-[300px]">
          <div className="flex flex-col items-center justify-center mb-8 w-fit">
            <div id="myQrCode" className="mb-8">
              <QRCode
                size={300}
                type="canvas"
                value={qrCode}
                bgColor="#fff"
                color="#000"
              />
            </div>
            <Button
              type="primary"
              onClick={downloadCanvasQRCode}
              className="w-full"
            >
              Download
            </Button>
          </div>
          <div className="flex flex-row items-center justify-center mb-8 w-full">
            <Input
              value={qrCode}
              readOnly
              style={{ width: "100%", marginRight: 16 }}
            />
            <Button onClick={copyToClipboard}>Copy</Button>
          </div>
          <Button
            className="w-full"
            onClick={() => {
              dispatch.juristic.updateQrCodeState("");
            }}
            danger
          >
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default QrCodeModal;
