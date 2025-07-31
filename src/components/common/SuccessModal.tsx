import { Modal } from "antd";
import { SuccessIcon } from "../../assets/icons/Icons";
import { whiteLabel } from "../../configs/theme";
import "../styles/common.css";

const SuccessModal = (message: string, timeout: number = 3000, onClose?: () => void) => {
  setTimeout(() => {
    Modal.destroyAll();
    // เรียก onClose เมื่อ modal ปิดอัตโนมัติ
    if (onClose) {
      onClose();
    }
  }, timeout);

  return Modal.success({
    icon: null,
    title: null,
    footer: null,
    content: (
      <div className="successModalContainer">
        <SuccessIcon className="successIcon" />
        <p style={{ color: whiteLabel.successColor }}>{message}</p>
      </div>
    ),
    centered: true,
    className: "statusModalController",
    onCancel: onClose, // เมื่อผู้ใช้กดปิด modal
    onOk: onClose,     // เมื่อผู้ใช้กด OK (ถ้ามี)
    
  });
};

export default SuccessModal;
