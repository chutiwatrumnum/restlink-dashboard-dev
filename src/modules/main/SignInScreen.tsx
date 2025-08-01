import { Button, Checkbox, Col, Form, Input, Row, Typography } from "antd";
import { useEffect, useState } from "react";
import {
  postAuthMutation,
  postValidateCodeMutation,
  postJoinMutation,
} from "../../utils/mutationsGroup/authMutations";
import LOGO from "../../assets/images/SignInLogo.png";
import type { AccessTokenType } from "../../stores/interfaces/Auth";
import "./styles/signIn.css";
import { getAuthCode, startGoogleLogin } from "../../utils/googleAuth";
import { GoogleIcon } from "../../assets/icons/Icons";
import { Link, useNavigate } from "react-router-dom";
import SignUpModal from "./components/SignUpModal";
import ConfirmDetailModal from "./components/ConfirmDetailModal";
import { JoinPayloadType } from "../../stores/interfaces/JuristicManage";
import {
  callSuccessModal,
  callFailedModal,
} from "../../components/common/Modal";
import { useDispatch, useSelector } from "react-redux";
import { Dispatch, RootState } from "../../stores";
import { requiredRule } from "../../utils/formRule";

const { Title } = Typography;

interface LoginFormData {
  username: string;
  password: string;
  remember?: boolean;
}

const SignInScreen = () => {
  const [form] = Form.useForm();
  const dispatch = useDispatch<Dispatch>();
  const navigate = useNavigate();
  const { isAuth } = useSelector((state: RootState) => state.userAuth);
  const [authCode, setAuthCode] = useState<string>("");
  const [validateCode, setValidateCode] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // API
  const postAuth = postAuthMutation();
  const postValidateCode = postValidateCodeMutation();
  const postJoin = postJoinMutation();

  // Redirect ถ้า login แล้ว
  useEffect(() => {
    if (isAuth) {
      navigate("/dashboard/profile", { replace: true });
    }
  }, [isAuth, navigate]);

  const handleLogin = async () => {
    startGoogleLogin();
  };

  const handleGetAccessToken = async () => {
    if (authCode) {
      const payload: AccessTokenType = {
        code: authCode,
        redirectUrl: window.location.origin + window.location.pathname,
      };
      await postAuth.mutateAsync(payload);
    }
  };

  // Handle email/password login
  const onFinish = async (values: LoginFormData) => {
    setLoading(true);
    try {
      const result = await dispatch.userAuth.loginEffects({
        username: values.username,
        password: values.password,
      });

      if (result) {
        // Success message จะแสดงใน loginEffects แล้ว
        // Navigation จะเกิดขึ้นใน useEffect เมื่อ isAuth เปลี่ยน
      }
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log("Failed:", errorInfo);
    callFailedModal("Please check your input and try again.");
  };

  const onSignUpOk = async (code: string) => {
    setValidateCode(code);
    postValidateCode.mutateAsync({ code: code });
  };

  const onJoinConfirm = async (payload: JoinPayloadType) => {
    let newPayload: JoinPayloadType = {
      code: validateCode,
      firstName: payload.firstName,
      middleName: payload.middleName,
      lastName: payload.lastName,
      contact: payload.contact,
    };
    postJoin.mutateAsync(newPayload).then(() => {
      callSuccessModal("Registration complete. Please sign in again.");
    });
  };

  useEffect(() => {
    // ดึง Auth Code เมื่อมีการ Redirect
    const code = getAuthCode();
    if (code && code !== authCode) {
      setAuthCode(code);
    }
    handleGetAccessToken();
  }, [authCode]);

  return (
    <div className="modern-signin-container">
      <Row className="modern-signin-row">
        {/* Left Side - Form */}
        <Col xs={24} lg={12} className="signin-form-section">
          <div className="modern-form-container">
            {/* Logo and Title */}
            <div className="signin-header">
              <div className="logo-container">
                <img src={LOGO} alt="Logo Brand" className="logo-brand" />
              </div>

              <Title level={2} className="signin-title">
                Login
              </Title>
            </div>

            <Form
              name="signin"
              form={form}
              className="modern-signin-form"
              layout="vertical"
              initialValues={{ remember: true }}
              onFinish={onFinish}
              onFinishFailed={onFinishFailed}
              autoComplete="off">
              {/* Google Sign In Button */}
              <Button
                onClick={handleLogin}
                type="primary"
                htmlType="button"
                size="large"
                block
                className="login-button-google"
                style={{ marginBottom: "1rem" }}>
                <GoogleIcon />
                <span>เข้าสู่ระบบด้วย Google</span>
              </Button>

              <div className="signin-divider">
                <span>Or sign in with email</span>
              </div>

              {/* Email Input */}
              <Form.Item
                name="username"
                rules={[
                  { required: true, message: "Please input your email!" },
                  { type: "email", message: "Please enter a valid email!" },
                ]}>
                <Input
                  size="large"
                  placeholder="Email"
                  className="modern-input"
                  autoComplete="username"
                />
              </Form.Item>

              {/* Password Input */}
              <Form.Item
                name="password"
                rules={[
                  { required: true, message: "Please input your password!" },
                ]}>
                <Input.Password
                  size="large"
                  placeholder="Password"
                  className="modern-input"
                  autoComplete="current-password"
                />
              </Form.Item>

              {/* Options Row */}
              <div className="signin-options">
                <Form.Item name="remember" valuePropName="checked" noStyle>
                  <Checkbox className="keep-logged-checkbox">
                    Keep me logged in
                  </Checkbox>
                </Form.Item>

                <Link to={"/recovery"} className="forgot-link">
                  Forgot password?
                </Link>
              </div>

              {/* Login Button */}
              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  block
                  className="login-button"
                  loading={loading}>
                  Login
                </Button>
              </Form.Item>
            </Form>
          </div>
        </Col>

        {/* Right Side - Illustration */}
        <Col xs={0} lg={12} className="modern-illustration-section">
          <div className="illustration-content">
            {/* Background Shapes */}
            <div className="bg-shapes">
              <div className="shape shape-1"></div>
              <div className="shape shape-2"></div>
              <div className="shape shape-3"></div>
              <div className="shape shape-4"></div>
              <div className="shape shape-5"></div>
              <div className="shape shape-6"></div>
            </div>

            {/* Main Text */}
            <div className="main-text">
              <img src={LOGO} alt="Logo Brand" className="logo-brand" />
            </div>
          </div>
        </Col>
      </Row>

      <SignUpModal
        onOk={onSignUpOk}
        onClose={() => {
          console.log("cancel");
        }}
      />
      <ConfirmDetailModal
        onOk={onJoinConfirm}
        onClose={() => {
          console.log("cancel");
        }}
      />
    </div>
  );
};

export default SignInScreen;
