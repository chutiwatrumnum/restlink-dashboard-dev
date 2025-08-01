import { useRef } from "react";
import { Col, Space, Typography, Form, Input } from "antd";
import { emailRule } from "../../configs/inputRule";
import MediumButton from "../../components/common/MediumButton";
import MediumActionButton from "../../components/common/MediumActionButton";
import SuccessModal from "../../components/common/SuccessModal";
import FailedModal from "../../components/common/FailedModal";
import { EmailIcon } from "../../assets/icons/Icons";
import { whiteLabel } from "../../configs/theme";
import { useDispatch } from "react-redux";
import { Dispatch } from "../../stores";
import { useNavigate } from "react-router-dom";

import type { FormInstance } from "antd/es/form";

import LOGO from "../../assets/images/Reslink-Logo.png";

import "./styles/forgotPassword.css";

const { Text, Title } = Typography;

const RecoveryScreen = () => {
  const dispatch = useDispatch<Dispatch>();
  const formRef = useRef<FormInstance>(null);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const onFinish = async (values: { email: string }) => {
    const result = await dispatch.userAuth.recoveryByEmail(values);
    if (result) {
      SuccessModal("An email has been successfully sent.");
      setTimeout(() => navigate("/auth"), 3000);
    }
  };

  const onFinishFailed = (errorInfo: object) => {
    FailedModal("Enter the error code back to fix it.");
    console.log("Failed:", errorInfo);
  };

  const onCancel = () => {
    formRef.current?.resetFields();
    navigate(-1);
  };

  return (
    <Col className="forgotContainer">
      <Space direction="vertical" size={0} style={{ alignItems: "center" }}>
        <img src={LOGO} alt="logo" className="logo" />
      </Space>
      <Col className="forgotPasswordTitle">
        <Title level={2} style={{ fontWeight: whiteLabel.normalWeight }}>
          Forgot your password?
        </Title>
        <p className="mainTextColor">
          Enter your email to receive further guidance
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
        autoComplete="off">
        <Form.Item
          label={<Text className="textColor">Email</Text>}
          name="email"
          rules={emailRule}>
          <Input
            prefix={<EmailIcon color={whiteLabel.grayColor} />}
            size="large"
          />
        </Form.Item>

        <Form.Item>
          <MediumActionButton
            className="forgotButton cancelBtnColor mainTextColor smokeBorderColor"
            message="Cancel"
            type="default"
            onClick={onCancel}
          />
          <MediumButton
            className="forgotButton sendButton"
            message="Send"
            form={form}
          />
        </Form.Item>
      </Form>
    </Col>
  );
};

export default RecoveryScreen;
