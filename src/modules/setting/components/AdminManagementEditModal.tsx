import { useState, useEffect } from "react";
import { Form, Input, Row } from "antd";
import { requiredRule, telRule } from "../../../configs/inputRule";

import UploadImageGroup from "../../../components/group/UploadImageGroup";
import FormModal from "../../../components/common/FormModal";
import SmallButton from "../../../components/common/SmallButton";

import { AdminTableDataType } from "../../../stores/interfaces/Setting";

type AdminManagementEditModalType = {
  isEditModalOpen: boolean;
  onOk: () => void;
  onCancel: () => void;
  data: AdminTableDataType;
};

const AdminManagementEditModal = ({
  isEditModalOpen,
  onOk,
  onCancel,
  data,
}: AdminManagementEditModalType) => {
  const [open, setOpen] = useState(false);
  const [adminForm] = Form.useForm();
  const [previewImage, setPreviewImage] = useState("");

  useEffect(() => {
    setOpen(isEditModalOpen);
  }, [isEditModalOpen]);

  useEffect(() => {
    if (data) {
      setPreviewImage(data.image ?? "");
      adminForm.setFieldsValue({
        image: data.image,
        displayName: data.displayName,
        actualName: data.actualName,
        email: data.email,
        role: data.role,
        tel: data.tel,
      });
    }
  }, [data]);

  const ModalContent = () => {
    return (
      <Form
        name="AdminManagementEditModal"
        form={adminForm}
        initialValues={{ remember: true }}
        autoComplete="off"
        layout="vertical"
        onFinish={(value) => {
          console.log("FINISHED", value);
        }}
        onFinishFailed={() => {
          console.log("FINISHED FAILED");
        }}>
        <div className="adminModalColumn">
          <div className="adminModalContainer">
            <div className="adminModalColumn">
              <Form.Item<AdminTableDataType>
                label="Image"
                name="image"
                rules={requiredRule}>
                <UploadImageGroup
                  onChange={() => {}}
                  image={previewImage}
                  height={260}
                />
              </Form.Item>
              <Form.Item<AdminTableDataType>
                label="Display name"
                name="displayName"
                rules={requiredRule}>
                <Input
                  size="large"
                  placeholder="Please input name"
                  maxLength={120}
                  showCount
                />
              </Form.Item>
              <Form.Item<AdminTableDataType>
                label="Actual name"
                name="actualName"
                rules={requiredRule}>
                <Input
                  size="large"
                  placeholder="Please input name"
                  maxLength={120}
                  showCount
                />
              </Form.Item>
              <Form.Item<AdminTableDataType>
                label="Tel."
                name="tel"
                rules={telRule}>
                <Input
                  size="large"
                  placeholder="Please input tel"
                  maxLength={20}
                />
              </Form.Item>
              <Row justify="space-between">
                <Form.Item<AdminTableDataType>
                  label="Email address*"
                  name="email"
                  rules={requiredRule}
                  style={{ width: "48%" }}>
                  <Input
                    size="large"
                    placeholder="Please input email address"
                    maxLength={120}
                    showCount
                  />
                </Form.Item>
                <Form.Item<AdminTableDataType>
                  label="role"
                  name="role"
                  rules={requiredRule}
                  style={{ width: "48%" }}>
                  <Input size="large" placeholder="Select role" />
                </Form.Item>
              </Row>
            </div>
          </div>
          <SmallButton className="saveButton" message="Add" />
        </div>
      </Form>
    );
  };

  return (
    <>
      <FormModal
        isOpen={open}
        title="Edit Admin"
        content={<ModalContent />}
        onOk={onOk}
        onCancel={onCancel}
        className="adminFormModal"
      />
    </>
  );
};

export default AdminManagementEditModal;
