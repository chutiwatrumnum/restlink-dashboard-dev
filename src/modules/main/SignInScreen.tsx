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

import LOGO from "../../assets/images/Reslink-Logo.png";

import type { CheckboxChangeEvent } from "antd/es/checkbox";

import "./styles/signIn.css";
import { encryptStorage } from "../../utils/encryptStorage";
import { getAuthCode, startGoogleLogin } from "../../utils/googleAuth";
import { firebaseSignInWithGoogle } from "../../../firebase";

const { Text } = Typography;

const SignInScreen = () => {
  const dispatch = useDispatch<Dispatch>();
  const [form] = Form.useForm();
  const [rememberChecked, setRememberChecked] = useState<boolean>(false);
  const [authCode, setAuthCode] = useState<string | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<any>(null);

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

  const onFinish = async (values: LoginPayloadType) => {
    if (rememberChecked) {
      await encryptStorage.setItem("email", values.username);
    } else {
      await encryptStorage.removeItem("email");
      await encryptStorage.removeItem("statusRemember");
    }
    await dispatch.userAuth.loginEffects(values);
  };

  const onFinishFailed = (errorInfo: object) => {
    console.log("Failed:", errorInfo);
  };

  const onRememberChange = async (e: CheckboxChangeEvent) => {
    console.log(`checked = ${e.target.checked}`);
    if (e.target.checked) {
      await encryptStorage.setItem("statusRemember", e.target.checked);
    } else {
      await encryptStorage.removeItem("statusRemember");
    }
    await setRememberChecked(e.target.checked);
  };

  const handleLogin = () => {
    startGoogleLogin();
  };

  useEffect(() => {
    // ดึง Auth Code เมื่อมีการ Redirect
    const code = getAuthCode();
    if (code) {
      setAuthCode(code);
      console.log("first", code);
      encryptStorage.setItem(
        "accessToken",
        "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJhQ3dkU0JWOVFBSDdneXkxOEt3SEhNaHNITzFDNDNfQ19WT1lUX0FFajFzIn0.eyJleHAiOjE3NDUyOTUzNTEsImlhdCI6MTc0NTI4MDk1MSwianRpIjoiMzRlMmY4YWItMDY4YS00NDRlLThjNzMtNWUwMzBlN2VhNzZjIiwiaXNzIjoiaHR0cHM6Ly9rZXljbG9hay5hcnRhbml0ZWNoLmNvbS9yZWFsbXMvanVyaXN0aWMiLCJhdWQiOiJhY2NvdW50Iiwic3ViIjoiZWZlNWEwNjAtODI0Zi00M2E3LWJjYzItMzE5YTRjYTljOWFlIiwidHlwIjoiQmVhcmVyIiwiYXpwIjoianVyaXN0aWMtY2xpZW50LWJhY2tlbmQiLCJzaWQiOiI0YzVlMmM4OC1hODc0LTQwNmYtYWM3NS1lY2ZhMjc3NmUxNjYiLCJhY3IiOiIxIiwiYWxsb3dlZC1vcmlnaW5zIjpbIi8qIl0sInJlYWxtX2FjY2VzcyI6eyJyb2xlcyI6WyJvZmZsaW5lX2FjY2VzcyIsImRlZmF1bHQtcm9sZXMtanVyaXN0aWMiLCJ1bWFfYXV0aG9yaXphdGlvbiJdfSwicmVzb3VyY2VfYWNjZXNzIjp7ImFjY291bnQiOnsicm9sZXMiOlsibWFuYWdlLWFjY291bnQiLCJtYW5hZ2UtYWNjb3VudC1saW5rcyIsInZpZXctcHJvZmlsZSJdfX0sInNjb3BlIjoicHJvZmlsZSBlbWFpbCIsImVtYWlsX3ZlcmlmaWVkIjpmYWxzZSwibmFtZSI6IkNodXRpd2F0IFJ1bW51bSIsInByZWZlcnJlZF91c2VybmFtZSI6ImNodXRpd2F0cnVtbnVtQGdtYWlsLmNvbSIsImdpdmVuX25hbWUiOiJDaHV0aXdhdCIsImZhbWlseV9uYW1lIjoiUnVtbnVtIiwiZW1haWwiOiJjaHV0aXdhdHJ1bW51bUBnbWFpbC5jb20ifQ.ndHEcIYoAFRRETMq_Y7i7OLnqttPJAUXrLaEcyiY2SyOp6wk0AhXoxA4nObFQLsu_UFwz2v7hP6EHbzzmSJs1NKZqGt2mcDjxo7CQ1GiO-_9RJazATwxtMJkeHRFWqGoqZZCGxOqQseB1A5fPc-upYM-Hwe4waMHn6USaAIasUdtERZeb9C9BZDmZjF8EwQRryeW2MINv4uOtn2e2H_ExrvLRvIPXzFrdZEbjXS4VkgJaur1Jsrw3TwMbdDeU39K_APft22sJp-C6i4_55EoaW2oH5cJnw21fTYnX589L64ZlE7xW-YqGLGUAKfkrbbt6D14bY44X1qqUV69heQX6g"
      );
 dispatch.userAuth.updateAuthState(true);
      // ใช้ Firebase Authentication ด้วย Auth Code
      firebaseSignInWithGoogle(code).then((user) => {
        setFirebaseUser(user);
      });
    }
  }, []);

  return (
    // <Col className="containerSignIn">
    //   <Space
    //     direction="vertical"
    //     size={0}
    //     style={{ alignItems: "center", paddingBottom: 60 }}>
    //     <img src={LOGO} alt="logo" className="logo" />
    //     {/* <Text className="text-title">Powered By ARTANI</Text> */}
    //   </Space>
    //   <Form
    //     name="basic"
    //     form={form}
    //     className="formSignIn"
    //     layout="vertical"
    //     initialValues={{ remember: true }}
    //     onFinish={onFinish}
    //     onFinishFailed={onFinishFailed}
    //     autoComplete="off">
    //     <Form.Item
    //       label={<Text className="textColor">Email</Text>}
    //       name="username"
    //       rules={requiredRule}>
    //       <Input
    //         prefix={<UserSignInIcon color={whiteLabel.grayColor} />}
    //         size="large"
    //       />
    //     </Form.Item>

    //     <Form.Item
    //       label={<Text className="textColor">Password</Text>}
    //       name="password"
    //       rules={requiredRule}>
    //       <Input.Password
    //         prefix={<LockIcon color={whiteLabel.grayColor} />}
    //         size="large"
    //       />
    //     </Form.Item>

    //     <div className="forgotRememberContainer">
    //       <Checkbox
    //         checked={rememberChecked ? rememberChecked : false}
    //         onChange={onRememberChange}>
    //         Remember me
    //       </Checkbox>

    //       <Link to={"/recovery"} className="forgotPassword">
    //         Forgot Password?
    //       </Link>
    //     </div>

    //     <Form.Item className="txtCenter">
    //       <MediumButton className="loginBtn" message="Login" form={form} />
    //     </Form.Item>
    //   </Form>
    // </Col>
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h2>Google Login</h2>
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

      {authCode && (
        <div
          style={{ marginTop: "30px", fontFamily: "monospace", color: "#333" }}
        >
          <strong>Auth Code:</strong> {authCode}
        </div>
      )}

      {firebaseUser && (
        <div
          style={{ marginTop: "30px", fontFamily: "monospace", color: "#333" }}
        >
          <strong>Firebase User:</strong>{" "}
          {JSON.stringify(firebaseUser, null, 2)}
        </div>
      )}
    </div>
  );
};

export default SignInScreen;
