// ไฟล์: src/modules/juristicManagement/components/JuristicManageCreateModal.tsx

import { useState } from "react";
import { Form, Col, Row, Select, Modal, Input, Spin } from "antd";
import { requiredRule, emailRule, telRule } from "../../../configs/inputRule";
import { getJuristicRoleQuery } from "../../../utils/queriesGroup/juristicQueries";
import { JuristicAddNew } from "../../../stores/interfaces/JuristicManage";
import ConfirmModal from "../../../components/common/ConfirmModal";
import SmallButton from "../../../components/common/SmallButton";
import { useDispatch } from "react-redux";
import { Dispatch } from "../../../stores";
import { postCreateJuristicMutation } from "../../../utils/mutationsGroup/juristicMutations";

type ManagementCreateModalType = {
  isCreateModalOpen: boolean;
  onCancel: () => void;
  refetch: () => void;
};

const JuristicManageCreateModal = ({
  isCreateModalOpen,
  onCancel,
  refetch,
}: ManagementCreateModalType) => {
  const dispatch = useDispatch<Dispatch>();
  const [juristicForm] = Form.useForm();
  const { data: roleData, isLoading: roleLoading } = getJuristicRoleQuery();

  // ใช้ mutations
  const createJuristicMutation = postCreateJuristicMutation();

  const onCancelHandler = async () => {
    juristicForm.resetFields();
    onCancel();
  };

  const onFinish = async (values: JuristicAddNew) => {
    console.log("Form values:", values);
    showAddConfirm(values);
  };

  const showAddConfirm = (value: JuristicAddNew) => {
    ConfirmModal({
      title: "You confirm the information?",
      okMessage: "Yes",
      cancelMessage: "Cancel",
      onOk: async () => {
        createJuristicMutation.mutate(value, {
          onSuccess: async (res) => {
            console.log("Create invitation successful:", res.data);

            // ตรวจสอบโครงสร้างของ response สำหรับ QR Code
            if (res.data?.data?.qrCode) {
              dispatch.juristic.updateQrCodeState(res.data.data.qrCode);
            } else if (res.data?.qrCode) {
              dispatch.juristic.updateQrCodeState(res.data.qrCode);
            }

            refetch();
            onCancelHandler();
          },
          onError: (error: any) => {
            console.error("Create failed:", error);
          },
        });
      },
      onCancel: () => {
        console.log("Cancel");
      },
    });
  };

  const isLoading = createJuristicMutation.isPending;

  const ModalContent = () => {
    return (
      <Form
        form={juristicForm}
        name="juristicCreateModal"
        className="managementFormContainer"
        labelCol={{ span: 24 }}
        wrapperCol={{ span: 24 }}
        initialValues={{ remember: true }}
        autoComplete="off"
        layout="vertical"
        onFinish={onFinish}
        onFinishFailed={(errorInfo) => {
          console.log("FINISHED FAILED:", errorInfo);
        }}>
        <Row gutter={[24, 16]}>
          {/* Left Column */}
          <Col xs={24} md={12}>
            <Row gutter={[16, 0]}>
              {/* First Name */}
              <Col span={24}>
                <Form.Item<JuristicAddNew>
                  label="First Name"
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

              <Col span={24}>
                <Form.Item<JuristicAddNew>
                  label="Middle name"
                  name="middleName">
                  <Input
                    size="large"
                    placeholder="Please input middle Name"
                    maxLength={120}
                    showCount
                  />
                </Form.Item>
              </Col>

              {/* Last Name */}
              <Col span={24}>
                <Form.Item<JuristicAddNew>
                  label="Last Name"
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
              {/* Mobile no. */}
              <Col span={24}>
                <Form.Item<JuristicAddNew>
                  label="Mobile no."
                  name="contact"
                  rules={telRule}>
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
                <Form.Item<JuristicAddNew>
                  label="Role"
                  name="roleId"
                  rules={requiredRule}>
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
                    options={roleData || []}
                    showSearch
                    filterOption={(input, option) =>
                      (option?.name ?? "")
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                  />
                </Form.Item>
              </Col>

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
        open={isCreateModalOpen}
        title="Add admin management"
        centered={true}
        width={"90%"}
        style={{ maxWidth: 800 }}
        footer={[
          <div key="footer" style={{ textAlign: "right" }}>
            <SmallButton
              className="saveButton"
              form={juristicForm}
              formSubmit={juristicForm.submit}
              message={isLoading ? "Adding..." : "Add new"}
              disabled={isLoading}
            />
          </div>,
        ]}
        onOk={() => {}}
        onCancel={onCancelHandler}
        className="managementFormModal"
        confirmLoading={isLoading}>
        <ModalContent />
      </Modal>
    </>
  );
};

export default JuristicManageCreateModal;
