import { Modal } from "antd";
import FAILED_ICON from "../../assets/icons/Failed.svg";
import { whiteLabel } from "../../configs/theme";
import "../styles/common.css";

const FailedModal = (message: string) => {
  setTimeout(() => {
    Modal.destroyAll();
  }, 3000);

  return Modal.error({
    icon: null,
    title: null,
    footer: null,
    content: (
      <div className="successModalContainer">
        <p style={{color:whiteLabel.dangerColor}}>{message}</p>
        <img src={FAILED_ICON} alt="failedIcon" style={{ width: 50 }} />
      </div>
    ),
    centered: true,
    className: "statusModalController",
  });
};

export default FailedModal;
