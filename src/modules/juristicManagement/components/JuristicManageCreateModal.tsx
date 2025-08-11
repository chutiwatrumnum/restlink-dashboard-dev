import { useState, useEffect } from "react";
import { Form, Col, Row, Select, Modal, Input, Upload, Spin } from "antd";
import { requiredRule, emailRule, telRule } from "../../../configs/inputRule";
import { getJuristicRoleQuery } from "../../../utils/queriesGroup/juristicQueries";
import { JuristicAddNew } from "../../../stores/interfaces/JuristicManage";
import ConfirmModal from "../../../components/common/ConfirmModal";
import SmallButton from "../../../components/common/SmallButton";
import { postCreateJuristicMutation } from "../../../utils/mutationsGroup/juristicMutations";
import { useDispatch } from "react-redux";
import { Dispatch } from "../../../stores";
import type { UploadFile, UploadProps } from "antd/es/upload/interface";

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
  const createJuristicMutation = postCreateJuristicMutation();
  const [imageUrl, setImageUrl] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onCancelHandler = async () => {
    juristicForm.resetFields();
    setImageUrl("");
    setIsSubmitting(false);
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
        try {
          setIsSubmitting(true);

          const payload = {
            ...value,
            image: imageUrl || undefined,
          };

          console.log("Sending payload:", payload);

          const res = await createJuristicMutation.mutateAsync(payload);
          console.log("RESULT DATA : ", res);

          // ตรวจสอบโครงสร้างของ response
          if (res.data?.data?.qrCode) {
            dispatch.juristic.updateQrCodeState(res.data.data.qrCode);
          } else if (res.data?.qrCode) {
            dispatch.juristic.updateQrCodeState(res.data.qrCode);
          }

          refetch();
          onCancelHandler();
        } catch (err) {
          console.log("Create juristic error:", err);
        } finally {
          setIsSubmitting(false);
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

  // Handle image change from UploadImageGroup
  const handleImageChange = (url: string) => {
    setImageUrl(url);
  };

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
          <Col xs={24} md={14}>
            <Row gutter={[16, 0]}>
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
            </Row>
          </Col>

          {/* Right Column */}
          <Col xs={24} md={10}>
            <Row gutter={[16, 0]}>
              <Col span={24}>
                {/* Image Upload Section */}
                <Form.Item label="Image">
                  <div
                    style={{
                      border: "2px dashed #d9d9d9",
                      borderRadius: "6px",
                      padding: "30px 20px",
                      textAlign: "center",
                      cursor: "pointer",
                      minHeight: "240px",
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
                          background: imageUrl
                            ? "rgba(0,0,0,0.5)"
                            : "transparent",
                          padding: imageUrl ? "8px 16px" : "0",
                          borderRadius: "4px",
                        }}>
                        <div
                          style={{
                            width: "48px",
                            height: "48px",
                            margin: "0 auto 8px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}>
                          <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="currentColor">
                            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                          </svg>
                        </div>
                        <p style={{ margin: 0, fontSize: "14px" }}>
                          Upload your photo
                        </p>
                      </div>
                    </Upload>

                    <p
                      style={{
                        margin: "8px 0 0 0",
                        fontSize: "12px",
                        color: imageUrl ? "#fff" : "#999",
                        background: imageUrl
                          ? "rgba(0,0,0,0.5)"
                          : "transparent",
                        padding: imageUrl ? "4px 8px" : "0",
                        borderRadius: "4px",
                      }}>
                      *File size &lt;1MB 1920X1080 px, *JPGs
                    </p>
                  </div>
                </Form.Item>
              </Col>

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
              message={isSubmitting ? "Adding..." : "Add new"}
              disabled={isSubmitting}
            />
          </div>,
        ]}
        onOk={() => {}}
        onCancel={onCancelHandler}
        className="managementFormModal"
        confirmLoading={isSubmitting}>
        <ModalContent />
      </Modal>
    </>
  );
};

export default JuristicManageCreateModal;
