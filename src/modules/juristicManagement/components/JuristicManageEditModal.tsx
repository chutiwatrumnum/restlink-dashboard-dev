import { useEffect, useState, useRef } from "react";
import { Form, Input, Col, Row, Modal, Select, Upload } from "antd";
import { requiredRule, emailRule, telRule } from "../../../configs/inputRule";

import SmallButton from "../../../components/common/SmallButton";

import { JuristicAddNew } from "../../../stores/interfaces/JuristicManage";
import { editdatajuristic } from "../service/api/JuristicServiceAPI";
import SuccessModal from "../../../components/common/SuccessModal";
import FailedModal from "../../../components/common/FailedModal";
import ConfirmModal from "../../../components/common/ConfirmModal";
import { getJuristicRoleQuery } from "../../../utils/queriesGroup/juristicQueries";

import { JuristicManageDataType } from "../../../stores/interfaces/JuristicManage";
import type { UploadProps } from "antd/es/upload/interface";

type ManagementEditModalType = {
  isEditModalOpen: boolean;
  callBack: (isOpen: boolean, saved: boolean) => void;
  data: JuristicManageDataType;
};

const JuristicManageEditModal = ({
  isEditModalOpen,
  callBack,
  data,
}: ManagementEditModalType) => {
  const [juristicManageForm] = Form.useForm();
  const [imageUrl, setImageUrl] = useState<string>("");

  // Data
  const { data: roleData } = getJuristicRoleQuery();

  const onClose = async () => {
    juristicManageForm.resetFields();
    setImageUrl("");
    callBack(!open, false);
  };

  const onFinish = async (values: JuristicAddNew) => {
    const payload: JuristicAddNew = {
      firstName: values.firstName,
      lastName: values.lastName,
      middleName: values.middleName,
      roleId: values.roleId,
      contact: values.contact,
      email: values.email,
      ...(imageUrl && { image: imageUrl }),
    };
    console.log(data.userId, payload);
    showEditConfirm(data.userId, payload);
  };

  const showEditConfirm = (userId: string, payload: JuristicAddNew) => {
    ConfirmModal({
      title: "You confirm the information?",
      okMessage: "Yes",
      cancelMessage: "Cancel",
      onOk: async () => {
        const resultedit = await editdatajuristic(userId, payload);
        if (resultedit) {
          SuccessModal("Successfully updated");
          juristicManageForm.resetFields();
          setImageUrl("");
          callBack(!open, true);
        } else {
          FailedModal("Failed to update");
        }
      },
      onCancel: () => {
        console.log("Cancel");
      },
    });
  };

  // Handle image upload
  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setImageUrl(result);
    };
    reader.readAsDataURL(file);
    return false; // Prevent default upload behavior
  };

  const uploadProps: UploadProps = {
    name: "file",
    beforeUpload: handleImageUpload,
    showUploadList: false,
    accept: "image/*",
  };

  useEffect(() => {
    if (isEditModalOpen && data) {
      juristicManageForm.setFieldsValue({
        firstName: data?.firstName || data?.givenName,
        middleName: data?.middleName ?? "",
        lastName: data?.lastName || data?.familyName,
        contact: data?.contact,
        email: data?.email,
        roleId: data?.role.id,
      });

      // Set existing image if available
      if (data?.image) {
        setImageUrl(data.image);
      }
    }

    return () => {
      if (!isEditModalOpen) {
        juristicManageForm.resetFields();
        setImageUrl("");
      }
    };
  }, [isEditModalOpen, data]);

  const ModalContent = () => {
    return (
      <Form
        form={juristicManageForm}
        name="juristicEditModal"
        initialValues={{ remember: true }}
        autoComplete="off"
        layout="vertical"
        onFinish={onFinish}
        onFinishFailed={() => {
          console.log("FINISHED FAILED");
        }}>
        <Row gutter={16}>
          <Col sm={{ span: 12 }} xs={{ span: 24 }}>
            <Form.Item<JuristicAddNew>
              label="First name"
              name="firstName"
              rules={requiredRule}>
              <Input
                size="large"
                placeholder="Please input first name"
                maxLength={120}
                showCount
              />
            </Form.Item>
            <Form.Item<JuristicAddNew> label="Middle name" name="middleName">
              <Input
                size="large"
                placeholder="Please input middle name"
                maxLength={120}
                showCount
              />
            </Form.Item>
            <Form.Item<JuristicAddNew>
              label="Last name"
              name="lastName"
              rules={requiredRule}>
              <Input
                size="large"
                placeholder="Please input last name"
                maxLength={120}
                showCount
              />
            </Form.Item>
          </Col>
          <Col sm={{ span: 12 }} xs={{ span: 24 }}>
            {/* Image Upload Section */}
            <Form.Item label="Image">
              <div
                style={{
                  border: "2px dashed #d9d9d9",
                  borderRadius: "6px",
                  padding: "20px",
                  textAlign: "center",
                  cursor: "pointer",
                  minHeight: "120px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  background: imageUrl
                    ? `url(${imageUrl}) center/cover`
                    : "#fafafa",
                  position: "relative",
                }}>
                <Upload {...uploadProps}>
                  <div
                    style={{
                      color: imageUrl ? "#fff" : "#999",
                      background: imageUrl ? "rgba(0,0,0,0.5)" : "transparent",
                      padding: imageUrl ? "8px 16px" : "0",
                      borderRadius: "4px",
                    }}>
                    <div
                      style={{
                        width: "32px",
                        height: "32px",
                        margin: "0 auto 8px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}>
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="currentColor">
                        <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                      </svg>
                    </div>
                    <p style={{ margin: 0, fontSize: "12px" }}>Upload photo</p>
                  </div>
                </Upload>
              </div>
            </Form.Item>

            <Form.Item<JuristicAddNew>
              label="Phone number"
              name="contact"
              rules={telRule}>
              <Input
                size="large"
                placeholder="Please input phone number"
                maxLength={10}
                showCount
              />
            </Form.Item>
            <Form.Item<JuristicAddNew>
              label="Role"
              name="roleId"
              rules={requiredRule}>
              <Select
                placeholder="Select a role"
                options={roleData}
                size="large"
                fieldNames={{ label: "name", value: "id" }}
              />
            </Form.Item>
            <Form.Item<JuristicAddNew>
              label="Email"
              name="email"
              rules={emailRule}>
              <Input
                size="large"
                placeholder="Please input email"
                maxLength={120}
                showCount
                disabled={true}
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  };

  return (
    <>
      <Modal
        open={isEditModalOpen}
        title="Edit user"
        centered={true}
        width={"90%"}
        style={{ minWidth: 400, maxWidth: 900 }}
        footer={[
          <SmallButton
            key="submit"
            className="saveButton"
            form={juristicManageForm}
            formSubmit={juristicManageForm.submit}
            message="Update"
          />,
        ]}
        onCancel={onClose}
        className="managementFormModal">
        <ModalContent />
      </Modal>
    </>
  );
};

export default JuristicManageEditModal;
