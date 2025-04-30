import { useRef, useState, useEffect } from "react";
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
import { EditDataProfile, getDataProfile } from "../service/api/profile_api";
import { editProfileDetail } from "../../../stores/interfaces/Profile";
import FailedModal from "../../../components/common/FailedModal";
import SuccessModal from "../../../components/common/SuccessModal";
import { UpdateProfileSuccessMessage } from "../constants/profile";

const { Text } = Typography;

const Profile = () => {
  // variables
  const [ProfileEditForm] = Form.useForm();
  const formRef = useRef<FormInstance>(null);
  const [previewImage, setPreviewImage] = useState<string>();
  const [dataProfileDetail, setDataProfileDetail] = useState<any>(null);
  const [edited, setEdited] = useState<boolean>(true);
  const [reRender, setReRender] = useState<boolean>(false);
  useEffect(() => {
    (async function () {
      const result = await getDataProfile();
      if (result?.status) {
        await setPreviewImage(result.data.imageProfile);
        await ProfileEditForm.setFieldsValue({ ...result.data });
        await setDataProfileDetail(result.data);
      }
    })();
  }, [reRender]);

  // functions
  const onFinish = async (values: any) => {
    const request: editProfileDetail = {
      contact: values.contact,
    };
    if (values.image !== dataProfileDetail.profileImage) {
      request.imageProfile = values.image;
    }

    const resultCreated = await EditDataProfile(request);
    if (resultCreated) {
      SuccessModal(UpdateProfileSuccessMessage);
      await setEdited(true);
      await setReRender(true);
    } else {
      FailedModal("failed upload");
    }
  };

  const onFinishFailed = (errorInfo: object) => {
    console.log("Failed:", errorInfo);
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
     ProfileEditForm.setFieldsValue({ ...dataProfileDetail });
  };
  const onImageChanged = (image: string) => {
    setPreviewImage(image);
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
                  <Text className="textColor semiBoldText">First name</Text>
                }
                name="firstName">
                <Input
                  disabled={true}
                  size="large"
                  placeholder="Please input Name"
                  maxLength={120}
                />
              </Form.Item>

              <Row justify="space-between">
                <Form.Item
                  label={
                    <Text className="textColor semiBoldText">Mobile no.</Text>
                  }
                  name="contact"
                  rules={telRule}
                  style={{ width: "100%" }}>
                  <Input
                    disabled={true}
                    size="large"
                    placeholder="Please input tel"
                    maxLength={10}
                    showCount
                  />
                </Form.Item>
              </Row>
            </div>

            <div className="profileFormColumn">
              <Form.Item
                label={
                  <Text className="textColor semiBoldText">Last name</Text>
                }
                name="lastName">
                <Input
                  disabled={true}
                  size="large"
                  placeholder="Please input actual name"
                  maxLength={120}
                />
              </Form.Item>
              <Form.Item
                label={<Text className="textColor semiBoldText">Email</Text>}
                name="email"
                // rules={emailRule}
              >
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
                {/* <Form.Item
                  label={
                    <Text className="textColor semiBoldText">Middle name</Text>
                  }
                  name="middleName"
                  style={{ width: "100%" }}
                >
                  <Input
                    disabled={true}
                    size="large"
                    placeholder="Please input Name"
                    maxLength={120}
                  />
                </Form.Item> */}
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
                    <Text className="textColor semiBoldText">Project Name</Text>
                  }
                  name="projectName"
                  style={{ width: "100%" }}>
                  <Input
                    disabled={true}
                    size="large"
                    placeholder="Select role"
                    maxLength={20}
                  />
                </Form.Item>
              </Row>
            </div>
          </div>
          <Form.Item className="changePasswordBottomBtnContainer">
            <Row>
              <Col
                span={12}
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
                />
              </Col>
              <Col span={12} style={{ paddingLeft: "10px" }}>
                <MediumButton
                  disabled={edited}
                  className="forgotButton"
                  message="Save"
                />
              </Col>
            </Row>
          </Form.Item>
        </Form>
      </div>
    </>
  );
};

export default Profile;
