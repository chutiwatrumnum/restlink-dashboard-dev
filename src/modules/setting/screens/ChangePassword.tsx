import { useRef } from "react";
import { Typography, Form, Input } from "antd";
import { resetPasswordRule } from "../../../configs/inputRule";
import MediumButton from "../../../components/common/MediumButton";
import MediumActionButton from "../../../components/common/MediumActionButton";
import ConfirmModal from "../../../components/common/ConfirmModal";
import Header from "../../../components/templates/Header";

import { ChangePasswordImage } from "../../../assets/images/ImageSvg";
import { LockIcon } from "../../../assets/icons/Icons";

import type { FormInstance } from "antd/es/form";

import "../styles/setting.css";

const { Text } = Typography;

const ChangePassword = () => {
  // variables
  const formRef = useRef<FormInstance>(null);

  // functions
  const onFinish = async () => {
    // await dispatch.userAuth.recoveryByEmail(values);
    ConfirmModal({
      title: "Are you sure ?",
      message:
        "Are you sure you want to require a password reset on next login for this user? This will prompt the user to create and confirm a new password the next time they attempt to login.",
      okMessage: "Reset Password",
      cancelMessage: "Cancel",
    });
  };

  const onFinishFailed = (errorInfo: object) => {
    console.log("Failed:", errorInfo);
  };

  const onCancel = () => {
    formRef.current?.resetFields();
  };

  return (
    <>
      <Header title="Change Password" />
      <div className="changePasswordContainer">
        <ChangePasswordImage />
        <Form
          name="changePassword"
          ref={formRef}
          className="formChangePassword"
          layout="vertical"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
        >
          <Form.Item
            label={
              <Text className="semiBoldText changePasswordFormText">
                Your password
              </Text>
            }
            name="password"
            rules={resetPasswordRule}
          >
            <Input.Password prefix={<LockIcon />} size="large" />
          </Form.Item>
          <Form.Item
            label={
              <Text className="semiBoldText changePasswordFormText">
                New password
              </Text>
            }
            name="newPassword"
            rules={resetPasswordRule}
          >
            <Input.Password prefix={<LockIcon />} size="large" />
          </Form.Item>

          <Form.Item
            label={
              <Text className="semiBoldText changePasswordFormText">
                Re-enter new password
              </Text>
            }
            name="confirmPassword"
            rules={[
              ...resetPasswordRule,
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPassword") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error("Password confirmation doesn't match")
                  );
                },
              }),
            ]}
          >
            <Input.Password prefix={<LockIcon />} size="large" />
          </Form.Item>

          <Form.Item className="changePasswordBottomBtnContainer">
            <MediumActionButton
              className="forgotButton cancelBtnColor mainTextColor smokeBorderColor"
              message="Cancel"
              onClick={onCancel}
            />
            <MediumButton className="forgotButton" message="Send" />
          </Form.Item>
        </Form>
      </div>
    </>
  );
};

export default ChangePassword;
