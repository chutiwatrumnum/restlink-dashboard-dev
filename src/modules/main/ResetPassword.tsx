import { useRef } from "react";
import { Col, Space, Typography, Form, Input } from "antd";
import { resetPasswordRule, requiredRule } from "../../configs/inputRule";
import MediumButton from "../../components/common/MediumButton";
import FailedModal from "../../components/common/FailedModal";
import SuccessModal from "../../components/common/SuccessModal";
import { LockIcon } from "../../assets/icons/Icons";
import { whiteLabel } from "../../configs/theme";
import { useDispatch } from "react-redux";
import { Dispatch } from "../../stores";
import { useNavigate, useSearchParams } from "react-router-dom";

import type { FormInstance } from "antd/es/form";
import { ResetPasswordPayloadType } from "../../stores/interfaces/User";

import LOGO from "../../assets/images/LogoNexres.png";

import "./styles/forgotPassword.css";

const { Text, Title } = Typography;

const ResetPassword = () => {
  const width: number = window.innerWidth;
  const dispatch = useDispatch<Dispatch>();
  const formRef = useRef<FormInstance>(null);
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("sessionId");
  const token = searchParams.get("token");

  const onFinish = async (values: ResetPasswordPayloadType) => {
    const payload: ResetPasswordPayloadType = {
      ...values,
      token: token,
      sessionId: sessionId,
    };
    console.log(payload);
    const result = await dispatch.userAuth.resetPassword(payload);
    if (result) {
      width <= 600
        ? SuccessModal("Please signin with your new password")
        : SuccessModal("Successfully save");
      setTimeout(() => navigate("/success-reset"), 3000);
      if (!searchParams.get("r")) {
        setTimeout(() => navigate("/auth"), 7000);
      }
    } else {
      FailedModal("Something went wrong, Please try again later");
    }
  };

  const onFinishFailed = (errorInfo: object) => {
    console.log("Failed:", errorInfo);
  };

  // const onCancel = () => {
  //   formRef.current?.resetFields();
  //   navigate("/auth");
  // };

  return (
    <div className="w-full h-[100vh] flex flex-direction-column justify-center items-center">
      <Col className="forgotContainer">
        <Space direction="vertical" size={0} style={{ alignItems: "center" }}>
          <div className="logoContainer">
            <img src={LOGO} alt="logo" className="logo" />
          </div>
        </Space>
        <Col className="forgotPasswordTitle">
          <Title level={2} style={{ fontWeight: whiteLabel.normalWeight }}>
            Forgot your password?
          </Title>
          <p className="mainTextColor">
            Enter a new password below to change your password
          </p>
        </Col>
        <Form
          name="recovery"
          ref={formRef}
          form={form}
          className="formForgotPassword"
          layout="vertical"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
        >
          <Form.Item
            label={<Text className="textColor">New password</Text>}
            name="newPassword"
            rules={resetPasswordRule}
          >
            <Input.Password
              prefix={<LockIcon color={whiteLabel.grayColor} />}
              size="large"
            />
          </Form.Item>

          <Form.Item
            label={<Text className="textColor">Re-enter new password</Text>}
            name="confirmNewPassword"
            rules={[
              ...requiredRule,
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
            <Input.Password
              prefix={<LockIcon color={whiteLabel.grayColor} />}
              size="large"
            />
          </Form.Item>

          <Form.Item style={{ textAlign: "center" }}>
            <MediumButton
              className="resetPassBtn"
              message="Reset Password"
              form={form}
            />
          </Form.Item>
        </Form>
      </Col>
    </div>
  );
};

export default ResetPassword;
