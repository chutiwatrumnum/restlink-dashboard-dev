import { useState, useEffect } from "react";
import {
  Form,
  Col,
  Row,
  Select,
  Modal,
  Input,
  Upload,
  Spin,
  message,
} from "antd";
import { requiredRule, emailRule, telRule } from "../../../configs/inputRule";
import { getJuristicRoleQuery } from "../../../utils/queriesGroup/juristicQueries";
import { JuristicAddNew } from "../../../stores/interfaces/JuristicManage";
import ConfirmModal from "../../../components/common/ConfirmModal";
import SmallButton from "../../../components/common/SmallButton";
import { useDispatch } from "react-redux";
import { Dispatch } from "../../../stores";
import type { UploadFile, UploadProps } from "antd/es/upload/interface";

// *** ใช้ mutations แทน API functions ***
import {
  postCreateJuristicMutation,
  useUploadJuristicImageMutation,
  fileToBase64,
} from "../../../utils/mutationsGroup/juristicMutations";

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

  // *** ใช้ mutations ***
  const createJuristicMutation = postCreateJuristicMutation();
  const uploadImageMutation = useUploadJuristicImageMutation();

  const [imageUrl, setImageUrl] = useState<string>("");
  const [imageBase64, setImageBase64] = useState<string>("");

  const onCancelHandler = async () => {
    juristicForm.resetFields();
    setImageUrl("");
    setImageBase64("");
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
        // *** ใช้ mutation แทน API call ***
        createJuristicMutation.mutate(value, {
          onSuccess: async (res) => {
            console.log("Create invitation successful:", res.data);

            // Step 2: Upload image หลังจาก create สำเร็จแล้ว (ถ้ามี image)
            if (imageBase64) {
              uploadImageMutation.mutate(imageBase64, {
                onSuccess: () => {
                  message.success(
                    "Invitation created and image uploaded successfully!"
                  );
                  handleSuccess(res);
                },
                onError: () => {
                  message.warning("Invitation created but image upload failed");
                  handleSuccess(res);
                },
              });
            } else {
              message.success("Invitation created successfully!");
              handleSuccess(res);
            }
          },
          onError: (error: any) => {
            // error message จะแสดงจาก mutation แล้ว
            console.error("Create failed:", error);
          },
        });
      },
      onCancel: () => {
        console.log("Cancel");
      },
    });
  };

  const handleSuccess = (res: any) => {
    // ตรวจสอบโครงสร้างของ response สำหรับ QR Code
    if (res.data?.data?.qrCode) {
      dispatch.juristic.updateQrCodeState(res.data.data.qrCode);
    } else if (res.data?.qrCode) {
      dispatch.juristic.updateQrCodeState(res.data.qrCode);
    }

    refetch();
    onCancelHandler();
  };

  // Handle image upload
  const handleImageUpload = async (file: File) => {
    try {
      // แปลง File เป็น base64 สำหรับแสดงผล
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImageUrl(result);
      };
      reader.readAsDataURL(file);

      // แปลง File เป็น base64 สำหรับส่ง API
      const base64String = await fileToBase64(file);
      setImageBase64(base64String);

      console.log(
        "Image converted to base64:",
        base64String.substring(0, 50) + "..."
      );
    } catch (error) {
      console.error("Error converting image:", error);
      message.error("Failed to process image");
    }

    return false; // Prevent default upload behavior
  };

  const isLoading =
    createJuristicMutation.isPending || uploadImageMutation.isPending;

  const uploadProps: UploadProps = {
    name: "file",
    beforeUpload: handleImageUpload,
    showUploadList: false,
    accept: "image/*",
    disabled: isLoading,
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
                      backgroundColor: "#fafafa",
                      position: "relative",
                      backgroundImage: imageUrl ? `url(${imageUrl})` : "none",
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      backgroundRepeat: "no-repeat",
                    }}>
                    {/* Overlay เมื่อมีรูป */}
                    {imageUrl && (
                      <div
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          backgroundColor: "rgba(0,0,0,0.3)",
                          borderRadius: "4px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexDirection: "column",
                        }}
                      />
                    )}

                    <Upload {...uploadProps}>
                      <div
                        style={{
                          color: imageUrl ? "#fff" : "#999",
                          padding: "8px 16px",
                          borderRadius: "4px",
                          opacity: isLoading ? 0.6 : 1,
                          position: "relative",
                          zIndex: 1,
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
                          {uploadImageMutation.isPending ? (
                            <Spin size="large" />
                          ) : (
                            <svg
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="currentColor">
                              <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                            </svg>
                          )}
                        </div>
                        <p style={{ margin: 0, fontSize: "14px" }}>
                          {uploadImageMutation.isPending
                            ? "Uploading..."
                            : imageUrl
                            ? "Change photo"
                            : "Upload your photo"}
                        </p>
                      </div>
                    </Upload>

                    <p
                      style={{
                        margin: "8px 0 0 0",
                        fontSize: "12px",
                        color: imageUrl ? "#fff" : "#999",
                        position: "relative",
                        zIndex: 1,
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
              message={
                isLoading
                  ? uploadImageMutation.isPending
                    ? "Uploading image..."
                    : "Adding..."
                  : "Add new"
              }
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
