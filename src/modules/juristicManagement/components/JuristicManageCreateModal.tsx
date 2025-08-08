import { useState, useRef, useEffect } from "react";
import {
  Form,
  Col,
  Row,
  Select,
  Modal,
  Input,
  Upload,
  Button,
  Spin,
  Alert,
} from "antd";
import { requiredRule, emailRule, telRule } from "../../../configs/inputRule";
import { getJuristicRoleQuery } from "../../../utils/queriesGroup/juristicQueries";
import { JuristicAddNew } from "../../../stores/interfaces/JuristicManage";
import ConfirmModal from "../../../components/common/ConfirmModal";
import SmallButton from "../../../components/common/SmallButton";
import { postCreateJuristicMutation } from "../../../utils/mutationsGroup/juristicMutations";
import { useDispatch } from "react-redux";
import { Dispatch } from "../../../stores";
import { UploadOutlined, ReloadOutlined } from "@ant-design/icons";
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
  const {
    data: roleData,
    isLoading: roleLoading,
    error: roleError,
    refetch: refetchRoles,
  } = getJuristicRoleQuery();
  const createJuristicMutation = postCreateJuristicMutation();
  const [imageUrl, setImageUrl] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Debug role data
  useEffect(() => {
    console.log("=== Role Debug Info ===");
    console.log("Role Data:", roleData);
    console.log("Role Loading:", roleLoading);
    console.log("Role Error:", roleError);
    console.log("Role Data Type:", typeof roleData);
    console.log(
      "Role Data Length:",
      Array.isArray(roleData) ? roleData.length : "Not an array"
    );
    console.log("========================");
  }, [roleData, roleLoading, roleError]);

  const onCancelHandler = async () => {
    juristicForm.resetFields();
    setImageUrl("");
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
        const payload = {
          ...value,
          image: imageUrl || undefined, // เพิ่ม image ถ้ามี
        };

        console.log("Sending payload:", payload);

        await createJuristicMutation
          .mutateAsync(payload)
          .then((res) => {
            console.log("RESULT DATA : ", res);
            // ตรวจสอบโครงสร้างของ response
            if (res.data?.data?.qrCode) {
              dispatch.juristic.updateQrCodeState(res.data.data.qrCode);
            } else if (res.data?.qrCode) {
              dispatch.juristic.updateQrCodeState(res.data.qrCode);
            }
            refetch();
          })
          .catch((err) => {
            console.log("Create juristic error:", err);
          })
          .finally(() => {
            onCancelHandler();
          });
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

  // Handle role refresh
  const handleRefreshRoles = () => {
    console.log("Refreshing roles...");
    refetchRoles();
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
        <Row gutter={[16, 0]}>
          {/* Left Column */}
          <Col xs={24} sm={12} md={12}>
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

            <Form.Item<JuristicAddNew>
              label={
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  Role
                  <Button
                    type="text"
                    size="small"
                    icon={<ReloadOutlined />}
                    onClick={handleRefreshRoles}
                    loading={roleLoading}
                    title="Refresh roles"
                  />
                </div>
              }
              name="roleId"
              rules={requiredRule}>
              <Select
                placeholder={roleLoading ? "Loading roles..." : "Select role"}
                size="large"
                loading={roleLoading}
                notFoundContent={
                  roleLoading ? (
                    <div style={{ textAlign: "center", padding: "20px" }}>
                      <Spin size="small" />
                      <div style={{ marginTop: "8px" }}>Loading...</div>
                    </div>
                  ) : roleError ? (
                    <div
                      style={{
                        textAlign: "center",
                        padding: "20px",
                        color: "#ff4d4f",
                      }}>
                      <div style={{ marginBottom: "8px" }}>⚠️</div>
                      <div>Error loading roles</div>
                      <Button
                        size="small"
                        type="link"
                        onClick={handleRefreshRoles}>
                        Try again
                      </Button>
                    </div>
                  ) : (
                    <div style={{ textAlign: "center", padding: "20px" }}>
                      <div style={{ marginBottom: "8px" }}>📭</div>
                      <div>No data</div>
                      <Button
                        size="small"
                        type="link"
                        onClick={handleRefreshRoles}>
                        Refresh
                      </Button>
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
                onFocus={() => {
                  // Refetch when dropdown is opened if no data
                  if (!roleData || roleData.length === 0) {
                    refetchRoles();
                  }
                }}
              />
            </Form.Item>
          </Col>

          {/* Right Column */}
          <Col xs={24} sm={12} md={12}>
            {/* Image Upload Section */}
            <Form.Item label="Image">
              <div
                style={{
                  border: "2px dashed #d9d9d9",
                  borderRadius: "6px",
                  padding: "40px 20px",
                  textAlign: "center",
                  cursor: "pointer",
                  minHeight: "200px",
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
                    background: imageUrl ? "rgba(0,0,0,0.5)" : "transparent",
                    padding: imageUrl ? "4px 8px" : "0",
                    borderRadius: "4px",
                  }}>
                  *File size &lt;1MB 1920X1080 px, *JPGs
                </p>
              </div>
            </Form.Item>

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

        {/* Debug Info - แสดงเฉพาะใน development หรือเมื่อมี error */}
        {(process.env.NODE_ENV === "development" || roleError) && (
          <Alert
            message="Debug Information"
            description={
              <div style={{ fontSize: "12px", fontFamily: "monospace" }}>
                <div>
                  <strong>API Endpoint:</strong>{" "}
                  /api/v1.0/team-management/invitation/juristic/role
                </div>
                <div>
                  <strong>Role Loading:</strong> {roleLoading ? "Yes" : "No"}
                </div>
                <div>
                  <strong>Role Data Length:</strong> {roleData?.length || 0}
                </div>
                <div>
                  <strong>Role Error:</strong> {roleError ? "Yes" : "No"}
                </div>
                {roleError && (
                  <div>
                    <strong>Error Details:</strong>{" "}
                    {JSON.stringify(roleError, null, 2)}
                  </div>
                )}
                {roleData && roleData.length > 0 && (
                  <div>
                    <strong>Sample Role:</strong>{" "}
                    {JSON.stringify(roleData[0], null, 2)}
                  </div>
                )}
                <div style={{ marginTop: "8px" }}>
                  <Button size="small" onClick={handleRefreshRoles}>
                    Refresh Roles
                  </Button>
                </div>
              </div>
            }
            type={roleError ? "error" : "info"}
            style={{ marginTop: "16px" }}
            closable
          />
        )}
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
          <div key="footer" style={{ textAlign: "center" }}>
            <SmallButton
              className="saveButton"
              style={{
                width: "200px",
                background: "#666",
                borderColor: "#666",
              }}
              form={juristicForm}
              formSubmit={juristicForm.submit}
              message="Add new"
            />
          </div>,
        ]}
        onOk={() => {}}
        onCancel={onCancelHandler}
        className="managementFormModal">
        <ModalContent />
      </Modal>
    </>
  );
};

export default JuristicManageCreateModal;
