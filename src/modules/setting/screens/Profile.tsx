import { useRef, useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../stores";
import { usePermission } from "../../../utils/hooks/usePermission";

import Header from "../../../components/templates/Header";
import UploadCircleBtn from "../../../components/group/UploadCircleBtn";
import MediumButton from "../../../components/common/MediumButton";
import MediumActionButton from "../../../components/common/MediumActionButton";

import { Typography, Form, Input, Avatar, Row, Col } from "antd";
import { telRule } from "../../../configs/inputRule";
import { UserIcon } from "../../../assets/icons/Icons";

import type { FormInstance } from "antd/es/form";

import "../styles/setting.css";
import { whiteLabel } from "../../../configs/theme";
import {
  EditDataProfile,
  getDataProfile,
  updateUserNames,
} from "../service/api/profile_api";
import {
  editProfileDetail,
  UpdateUserNamesPayload,
} from "../../../stores/interfaces/Profile";
import FailedModal from "../../../components/common/FailedModal";
import SuccessModal from "../../../components/common/SuccessModal";
import { UpdateProfileSuccessMessage } from "../constants/profile";
import ChangePasswordModal from "../components/ChangePasswordModal";

const { Text } = Typography;

const Profile = () => {
  // variables
  const [ProfileEditForm] = Form.useForm();
  const formRef = useRef<FormInstance>(null);
  const [previewImage, setPreviewImage] = useState<string>();
  const [dataProfileDetail, setDataProfileDetail] = useState<any>(null);
  const [edited, setEdited] = useState<boolean>(true);
  const [reRender, setReRender] = useState<boolean>(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);

  const permissions = useSelector(
    (state: RootState) => state.common?.permission
  );
  const { access } = usePermission(permissions);

  useEffect(() => {
    (async function () {
      const result = await getDataProfile();
      if (result?.status) {
        await setPreviewImage(result.data.imageProfile);
        await ProfileEditForm.setFieldsValue({
          ...result.data,
          // แมป field names ให้ตรงกับ form
          givenName: result.data.firstName,
          familyName: result.data.lastName,
          middleName: result.data.middleName || "",
        });
        await setDataProfileDetail(result.data);
      }
    })();
  }, [reRender]);

  // functions
  const onFinish = async (values: any) => {
    try {
      // อัปเดตชื่อผ่าน API ใหม่
      if (
        dataProfileDetail?.userId &&
        (values.givenName !== dataProfileDetail.firstName ||
          values.familyName !== dataProfileDetail.lastName ||
          values.middleName !== (dataProfileDetail.middleName || ""))
      ) {
        const nameUpdatePayload: UpdateUserNamesPayload = {
          givenName: values.givenName,
          middleName: values.middleName || "",
          familyName: values.familyName,
        };

        const nameUpdateResult = await updateUserNames(
          dataProfileDetail.userId,
          nameUpdatePayload
        );

        if (!nameUpdateResult.status) {
          FailedModal("Failed to update name information");
          return;
        }
      }

      // อัปเดตรูปภาพและข้อมูลอื่นๆ ผ่าน API เดิม (ถ้ามีการเปลี่ยนแปลง)
      const hasImageOrContactChange =
        values.image !== dataProfileDetail.imageProfile ||
        values.contact !== dataProfileDetail.contact;

      if (hasImageOrContactChange) {
        const request: editProfileDetail = {
          contact: values.contact,
        };

        if (values.image !== dataProfileDetail.imageProfile) {
          request.imageProfile = values.image;
        }

        const resultCreated = await EditDataProfile(request);
        if (!resultCreated) {
          FailedModal("Failed to update contact or image");
          return;
        }
      }

      // แสดงข้อความสำเร็จและรีเฟรชข้อมูล
      SuccessModal(UpdateProfileSuccessMessage);
      await setEdited(true);
      await setReRender(!reRender);
    } catch (error) {
      console.error("Error updating profile:", error);
      FailedModal("Failed to update profile");
    }
  };

  const onFinishFailed = (errorInfo: object) => {
    // Form validation failed
  };

  const onEdit = async () => {
    if (edited) {
      setEdited(false);
    } else {
      await onCancel();
    }
  };

  const onCancel = async () => {
    setEdited(true);
    setPreviewImage(dataProfileDetail.imageProfile);
    ProfileEditForm.setFieldsValue({
      ...dataProfileDetail,
      // แมป field names ให้ตรงกับ form
      givenName: dataProfileDetail.firstName,
      familyName: dataProfileDetail.lastName,
      middleName: dataProfileDetail.middleName || "",
    });
  };

  const onImageChanged = (image: string) => {
    setPreviewImage(image);
    ProfileEditForm.setFieldValue("image", image);
  };

  const handleChangePasswordClick = () => {
    setIsChangePasswordModalOpen(true);
  };

  const handleChangePasswordClose = () => {
    setIsChangePasswordModalOpen(false);
  };

  return (
    <>
      <Header title="Profile" />
      <div className="profileContainer">
        <Form
          name="recovery"
          form={ProfileEditForm}
          className="formChangePassword"
          layout="vertical"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off">
          <div className="imageProfileContainer">
            <div style={{ position: "relative" }}>
              <Avatar
                size={225}
                className="profileImage"
                src={previewImage}
                icon={
                  <UserIcon
                    className="avatarSize"
                    color={whiteLabel.primaryColor}
                  />
                }
              />
              <Form.Item name="image" className="uploadImageBtn">
                <UploadCircleBtn disabled={edited} onChange={onImageChanged} />
              </Form.Item>
            </div>
          </div>
          <div className="profileFormContainer">
            <div className="profileFormColumn">
              <Form.Item
                label={
                  <Text className="textColor semiBoldText">
                    First name (Given Name)
                  </Text>
                }
                name="givenName"
                rules={[
                  { required: true, message: "Please input first name" },
                ]}>
                <Input
                  disabled={edited}
                  size="large"
                  placeholder="Please input first name"
                  maxLength={120}
                />
              </Form.Item>

              <Form.Item
                label={
                  <Text className="textColor semiBoldText">Middle name</Text>
                }
                name="middleName">
                <Input
                  disabled={edited}
                  size="large"
                  placeholder="Please input middle name (optional)"
                  maxLength={120}
                />
              </Form.Item>
            </div>

            <div className="profileFormColumn">
              <Form.Item
                label={
                  <Text className="textColor semiBoldText">
                    Last name (Family Name)
                  </Text>
                }
                name="familyName"
                rules={[{ required: true, message: "Please input last name" }]}>
                <Input
                  disabled={edited}
                  size="large"
                  placeholder="Please input last name"
                  maxLength={120}
                />
              </Form.Item>

              <Form.Item
                label={<Text className="textColor semiBoldText">Email</Text>}
                name="email">
                <Input
                  disabled={true}
                  size="large"
                  placeholder="Please input email"
                  maxLength={120}
                />
              </Form.Item>
            </div>

            <div className="profileFormColumn">
              <Row justify="space-between">
                <Form.Item
                  label={<Text className="textColor semiBoldText">Role</Text>}
                  name="roleName"
                  style={{ width: "100%" }}>
                  <Input
                    disabled={true}
                    size="large"
                    placeholder="Select role"
                    maxLength={20}
                  />
                </Form.Item>

                <Form.Item
                  label={
                    <Text className="textColor semiBoldText">Mobile no.</Text>
                  }
                  name="contact"
                  style={{ width: "100%" }}
                  rules={telRule}>
                  <Input
                    disabled={edited}
                    size="large"
                    placeholder="Please input tel"
                    maxLength={10}
                    showCount
                  />
                </Form.Item>
                {/* <Form.Item
                  label={
                    <Text className="textColor semiBoldText">Project Name</Text>
                  }
                  name="projectName"
                  style={{ width: "48%" }}>
                  <Input
                    disabled={true}
                    size="large"
                    placeholder="Select role"
                    maxLength={20}
                  />
                </Form.Item> */}
              </Row>
            </div>
          </div>
          <Form.Item className="changePasswordBottomBtnContainer">
            <Row>
              <Col
                span={8}
                style={{
                  justifyContent: "end",
                  display: "flex",
                  paddingRight: "10px",
                }}>
                <MediumActionButton
                  type="default"
                  className="ProfileButton"
                  message={edited == true ? "Edit" : "Cancel"}
                  onClick={onEdit}
                  disabled={!access("profile", "edit")}
                />
              </Col>
              <Col
                span={8}
                style={{
                  paddingLeft: "5px",
                  paddingRight: "5px",
                  display: "flex",
                  justifyContent: "center",
                }}>
                <MediumActionButton
                  type="default"
                  className="ProfileButton"
                  message="Change password"
                  onClick={handleChangePasswordClick}
                />
              </Col>
              <Col span={8} style={{ paddingLeft: "10px" }}>
                <MediumButton
                  disabled={edited || !access("profile", "edit")}
                  className="forgotButton"
                  message="Save"
                  form={ProfileEditForm}
                />
              </Col>
            </Row>
          </Form.Item>
        </Form>

        {/* Change Password Modal */}
        <ChangePasswordModal
          isOpen={isChangePasswordModalOpen}
          onClose={handleChangePasswordClose}
        />
      </div>
    </>
  );
};

export default Profile;
