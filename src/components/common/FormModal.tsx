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
  destroyOnClose?: boolean;
  maskClosable?: boolean;
}

const CreateModal = ({
  title,
  content,
  onOk,
  onCancel,
  footer = null,
  isOpen = false,
  className,
  destroyOnClose = false,
  maskClosable = true,
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
          <span style={{ fontWeight: whiteLabel.boldWeight }}>{title}</span>
        }
        onOk={onOk}
        onCancel={onCancel}
        footer={footer}
        centered={true}
        forceRender={true}
        destroyOnClose={destroyOnClose}
        maskClosable={maskClosable}>
        {content}
      </Modal>
    </>
  );
};

export default CreateModal;
