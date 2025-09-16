import { useState, useEffect } from "react";
import {
  Form,
  Input,
  Row,
  Col,
  Typography,
  message,
  Button,
  Upload,
  Flex,
} from "antd";
import { requiredRule } from "../../../configs/inputRule";
import { useDispatch } from "react-redux";
import { Dispatch } from "../../../stores";

import FormModal from "../../../components/common/FormModal";
import SmallButton from "../../../components/common/SmallButton";
import SuccessModal from "../../../components/common/SuccessModal";

import { UploadImageIcon } from "../../../assets/icons/Icons";
import { DeleteOutlined } from "@ant-design/icons";

import {
  PeopleCountingFormDataType,
  PeopleCountingDataType,
} from "../../../stores/interfaces/PeopleCounting";
import FormItem from "antd/es/form/FormItem";

import ConfirmModal from "../../../components/common/ConfirmModal";

type PeopleCountingEditModalType = {
  isEditModalOpen: boolean;
  onOk: (payload: PeopleCountingFormDataType) => void;
  onCancel: () => void;
  data?: PeopleCountingDataType;
};

const PeopleCountingEditModal = ({
  isEditModalOpen,
  onOk,
  onCancel,
  data,
}: PeopleCountingEditModalType) => {
  const dispatch = useDispatch<Dispatch>();

  const [form] = Form.useForm();
  const [open, setOpen] = useState<boolean>(false);

  const [imageUrl, setImageUrl] = useState<string>();
  const [fileUpload, setFileUpload] = useState<File>();
  const [imageChanged, setImageChanged] = useState<boolean>(false);

  const closeModal = () => {
    setOpen(false);
    onCancel();
    // Reset image states
    setImageChanged(false);
    setFileUpload(undefined);
  };

  const onFinish = (value: PeopleCountingFormDataType) => {
    ConfirmModal({
      title: "Edit room",
      message: "Are you sure you want to edit this room?",
      okMessage: "Confirm",
      cancelMessage: "Cancel",
      onOk: async () => {
        const sortValue = value.sort ?? data?.sort ?? 0;
        const formData = {
          ...value,
          id: data?.id,
          statusLow: String(value.statusLow),
          statusMedium: String(value.statusMedium),
          statusHigh: String(value.statusHigh),
          active: Boolean(value.active),
          sort: String(sortValue),
          image: imageChanged ? fileUpload : undefined,
        };

        try {
          const result = await dispatch.peopleCounting.editPeopleCountingData(
            formData
          );

          if (result) {
            SuccessModal("Room have been successfully edited");
            closeModal();
            onOk(formData);
          } else {
            message.error("Failed to edit room");
          }
        } catch (error: any) {
          console.error("Edit room failed: ", error);
          message.error("Failed to edit room");
        }
      },
    });
  };

  const validateMediumStatus = async (rule: any, value: any) => {
    if (parseInt(value) < 1) {
      return Promise.reject("Value must be more than 1");
    }
    return Promise.resolve();
  };

  const validateHighStatus = async (rule: any, value: any) => {
    const statusMedium = form.getFieldValue("statusMedium");

    if (parseInt(value) <= parseInt(statusMedium)) {
      return Promise.reject("Value must be more than medium status");
    }
    return Promise.resolve();
  };

  const handleUploadChange = (info: any) => {
    const file = info?.file?.originFileObj as File | undefined;
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setImageUrl(objectUrl);
      setFileUpload(file);
      setImageChanged(true);
    }
  };

  const handleRemoveImage = () => {
    // if (imageUrl && imageUrl.startsWith("blob:")) {
    //   URL.revokeObjectURL(imageUrl);
    // }
    setImageUrl(undefined);
    setFileUpload(undefined);
    setImageChanged(false);
  };

  useEffect(() => {
    setOpen(isEditModalOpen);
  }, [isEditModalOpen]);

  useEffect(() => {
    if (data) {
      setImageUrl(data.image);
      setImageChanged(false);
      setFileUpload(undefined);

      form.setFieldsValue({
        name: data.name,
        description: data.description,
        statusLow: data.statusLow,
        statusMedium: data.statusMedium,
        statusHigh: data.statusHigh,
        icon: data.icon || "icon",
        cameraIp: data.cameraIp || "192.168.68.111",
        sort: data.sort,
        active: data.active,
      });
    } else {
      form.resetFields();
      setImageUrl(undefined);
      setImageChanged(false);
      setFileUpload(undefined);
    }
  }, [data]);

  const ModalContent = () => {
    return (
      <Form
        form={form}
        name="peopleCountingEditModal"
        className="peopleCountingFormContainer"
        initialValues={{ remember: true }}
        autoComplete="off"
        layout="vertical"
        onFinish={onFinish}
        onFinishFailed={() => {
          console.log("FINISHED FAILED");
        }}
      >
        <div className="peopleCountingModalColumn">
          <Col span={24}>
            <FormItem label="Image" name="image">
              <div>
                {!imageUrl ? (
                  <Upload.Dragger
                    accept=".jpg,.jpeg,.png"
                    onChange={handleUploadChange}
                    showUploadList={false}
                    height={240}
                  >
                    <Flex vertical={true} justify="center" align="center">
                      <UploadImageIcon />
                      <Flex vertical={true} style={{ marginTop: 10 }}>
                        <p style={{ margin: 0, color: "#888" }}>
                          Upload your photo
                        </p>
                        <p style={{ color: "#888", fontSize: "12px" }}>
                          *File size {`<`} 1MB, 16:9 Ratio, *JPGs
                        </p>
                      </Flex>
                    </Flex>
                  </Upload.Dragger>
                ) : (
                  <div style={{ position: "relative" }}>
                    <img
                      src={imageUrl ?? data?.image}
                      alt="uploaded"
                      style={{
                        width: "100%",
                        maxHeight: "240px",
                        borderRadius: "16px",
                        objectFit: "cover",
                      }}
                    />
                    <Button
                      icon={<DeleteOutlined />}
                      onClick={handleRemoveImage}
                      style={{ position: "absolute", bottom: 6, right: 6 }}
                      danger
                    >
                      Change Image
                    </Button>
                  </div>
                )}
              </div>
            </FormItem>
          </Col>
          <Col span={24}>
            <Form.Item<PeopleCountingFormDataType>
              label="Room name"
              name="name"
            >
              <Input size="middle" placeholder="Room name" disabled />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item<PeopleCountingFormDataType>
              label="Description"
              name="description"
            >
              <Input.TextArea
                rows={4}
                placeholder="Description"
                style={{ resize: "none" }}
                disabled
              />
            </Form.Item>
          </Col>
          <Row style={{ marginBottom: 6 }}>
            <Col span={24}>
              <Typography.Text strong>
                Number of people to display status (low, medium, high)
              </Typography.Text>
            </Col>
          </Row>
          <Row
            gutter={10}
            justify="space-between"
            align="middle"
            style={{ width: "100%" }}
          >
            <Col span={8}>
              <Form.Item<PeopleCountingFormDataType>
                label="Low"
                name="statusLow"
                rules={requiredRule}
              >
                <Input size="middle" placeholder="Input low" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item<PeopleCountingFormDataType>
                label="Medium"
                name="statusMedium"
                rules={[...requiredRule, { validator: validateMediumStatus }]}
              >
                <Input type="number" size="middle" placeholder="Input medium" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item<PeopleCountingFormDataType>
                label="High"
                name="statusHigh"
                rules={[...requiredRule, { validator: validateHighStatus }]}
              >
                <Input type="number" size="middle" placeholder="Input high" />
              </Form.Item>
            </Col>
          </Row>
          <Row
            justify="space-between"
            align="middle"
            style={{ width: "100%" }}
            hidden
          >
            <Col span={7}>
              <Form.Item<PeopleCountingFormDataType>
                label="icon"
                name="icon"
                rules={[...requiredRule]}
              >
                <Input size="middle" placeholder="icon" defaultValue={"icon"} />
              </Form.Item>
            </Col>
            <Col span={7}>
              <Form.Item<PeopleCountingFormDataType>
                label="cameraIp"
                name="cameraIp"
                rules={[...requiredRule]}
              >
                <Input
                  size="middle"
                  placeholder="cameraIp"
                  defaultValue={"192.168.68.111"}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row justify="end">
            <SmallButton className="saveButton" message="Save" form={form} />
          </Row>
        </div>
      </Form>
    );
  };

  return (
    <>
      <FormModal
        isOpen={open}
        title="Edit Room"
        content={<ModalContent />}
        onOk={onOk}
        onCancel={onCancel}
        className="peopleCountingFormModal"
      />
    </>
  );
};

export default PeopleCountingEditModal;
