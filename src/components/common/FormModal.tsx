import { useState, useEffect } from "react";
import { Modal } from "antd";

import "../styles/common.css";
import { whiteLabel } from "../../configs/theme";

interface CreateModalType {
  title: string;
  content: React.ReactNode;
  onOk: (payload?: any) => void;
  onCancel: () => void;
  footer?: React.ReactNode[] | null;
  isOpen?: boolean;
  className?: string;
}

const CreateModal = ({
  title,
  content,
  onOk,
  onCancel,
  footer = null,
  isOpen = false,
  className,
}: CreateModalType) => {
  const [open, setOpen] = useState(isOpen);

  useEffect(() => {
    setOpen(isOpen);
  }, [isOpen]);

  return (
    <>
      <Modal
        className={"createModalController " + className}
        open={open}
        title={
          <span style={{ fontWeight: whiteLabel.normalWeight }}>{title}</span>
        }
        onOk={onOk}
        onCancel={onCancel}
        footer={footer}
        centered={true}
        forceRender={true}
      >
        {content}
      </Modal>
    </>
  );
};

export default CreateModal;
