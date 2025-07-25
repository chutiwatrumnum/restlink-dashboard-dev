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
  width?: string;
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
  
  width = "30%",
}: CreateModalType) => {
  const [open, setOpen] = useState(isOpen);
  const bodyStyle = { padding: 24, maxHeight: '80vh',  };
  useEffect(() => {
    setOpen(isOpen);
  }, [isOpen]);

  return (
    <>
      <Modal
        width={width}
        className={"createModalController " + className}
        open={open}
        title={
          title && (
            <span style={{ fontWeight: whiteLabel.boldWeight }}>{title}</span>
          )
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
