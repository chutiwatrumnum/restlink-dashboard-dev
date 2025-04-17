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

const { Text } = Typography;

const SignInScreen = () => {
  const dispatch = useDispatch<Dispatch>();
  const [form] = Form.useForm();
  const [rememberChecked, setRememberChecked] = useState<boolean>(false);

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

  return (
    <Col className="containerSignIn">
      <Space
        direction="vertical"
        size={0}
        style={{ alignItems: "center", paddingBottom: 60 }}>
        <img src={LOGO} alt="logo" className="logo" />
        {/* <Text className="text-title">Powered By ARTANI</Text> */}
      </Space>
      <Form
        name="basic"
        form={form}
        className="formSignIn"
        layout="vertical"
        initialValues={{ remember: true }}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        autoComplete="off">
        <Form.Item
          label={<Text className="textColor">Email</Text>}
          name="username"
          rules={requiredRule}>
          <Input
            prefix={<UserSignInIcon color={whiteLabel.grayColor} />}
            size="large"
          />
        </Form.Item>

        <Form.Item
          label={<Text className="textColor">Password</Text>}
          name="password"
          rules={requiredRule}>
          <Input.Password
            prefix={<LockIcon color={whiteLabel.grayColor} />}
            size="large"
          />
        </Form.Item>

        <div className="forgotRememberContainer">
          <Checkbox
            checked={rememberChecked ? rememberChecked : false}
            onChange={onRememberChange}>
            Remember me
          </Checkbox>

          <Link to={"/recovery"} className="forgotPassword">
            Forgot Password?
          </Link>
        </div>

        <Form.Item className="txtCenter">
          <MediumButton className="loginBtn" message="Login" form={form} />
        </Form.Item>
      </Form>
    </Col>
  );
};

export default SignInScreen;
