import { Modal } from "antd";
import { SuccessIcon } from "../../assets/icons/Icons";
import { whiteLabel } from "../../configs/theme";
import "../styles/common.css";

const SuccessModal = (message: string,timeout:number = 3000) => {
  setTimeout(() => {
    Modal.destroyAll();
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
  });
};

export default SuccessModal;
