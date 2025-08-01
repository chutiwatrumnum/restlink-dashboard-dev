import { useState, useEffect } from "react";

import { Upload, Typography, message, Avatar } from "antd";
import { CameraIcon } from "../../assets/icons/Icons";
import { whiteLabel } from "../../configs/theme";

import type { RcFile, UploadFile, UploadProps } from "antd/es/upload/interface";
import type { UploadChangeParam } from "antd/es/upload";

import "../styles/common.css";

const { Text } = Typography;

interface UploadCircleBtnType {
  onChange: (url: string) => void;
  disabled?: boolean;
  className?: string;
}

const UploadCircleBtn = ({
  onChange,
  disabled = false,
  className,
}: UploadCircleBtnType) => {
  const [overSize, setOverSize] = useState(false);

  const beforeUpload = (file: RcFile) => {
    const isLt2M = file.size / 1024 / 1024 < 1;
    if (!isLt2M) {
      message.error("Image must smaller than 1MB!");
      setOverSize(true);
    } else {
      setOverSize(false);
    }
    return isLt2M;
  };

  const getBase64 = (img: RcFile, callback: (url: string) => void) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => callback(reader.result as string));
    reader.readAsDataURL(img);
  };

  const handleChange: UploadProps["onChange"] = (
    info: UploadChangeParam<UploadFile>
  ) => {
    info.file.status = "done";
    getBase64(info.file.originFileObj as RcFile, (url) => {
      onChange(url);
    });
  };

  return (
    <>
      <Upload
        name="profileImage"
        maxCount={1}
        accept=".png, .jpg, .jpeg, .svg"
        beforeUpload={beforeUpload}
        onChange={handleChange}
        className="uploadCircleBtnContainer"
        showUploadList={false}
        disabled={disabled}
      >
        <Avatar
          icon={<CameraIcon />}
          size={50}
          onClick={() => {}}
          className="uploadCircleBtn"
        />
      </Upload>
    </>
  );
};

export default UploadCircleBtn;
