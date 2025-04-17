import { Modal } from "antd";
import { SuccessIcon } from "../../assets/icons/Icons";
import { whiteLabel } from "../../configs/theme";
import "../styles/common.css";

const SuccessModal = (message: string) => {
  setTimeout(() => {
    Modal.destroyAll();
  }, 3000);

  return Modal.success({
    icon: null,
    title: null,
    footer: null,
    content: (
      <div className="successModalContainer">
        <p  style={{color:whiteLabel.successColor}}>{message}</p>
        <SuccessIcon className="successIcon" />
      </div>
    ),
    centered: true,
    className: "statusModalController",
  });
};

export default SuccessModal;
