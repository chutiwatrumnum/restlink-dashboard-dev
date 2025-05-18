import { Modal } from "antd";
import { FailedIcon, SuccessIcon } from "../../assets/icons/Icons";
import MediumActionButton from "./MediumActionButton";

import { whiteLabel } from "../../configs/theme";
import "../styles/common.css";

interface ConfirmModalType {
  title: string;
  message?: string;
  okMessage: string;
  cancelMessage: string;
  onCancel?: () => void;
  onOk?: () => void;
}

const clearAllModals = (delay: number = 3000) => {
  setTimeout(() => {
    Modal.destroyAll();
  }, delay);
};

export const callFailedModal = (message: string, delay?: number) => {
  clearAllModals(delay);
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

export const callSuccessModal = (message: string, delay?: number) => {
  clearAllModals(delay);

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

export const callConfirmModal = ({
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
            if (onCancel) onCancel();
            Modal.destroyAll();
          }}
          type="default"
          className="cancelBtnColor smokeBorderColor mainTextColor spacer"
        />

        <MediumActionButton
          message={okMessage}
          onClick={async () => {
            if (onOk) onOk();
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
