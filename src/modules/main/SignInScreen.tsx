import { Col, Space, Typography, Form, Input, Checkbox } from "antd";
import { Link } from "react-router-dom";
import MediumButton from "../../components/common/MediumButton";
import { requiredRule } from "../../configs/inputRule";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Dispatch } from "../../stores";
import { UserSignInIcon, LockIcon } from "../../assets/icons/Icons";
import { whiteLabel } from "../../configs/theme";
import { LoginPayloadType } from "../../stores/interfaces/User";
import { postAuthMutation } from "../../utils/mutationsGroup/authMutations";

import LOGO from "../../assets/images/Reslink-Logo.png";

import type { CheckboxChangeEvent } from "antd/es/checkbox";
import { AccessTokenType } from "../../stores/interfaces/Auth";

import "./styles/signIn.css";
import { encryptStorage } from "../../utils/encryptStorage";
import { getAuthCode, startGoogleLogin } from "../../utils/googleAuth";

const { Text } = Typography;

const SignInScreen = () => {
  const dispatch = useDispatch<Dispatch>();
  const [form] = Form.useForm();
  const [rememberChecked, setRememberChecked] = useState<boolean>(false);
  const [authCode, setAuthCode] = useState<string>("");

  // API
  const postAuth = postAuthMutation();

  useEffect(() => {
    (async function () {
      const statusRemember = await encryptStorage.getItem("statusRemember");
      if (statusRemember) {
        await setRememberChecked(statusRemember);
        const email = await encryptStorage.getItem("email");

        await form.setFieldsValue({
          username: email ? email : undefined,
        });
      }
    })();
  }, []);

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
      <Space
        direction="vertical"
        size={0}
        style={{ alignItems: "center", paddingBottom: 60 }}
      >
        <img src={LOGO} alt="logo" className="logo" />
        {/* <Text className="text-title">Powered By ARTANI</Text> */}
      </Space>
      <div style={{ textAlign: "center", marginTop: "100px" }}>
        <button
          onClick={handleLogin}
          style={{
            padding: "12px 20px",
            backgroundColor: "#4285F4",
            color: "white",
            border: "none",
            borderRadius: "4px",
            fontSize: "16px",
            cursor: "pointer",
          }}
        >
          Login with Google
        </button>
      </div>
    </Col>
  );
};

export default SignInScreen;
