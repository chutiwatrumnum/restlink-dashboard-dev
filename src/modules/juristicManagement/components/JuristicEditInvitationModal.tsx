// File: src/modules/juristicManagement/components/JuristicEditInvitationModal.tsx

import { useEffect } from "react";
import { Form, Col, Row, Select, Modal, Input, Spin } from "antd";
import { requiredRule, emailRule, telRule } from "../../../configs/inputRule";
import { getJuristicRoleQuery } from "../../../utils/queriesGroup/juristicQueries";
import {
  JuristicInvitationEditPayload,
  InvitationsDataType,
} from "../../../stores/interfaces/JuristicManage";
import ConfirmModal from "../../../components/common/ConfirmModal";
import SmallButton from "../../../components/common/SmallButton";
import { useDispatch } from "react-redux";
import { Dispatch } from "../../../stores";
import { useUpdateJuristicInvitationMutation } from "../../../utils/mutationsGroup/juristicMutations";

// Types
export type ManagementEditModalProps = {
  isEditModalOpen: boolean;
  onCancel: () => void;
  refetch: () => void;
  editData: InvitationsDataType;
};

const JuristicEditInvitationModal = ({
  isEditModalOpen,
  onCancel,
  refetch,
  editData,
}: ManagementEditModalProps) => {
  const [juristicForm] = Form.useForm<JuristicInvitationEditPayload>();
  const { data: roleData, isLoading: roleLoading } = getJuristicRoleQuery();

  // === use mutations ===
  const editInvitationMutation = useUpdateJuristicInvitationMutation();

  const onCancelHandler = async () => {
    juristicForm.resetFields();
    onCancel();
  };

  // Pre-fill data เมื่อเปิด modal
  useEffect(() => {
    if (isEditModalOpen) {
      const d = editData;
      const curRoleId = roleData.find(
        (item: any) => item.name === editData.role.name
      );
      juristicForm.setFieldsValue({
        firstName: d.firstName ?? "",
        middleName: d.middleName ?? "",
        lastName: d.lastName ?? "",
        contact: d.contact ?? "",
        roleId: curRoleId.id,
        email: d.email ?? "",
      });
    } else {
      juristicForm.resetFields();
    }
  }, [isEditModalOpen, editData, juristicForm]);

  const onFinish = async (values: JuristicInvitationEditPayload) => {
    const payload: JuristicInvitationEditPayload = {
      id: editData.id,
      roleId: values.roleId,
      firstName: values.firstName,
      middleName: values.middleName ?? "",
      lastName: values.lastName,
      contact: values.contact,
    } as JuristicInvitationEditPayload;

    showEditConfirm(payload);
  };

  const showEditConfirm = (payload: JuristicInvitationEditPayload) => {
    ConfirmModal({
      title: "Save changes?",
      okMessage: "Yes",
      cancelMessage: "Cancel",
      onOk: async () => {
        console.log(payload);
        editInvitationMutation.mutateAsync(payload).then(() => {
          refetch();
          onCancelHandler();
        });
      },
      onCancel: () => {
        // no-op
      },
    });
  };

  const isLoading = editInvitationMutation.isPending;

  const ModalContent = () => {
    return (
      <Form<JuristicInvitationEditPayload>
        form={juristicForm}
        name="juristicEditModal"
        className="managementFormContainer"
        labelCol={{ span: 24 }}
        wrapperCol={{ span: 24 }}
        initialValues={{ remember: true }}
        autoComplete="off"
        layout="vertical"
        onFinish={onFinish}
        onFinishFailed={(errorInfo) => {
          console.log("FINISHED FAILED:", errorInfo);
        }}
      >
        <Row gutter={[24, 16]}>
          {/* Left Column */}
          <Col xs={24} md={12}>
            <Row gutter={[16, 0]}>
              {/* First Name */}
              <Col span={24}>
                <Form.Item<JuristicInvitationEditPayload>
                  label="First Name"
                  name="firstName"
                  rules={requiredRule}
                >
                  <Input
                    size="large"
                    placeholder="Please input first name"
                    maxLength={120}
                    showCount
                  />
                </Form.Item>
              </Col>

              {/* Middle Name */}
              <Col span={24}>
                <Form.Item<JuristicInvitationEditPayload>
                  label="Middle name"
                  name="middleName"
                >
                  <Input
                    size="large"
                    placeholder="Please input middle name"
                    maxLength={120}
                    showCount
                  />
                </Form.Item>
              </Col>

              {/* Last Name */}
              <Col span={24}>
                <Form.Item<JuristicInvitationEditPayload>
                  label="Last Name"
                  name="lastName"
                  rules={requiredRule}
                >
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
              {/* Mobile no. */}
              <Col span={24}>
                <Form.Item<JuristicInvitationEditPayload>
                  label="Mobile no."
                  name="contact"
                  rules={telRule}
                >
                  <Input
                    size="large"
                    placeholder="Please input contact"
                    maxLength={10}
                    showCount
                  />
                </Form.Item>
              </Col>

              {/* Role */}
              <Col span={24}>
                <Form.Item<JuristicInvitationEditPayload>
                  label="Role"
                  name="roleId"
                  rules={requiredRule}
                >
                  <Select
                    placeholder={
                      roleLoading ? "Loading roles..." : "Select role"
                    }
                    size="large"
                    loading={roleLoading}
                    notFoundContent={
                      roleLoading ? (
                        <div style={{ textAlign: "center", padding: "20px" }}>
                          <Spin size="small" />
                          <div style={{ marginTop: "8px" }}>Loading...</div>
                        </div>
                      ) : (
                        <div style={{ textAlign: "center", padding: "20px" }}>
                          <div style={{ marginBottom: "8px" }}>📭</div>
                          <div>No data</div>
                        </div>
                      )
                    }
                    fieldNames={{ label: "name", value: "id" }}
                    options={(roleData as any[]) || []}
                    showSearch
                    filterOption={(input, option) =>
                      ((option as any)?.name ?? "")
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                  />
                </Form.Item>
              </Col>

              {/* Email */}
              <Col span={24}>
                <Form.Item<JuristicInvitationEditPayload>
                  label="Email"
                  name="email"
                  rules={emailRule}
                >
                  <Input
                    size="large"
                    placeholder="Please input email"
                    maxLength={120}
                    showCount
                    disabled
                  />
                </Form.Item>
              </Col>
            </Row>
          </Col>
        </Row>
      </Form>
    );
  };

  return (
    <>
      <Modal
        open={isEditModalOpen}
        title="Edit admin management"
        centered={true}
        width={"90%"}
        style={{ maxWidth: 800 }}
        footer={[
          <div key="footer" style={{ textAlign: "right" }}>
            <SmallButton
              className="saveButton"
              form={juristicForm}
              formSubmit={juristicForm.submit}
              message={isLoading ? "Saving..." : "Save changes"}
              disabled={isLoading}
            />
          </div>,
        ]}
        onOk={() => {}}
        onCancel={onCancelHandler}
        className="managementFormModal"
        confirmLoading={isLoading}
      >
        <ModalContent />
      </Modal>
    </>
  );
};

export default JuristicEditInvitationModal;
