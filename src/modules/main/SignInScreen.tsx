import {
  Button,
  Checkbox,
  Col,
  Form,
  Input,
  Row,
  Typography,
} from "antd";
import { useEffect, useState } from "react";
import { postAuthMutation } from "../../utils/mutationsGroup/authMutations";
import LOGO from "../../assets/images/SignInLogo.png";
import type { AccessTokenType } from "../../stores/interfaces/Auth";
import "./styles/signIn.css";
import { getAuthCode, startGoogleLogin } from "../../utils/googleAuth";
import { GoogleIcon } from "../../assets/icons/Icons";
import { Link } from "react-router-dom";
const {Title } = Typography;


const SignInScreen = () => {
  const [authCode, setAuthCode] = useState<string>("");

  // API
  const postAuth = postAuthMutation();

  const handleLogin = async () => {
    startGoogleLogin();
  };

  const handleGetaccess_token = async () => {
    if (authCode) {
      const payload: AccessTokenType = {
        code: authCode,
        redirectUrl: window.location.origin + window.location.pathname,
      };
      await postAuth.mutateAsync(payload);
    }
  };

  useEffect(() => {
    // ดึง Auth Code เมื่อมีการ Redirect
    const code = getAuthCode();
    if (code && code !== authCode) {
      setAuthCode(code);
    }
    handleGetaccess_token();
  }, [authCode]);

  return (
    // <Col className="containerSignIn">
    //   <Space direction="vertical" size={0} className="logo-container">
    //     <img src={LOGO} alt="logo" className="logo" />
    //   </Space>

    //   <div className="login-button-container">
    //     <button onClick={handleLogin} className="google-login-btn">
    //       <GoogleIcon />
    //       <span>เข้าสู่ระบบด้วย Google</span>
    //     </button>
    //   </div>
    // </Col>
    <div className="modern-signin-container">
      <Row className="modern-signin-row">
        {/* Left Side - Form */}
        <Col xs={24} lg={12} className="signin-form-section">
          <div className="modern-form-container">
            {/* Logo and Title */}
            <div className="signin-header">
              <div className="logo-container">
                <img
                  src={LOGO}
                  alt="Logo Brand"
                  className="logo-brand"
                />
              </div>

              <Title level={2} className="signin-title">
                Login
              </Title>
            </div>

            <Form
              name="signin"
              // form={form}
              className="modern-signin-form"
              layout="vertical"
              initialValues={{ remember: true }}
              // onFinish={onFinish}
              // onFinishFailed={onFinishFailed}
              autoComplete="off">
              {/* Google Sign In Button */}
              <Button
                onClick={handleLogin}
                type="primary"
                htmlType="submit"
                size="large"
                block
                className="login-button">
                <GoogleIcon />
                <span>เข้าสู่ระบบด้วย Google</span>
              </Button>
              <div className="signin-divider">
                <span>Or sign in with email</span>
              </div>
              {/* Email Input */}
              <Form.Item
                name="username"
                // rules={requiredRule}
              >
                <Input
                  size="large"
                  placeholder="Email"
                  className="modern-input"
                />
              </Form.Item>
              {/* Password Input */}
              <Form.Item
                name="password"
                // rules={requiredRule}
              >
                <Input.Password
                  size="large"
                  placeholder="Password"
                  className="modern-input"
                />
              </Form.Item>

              {/* Options Row */}
              <div className="signin-options">
                <Checkbox
                  // checked={rememberChecked}
                  // onChange={onRememberChange}
                  className="keep-logged-checkbox">
                  Keep me logged in
                </Checkbox>

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
                  className="login-button">
                  Login
                </Button>
              </Form.Item>

              {/* Sign Up Link */}
              {/* <div className="signup-section">
              <Text className="signup-text">
                Don't have an account?{" "}
                <Link to="/signup" className="signup-link">
                  Sign up
                </Link>
              </Text>
            </div> */}
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
              <img
                src={LOGO}
                alt="Logo Brand"
                className="logo-brand"
              />
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default SignInScreen;
