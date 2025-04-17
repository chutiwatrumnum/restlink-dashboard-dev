import { useState, useEffect } from "react";

import { Upload, Typography, message } from "antd";
import { NoImageIcon } from "../../assets/icons/Icons";
import { whiteLabel } from "../../configs/theme";

import type { RcFile, UploadFile, UploadProps } from "antd/es/upload/interface";
import type { UploadChangeParam } from "antd/es/upload";

const { Text } = Typography;

interface UploadImageGroupType {
  onChange: (url: string) => void;
  image: string;
  disabled?: boolean;
  className?: string;
  height?: number;
  ratio?: string;
}

const UploadImageGroup = ({
  onChange,
  image,
  disabled = false,
  className,
  height = 360,
  ratio = "16:9 ratio (1280x720 px)",
}: UploadImageGroupType) => {
  const [overSize, setOverSize] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>("");

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
      setImageUrl(url);
      onChange(url);
    });
  };

  useEffect(() => {
    setImageUrl(image);
  }, [image]);

  return (
    <>
      <Upload.Dragger
        name="uploadImage"
        maxCount={1}
        accept=".png, .jpg, .jpeg, .svg"
        beforeUpload={beforeUpload}
        onChange={handleChange}
        height={height}
        showUploadList={false}
        className={className + " uploadStyleControl"}
        style={{
          backgroundColor: "#fff",
          backgroundImage: `url(${imageUrl})`,
          backgroundSize: "cover",
        }}
        disabled={disabled}
      >
        <div
          style={
            imageUrl
              ? {
                  backgroundColor: "rgba(0,0,0,0.4)",
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  borderRadius: 10,
                }
              : {
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  borderRadius: 10,
                }
          }
        >
          <p>
            {imageUrl ? (
              <NoImageIcon color={whiteLabel.whiteColor} />
            ) : (
              <NoImageIcon color={whiteLabel.grayTransColor} />
            )}
          </p>
          <Text
            style={{
              color: imageUrl
                ? whiteLabel.whiteTransColor
                : whiteLabel.grayTransColor,
            }}
          >
            <p>Upload your photo</p>
          </Text>
          <Text
            style={{
              color: imageUrl
                ? whiteLabel.whiteColor
                : whiteLabel.grayTransColor,
            }}
          >
            <p>{`*File size <1MB, ${ratio}, *JPGs`}</p>
          </Text>
        </div>
      </Upload.Dragger>

      <Text hidden={!overSize} type="danger">
        {`*File size < 1Mb , ${ratio}, *JPGs`}
      </Text>
    </>
  );
};

export default UploadImageGroup;
