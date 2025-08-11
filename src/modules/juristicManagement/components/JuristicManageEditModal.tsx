import { useEffect, useState } from "react";
import {
  Form,
  Input,
  Col,
  Row,
  Modal,
  Select,
  Upload,
  Spin,
  message,
} from "antd";
import { requiredRule, emailRule, telRule } from "../../../configs/inputRule";
import SmallButton from "../../../components/common/SmallButton";
import { JuristicAddNew } from "../../../stores/interfaces/JuristicManage";
import ConfirmModal from "../../../components/common/ConfirmModal";
import { getJuristicRoleQuery } from "../../../utils/queriesGroup/juristicQueries";
import { JuristicManageDataType } from "../../../stores/interfaces/JuristicManage";
import type { UploadProps } from "antd/es/upload/interface";

// *** ใช้ mutations แทน API functions ***
import {
  useEditJuristicMutation,
  useUploadJuristicImageMutation,
  fileToBase64,
} from "../../../utils/mutationsGroup/juristicMutations";

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
  const [imageBase64, setImageBase64] = useState<string>("");
  const [hasImageChanged, setHasImageChanged] = useState(false);

  // *** ใช้ mutations ***
  const editJuristicMutation = useEditJuristicMutation();
  const uploadImageMutation = useUploadJuristicImageMutation();

  // Data
  const { data: roleData } = getJuristicRoleQuery();

  const onClose = async () => {
    juristicManageForm.resetFields();
    setImageUrl("");
    setImageBase64("");
    setHasImageChanged(false);
    callBack(!open, false);
  };

  const onFinish = async (values: JuristicAddNew) => {
    // แปลงค่าให้ตรงกับ API format
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
        // *** ใช้ mutation แทน API call ***
        editJuristicMutation.mutate(
          { userId, payload },
          {
            onSuccess: async () => {
              // ถ้ามีการเปลี่ยนรูป ให้ upload
              if (hasImageChanged && imageBase64) {
                uploadImageMutation.mutate(imageBase64, {
                  onSuccess: () => {
                    message.success(
                      "User information and image updated successfully!"
                    );
                    closeModal();
                  },
                  onError: () => {
                    message.warning(
                      "User information updated but image upload failed"
                    );
                    closeModal();
                  },
                });
              } else {
                // ไม่มีการเปลี่ยนรูป แค่แสดงข้อความสำเร็จ
                closeModal();
              }
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
    setImageUrl("");
    setImageBase64("");
    setHasImageChanged(false);
    callBack(!open, true);
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
      setHasImageChanged(true);

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

  const uploadProps: UploadProps = {
    name: "file",
    beforeUpload: handleImageUpload,
    showUploadList: false,
    accept: "image/*",
    disabled: editJuristicMutation.isPending || uploadImageMutation.isPending,
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
        setHasImageChanged(false);
      }
    }

    return () => {
      if (!isEditModalOpen) {
        juristicManageForm.resetFields();
        setImageUrl("");
        setImageBase64("");
        setHasImageChanged(false);
      }
    };
  }, [isEditModalOpen, data]);

  const isLoading =
    editJuristicMutation.isPending || uploadImageMutation.isPending;

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
          <Col xs={24} md={14}>
            <Row gutter={[16, 0]}>
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
                      minHeight: "200px",
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
                            width: "32px",
                            height: "32px",
                            margin: "0 auto 8px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}>
                          {uploadImageMutation.isPending ? (
                            <Spin size="small" />
                          ) : (
                            <svg
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="currentColor">
                              <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                            </svg>
                          )}
                        </div>
                        <p style={{ margin: 0, fontSize: "12px" }}>
                          {uploadImageMutation.isPending
                            ? "Uploading..."
                            : imageUrl
                            ? "Change photo"
                            : "Upload photo"}
                        </p>
                      </div>
                    </Upload>

                    <p
                      style={{
                        margin: "8px 0 0 0",
                        fontSize: "10px",
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
              message={
                isLoading
                  ? uploadImageMutation.isPending
                    ? "Uploading image..."
                    : "Updating..."
                  : "Update"
              }
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
