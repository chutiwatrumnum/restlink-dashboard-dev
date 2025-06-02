import { useState, useEffect } from "react";
import { Form, Input } from "antd";
import { requiredRule, telRule } from "../../../configs/inputRule";
import { useDispatch } from "react-redux";
import { Dispatch } from "../../../stores";

import UploadImageGroup from "../../../components/group/UploadImageGroup";
import FormModal from "../../../components/common/FormModal";
import SmallButton from "../../../components/common/SmallButton";
import ConfirmModal from "../../../components/common/ConfirmModal";
import { DataEmergencyCreateByType } from "../../../stores/interfaces/Emergency";

type EmergencyCreateModalType = {
  isCreateModalOpen: boolean;
  onOk: () => void;
  onCancel: () => void;
  onRefresh: () => void;
};

const EmergencyCreateModal = ({
  isCreateModalOpen,
  onOk,
  onCancel,
  onRefresh,
}: EmergencyCreateModalType) => {
  const dispatch = useDispatch<Dispatch>();
  const [form] = Form.useForm();
  const [open, setOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");

  const onModalClose = () => {
    form.resetFields();
    setPreviewImage("");
    onCancel();
  };

  useEffect(() => {
    setOpen(isCreateModalOpen);
  }, [isCreateModalOpen]);

  const handleFormSubmit = async (value: DataEmergencyCreateByType) => {
    ConfirmModal({
      title: "You confirm the information?",
      okMessage: "Yes",
      cancelMessage: "Cancel",
      onOk: async () => {
        const payload: DataEmergencyCreateByType = {
          ...value,
        };

        payload.image = value.image || null;

        const result = await dispatch.emergency.addNewEmergencyService(payload);

        if (result) {
          form.resetFields();
          setPreviewImage("");
          onOk();
          onRefresh();
        }
      },
    });
  };

  const handleFormFailed = () => {
    console.log("FINISHED FAILED");
  };

  const renderModalContent = () => {
    return (
      <Form
        form={form}
        name="emergencyCreateModal"
        initialValues={{ remember: true }}
        autoComplete="off"
        layout="vertical"
        onFinish={handleFormSubmit}
        onFinishFailed={handleFormFailed}
        className="emergency-form">
        <div className="form-container">
          <Form.Item<DataEmergencyCreateByType>
            label="Image"
            name="image"
            >
            <UploadImageGroup
              onChange={(url) => setPreviewImage(url)}
              image={previewImage}
              ratio="1920x1080 px"
            />
          </Form.Item>

          <Form.Item<DataEmergencyCreateByType>
            label="Name"
            name="name"
            rules={requiredRule}>
            <Input
              size="large"
              placeholder="Please input name"
              maxLength={120}
              showCount
            />
          </Form.Item>

          <Form.Item<DataEmergencyCreateByType>
            label="Tel."
            name="tel"
            rules={telRule}>
            <Input
              size="large"
              placeholder="Please input tel"
              maxLength={10}
              showCount
            />
          </Form.Item>

          <div className="button-container">
            <SmallButton className="saveButton" message="Save" form={form} />
          </div>
        </div>
      </Form>
    );
  };

  return (
    <FormModal
      isOpen={open}
      title="Add contact lists"
      content={renderModalContent()}
      onOk={onOk}
      onCancel={onModalClose}
      className="emergencyFormModal"
    />
  );
};

export default EmergencyCreateModal;