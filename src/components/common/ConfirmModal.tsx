import { Modal } from "antd";
import MediumActionButton from "./MediumActionButton";
// import SmallActionButton from "./SmallActionButton";

import "../styles/common.css";
import { whiteLabel } from "../../configs/theme";

interface ConfirmModalType {
  title: string;
  message?: string;
  okMessage: string;
  cancelMessage: string;
  onCancel?: () => void;
  onOk?: () => void;
}

const ConfirmModal = ({
  message,
  title = "title",
  okMessage = "okMessage",
  cancelMessage = "cancelMessage",
  onOk,
  onCancel,
}: ConfirmModalType) => {
  return Modal.confirm({
    icon: null,
    title: <span style={{ fontWeight: whiteLabel.normalWeight }}>{title}</span>,
    width: 500,
    content: message ? (
      <div>
        <p>{message}</p>
      </div>
    ) : null,
    footer: (
      <div className="confirmModalFooter">
        <MediumActionButton
          message={cancelMessage}
          onClick={() => {
            if (onCancel !== undefined) onCancel();
            Modal.destroyAll();
          }}
          type="default"
          className="cancelBtnColor smokeBorderColor mainTextColor spacer"
        />

        <MediumActionButton
          message={okMessage}
          onClick={() => {
            if (onOk !== undefined) onOk();
            Modal.destroyAll();
          }}
          className="primaryColor spacer"
        />
      </div>
    ),
    centered: true,
    className: "confirmModalStyle",
  });
};

export default ConfirmModal;
