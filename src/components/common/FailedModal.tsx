import { Modal } from "antd";
import { FailedIcon } from "../../assets/icons/Icons";

import { whiteLabel } from "../../configs/theme";
import "../styles/common.css";

const FailedModal = (message: string,second: number = 3000) => {
  setTimeout(() => {
    Modal.destroyAll();
  }, second);

  return Modal.error({
    icon: null,
    title: null,
    footer: null,
    content: (
      <div className="successModalContainer">
        <FailedIcon className="successIcon" />
        <p style={{ color: whiteLabel.dangerColor }}>{message}</p>
      </div>
    ),
    centered: true,
    className: "statusModalController",
  });
};

export default FailedModal;
