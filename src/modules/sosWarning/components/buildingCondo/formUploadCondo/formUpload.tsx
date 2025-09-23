import { Form, Select, Button, Upload } from "antd";
import { useEffect } from "react";
import type { RcFile, UploadFile } from "antd/es/upload/interface";
import IconImagePhoto from "../../../../../assets/images/IconImagePhoto.png";
import { dataAllMap } from "../../../../../stores/interfaces/SosWarning";
interface FormUploadCondoProps {
  selectedBuildingCondo: {
    numberOfBuilding: number;
    floor: number;
  };
  handleSave: (values: any) => void;
  setUploadingFileName: (fileName: string) => void;
  setImageUrl: (image: string) => void;
  imageUrl: string;
  setIsImageUploaded: (isImageUploaded: boolean) => void;
  setUploadProgress: (uploadProgress: number) => void;
  dataMapAll: dataAllMap;
}

const FormUploadCondo = ({ 
  selectedBuildingCondo,
  handleSave,
  setUploadingFileName,
  setImageUrl,
  imageUrl,
  setIsImageUploaded,
  setUploadProgress,
  
 }: FormUploadCondoProps) => {
  
  const [form] = Form.useForm();

  useEffect(() => {
    if (selectedBuildingCondo) {
      form.setFieldsValue({
        numberOfBuilding: selectedBuildingCondo.numberOfBuilding,
        floor: selectedBuildingCondo.floor
      });
    }
  }, [selectedBuildingCondo]);


  const beforeUpload = (file: RcFile) => {
    setUploadingFileName(file.name);
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      console.error('Image must smaller than 5MB!');
      return Upload.LIST_IGNORE;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) {
        setImageUrl(reader.result as string);
      }
    };
    reader.readAsDataURL(file);
    return false;
  };    



  return (
    <>
      <Form 
        form={form}
        layout="vertical"
      >
        <Form.Item
          label={
            <span className="font-bold">
              Number of building
            </span>
          }
          name="numberOfBuilding"
          rules={[{ required: true, message: "Please specify number of buildings" }]}
        >
          <Select
            showSearch
            filterOption={(input, option) =>
              (option?.label as unknown as string)
                ?.toString()
                ?.toLowerCase()
                ?.includes(input.toLowerCase()) ?? false
            }
            placeholder="Search or select number of buildings"
            options={Array.from({ length: 20 }, (_, i) => ({
              value: i + 1,
              label: i + 1
            }))}
          />
        </Form.Item>

        {/* Floor */}
        <Form.Item
          label={
            <span className="font-bold">
              Floor
            </span>
          }
          name="floor"
          rules={[{ required: true, message: "Please specify number of floors" }]}
        >
          <Select
            showSearch
            filterOption={(input, option) =>
              (option?.label as unknown as string)
                ?.toString()
                ?.includes(input) ?? false
            }
            placeholder="Search or select number of floors"
            options={Array.from({ length: 30 }, (_, i) => ({
              value: i + 1,
              label: i + 1
            }))}
          />
        </Form.Item>

        {/* Image Upload */}
        <Form.Item
          label={
            <span className="font-bold">
              Image
            </span>
          }
          name="image"
          valuePropName="fileList"
          getValueFromEvent={(e) => {
            if (Array.isArray(e)) {
              return e;
            }
            return e?.fileList;
          }}
          rules={[{ required: true, message: "Please upload an image" }]}
          extra={
            <div>
              {imageUrl ? (
                <div className="flex justify-between items-center mt-2">
                  <span className="text-gray-400">File size 5MB, 16:9 Ratio, *JPG</span>
                  <Button
                    className="w-25"
                    danger
                    type="default"
                    size="small"
                    onClick={() => {
                      setImageUrl('');
                      setIsImageUploaded(false);
                      setUploadProgress(0);
                      setUploadingFileName("");
                      form.resetFields();
                    }}
                  >
                    Delete image
                  </Button>
                </div>
              ) : (
                <div>
                  <span className="text-gray-400">File size 5MB, 16:9 Ratio, *JPG</span>
                </div>
              )}
            </div>
          }
        >
          <Upload.Dragger
            accept="image/*"
            showUploadList={false}
            className={`w-full ${imageUrl ? 'h-[300px]' : 'h-auto'}`}
            beforeUpload={beforeUpload}
            customRequest={() => {}}
          >
            {imageUrl ? (<img src={imageUrl} alt="avatar" className="w-full h-[300px] object-scale-down" />) : (
              <div className="p-8">
                <p className="ant-upload-drag-icon flex justify-center items-center">
                  <img src={IconImagePhoto} alt="upload"  />
                </p>
                <p className="ant-upload-text text-lg mt-4">
                  Click or drag file to this area to upload
                </p>
                <p className="ant-upload-hint text-gray-500 mt-2">
                  Support for a single JPG upload
                </p>
              </div>
            )}
          </Upload.Dragger>
        </Form.Item>



        {/* Next Button */}
        <Form.Item>
          <div className="flex justify-end">
            <Button
              htmlType="button"
              type="primary"
              size="large"
              onClick={handleSave}
              className="rounded-lg px-10 w-40"
            >
              Success
            </Button>
          </div>
        </Form.Item>
      </Form>
    </>
  );
};
export default FormUploadCondo;
