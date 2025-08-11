// ไฟล์: src/modules/juristicManagement/components/JuristicManageEditModal.tsx

import { useEffect, useState } from "react";
import { Form, Input, Col, Row, Modal, Select } from "antd";
import { requiredRule, emailRule, telRule } from "../../../configs/inputRule";
import SmallButton from "../../../components/common/SmallButton";
import { JuristicAddNew } from "../../../stores/interfaces/JuristicManage";
import ConfirmModal from "../../../components/common/ConfirmModal";
import { getJuristicRoleQuery } from "../../../utils/queriesGroup/juristicQueries";
import { JuristicManageDataType } from "../../../stores/interfaces/JuristicManage";
import { useEditJuristicMutation } from "../../../utils/mutationsGroup/juristicMutations";

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

  // ใช้ mutations
  const editJuristicMutation = useEditJuristicMutation();

  // Data
  const { data: roleData } = getJuristicRoleQuery();

  const onClose = async () => {
    juristicManageForm.resetFields();
    callBack(!open, false);
  };

  const onFinish = async (values: JuristicAddNew) => {
    const payload = {
      givenName: values.firstName,
      familyName: values.lastName,
      middleName: values.middleName || "",
      contact: values.contact,
      roleId: values.roleId,
    };

    console.log(data.userId, payload);
    showEditConfirm(data.userId, payload);
  };

  const showEditConfirm = (userId: string, payload: any) => {
    ConfirmModal({
      title: "You confirm the information?",
      okMessage: "Yes",
      cancelMessage: "Cancel",
      onOk: async () => {
        // ใช้ mutation แทน API call
        editJuristicMutation.mutate(
          { userId, payload },
          {
            onSuccess: async () => {
              closeModal();
            },
            onError: () => {
              // error จะแสดงจาก mutation แล้ว
            },
          }
        );
      },
      onCancel: () => {
        console.log("Cancel");
      },
    });
  };

  const closeModal = () => {
    juristicManageForm.resetFields();
    callBack(!open, true);
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
    }

    return () => {
      if (!isEditModalOpen) {
        juristicManageForm.resetFields();
      }
    };
  }, [isEditModalOpen, data]);

  const isLoading = editJuristicMutation.isPending;

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
        <Row gutter={[24, 16]}>
          {/* Left Column */}
          <Col xs={24} md={12}>
            <Row gutter={[16, 0]}>
              {/* First name */}
              <Col span={24}>
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
              </Col>

              {/* Middle name */}
              <Col span={24}>
                <Form.Item<JuristicAddNew>
                  label="Middle name"
                  name="middleName">
                  <Input
                    size="large"
                    placeholder="Please input middle name"
                    maxLength={120}
                    showCount
                  />
                </Form.Item>
              </Col>

              {/* Last name */}
              <Col span={24}>
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
            </Row>
          </Col>

          {/* Right Column */}
          <Col xs={24} md={12}>
            <Row gutter={[16, 0]}>
              {/* Phone number */}
              <Col span={24}>
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
              </Col>

              {/* Role */}
              <Col span={24}>
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
              </Col>
            </Row>

            {/* Email */}
            <Col span={24}>
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
          <div key="footer" style={{ textAlign: "right" }}>
            <SmallButton
              key="submit"
              className="saveButton"
              form={juristicManageForm}
              formSubmit={juristicManageForm.submit}
              message={isLoading ? "Updating..." : "Update"}
              disabled={isLoading}
            />
          </div>,
        ]}
        onCancel={onClose}
        className="managementFormModal"
        confirmLoading={isLoading}>
        <ModalContent />
      </Modal>
    </>
  );
};

export default JuristicManageEditModal;
