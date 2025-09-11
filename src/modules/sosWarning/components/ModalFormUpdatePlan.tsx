import { useState, useEffect } from "react";
import CreateModal from "../../../components/common/FormModal";
import {
  Row,
  Col,
  Input,
  Button,
  Form,
  Upload,
  Select
} from "antd";
import { SosWarningDataType } from "../../../stores/interfaces/SosWarning";
import IconImagePhoto from "../../../assets/images/IconImagePhoto.png";
interface ModalFormUpdateProps {
  isModalOpen: boolean;
  setIsModalOpen: (isOpen: boolean) => void;
  onClose?: () => void;
  selectedSosWarning?: SosWarningDataType | null;
}

export const ModalFormUpdatePlan: React.FC<ModalFormUpdateProps> = ({
  isModalOpen,
  setIsModalOpen,
  onClose,
  selectedSosWarning
}) => {

  const [imageUrl, setImageUrl] = useState<string>();
  const [imageBase64, setImageBase64] = useState<string | undefined>();
  const [form] = Form.useForm();

  const handleSave = () => {
    setIsModalOpen(false);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
    onClose?.();
  };

  useEffect(() => {
    setIsModalOpen(isModalOpen);
  }, [isModalOpen]);

  const handleUpload = (info: any) => {
    const file = info.file.originFileObj;
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImageBase64(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const formUpdatePlan = () => {
    return (
      <Form layout="vertical" style={{ marginTop: 8 }}>
        <Row gutter={24}>
          {/* ซ้าย */}
          <Col span={12}>
            <Form.Item
              label={<span className="font-semibold">Project name</span>}
              name="projectName"
              required
            >
              <Input defaultValue="AITAN1" />
            </Form.Item>
            <Form.Item
              label={<span className="font-semibold">Plan type</span>}
              name="planType"
              required
            >
              <Select 
                showSearch
                filterOption={(input, option) =>
                  (option?.children as unknown as string)
                    ?.toLowerCase()
                    ?.includes(input.toLowerCase()) ?? false
                }
                defaultValue="Village"
                placeholder="Search or select plan type"
              >
                <Select.Option value="Village">Village</Select.Option>
                <Select.Option value="Condo">Condo</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item
              label={<span className="font-semibold">Image</span>}
              name="image"
              extra={
                <div className="flex justify-between items-center mt-4">
                  <span className="text-gray-400">
                    File size 5MB, 16:9 Ratio, *JPG
                  </span>
                  {imageBase64 && (
                    <Button
                      danger
                      className="w-25"
                      type="default"
                      size="small"
                      onClick={() => {
                        setImageBase64(undefined);
                      }}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              }
              required
            >
              <Upload.Dragger
                name="file"
                multiple={false}
                accept="image/jpeg,image/png"
                showUploadList={false}
                customRequest={({ file, onSuccess }) => {
                  setTimeout(() => {
                    onSuccess && onSuccess("ok");
                  }, 500);
                }}
                onChange={handleUpload}
              >
                <div className="flex flex-col items-center justify-center h-full ">
                  {imageBase64 ? (
                    <img
                      src={imageBase64}
                      alt="Preview"
                      className="w-full h-full object-scale-down rounded-xl  max-h-[300px] "
                    />
                  ) : (
                    <div>
                      <img
                        src={IconImagePhoto}
                        className="w-10 h-10 mb-2 opacity-50  object-scale-down"
                      />
                      <div className="text-[#B0B0B0] text-sm">
                        Upload your photo
                      </div>
                      <div className="text-[#B0B0B0] text-xs">
                        *File size &lt;1MB, 16:9 Ratio, *.JPGs
                      </div>
                    </div>
                  )}
                </div>
              </Upload.Dragger>
            </Form.Item>
          </Col>
          {/* ขวา */}
          <Col span={12}>
            <Form.Item
              label={<span className="font-semibold">Tel 1</span>}
              name="tel1"
              required
            >
              <Input defaultValue="0985574483" />
            </Form.Item>
            <Form.Item
              label={<span className="font-semibold">Tel 2</span>}
              name="tel2"
            >
              <Input defaultValue="0985574484" />
            </Form.Item>
            <Form.Item
              label={<span className="font-semibold">Tel 3</span>}
              name="tel3"
            >
              <Input defaultValue="0985574485" />
            </Form.Item>
            <Form.Item
              label={<span className="font-semibold">Address</span>}
              name="address"
            >
              <Input  />
            </Form.Item>
            <Form.Item
              label={<span className="font-semibold">Latitude</span>}
              name="latitude"
            >
              <Input defaultValue="50.5040806515" disabled />
            </Form.Item>
            <Form.Item
              label={<span className="font-semibold">Longitude</span>}
              name="longitude"
            >
              <Input defaultValue="-50.5040806515" disabled />
            </Form.Item>
            <Form.Item>
              <div className="flex justify-end">
                <Button className="ml-auto" type="primary" htmlType="submit">
                  Confirm
                </Button>
              </div>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  };

  return (
    <CreateModal
      title={"Edit Plan"}
      content={formUpdatePlan()}
      onOk={handleSave}
      isOpen={isModalOpen}
      onCancel={handleCancel}
      width="50%"
    />
  );
};
