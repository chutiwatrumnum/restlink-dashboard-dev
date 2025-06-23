import { Col, Space } from "antd";
import { useEffect, useState } from "react";
import { postAuthMutation } from "../../utils/mutationsGroup/authMutations";
import LOGO from "../../assets/images/SignInLogo.png";
import type { AccessTokenType } from "../../stores/interfaces/Auth";
import "./styles/signIn.css";
import { getAuthCode, startGoogleLogin } from "../../utils/googleAuth";
import { GoogleIcon } from "../../assets/icons/Icons";

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
    <Col className="containerSignIn">
      <Space direction="vertical" size={0} className="logo-container">
        <img src={LOGO} alt="logo" className="logo" />
      </Space>

      <div className="login-button-container">
        <button onClick={handleLogin} className="google-login-btn">
          <GoogleIcon />
          <span>เข้าสู่ระบบด้วย Google</span>
        </button>
      </div>
    </Col>
  );
};

export default SignInScreen;
