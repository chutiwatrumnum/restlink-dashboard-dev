import { useLayoutEffect } from "react";
import { useOutlet, useNavigate } from "react-router-dom";
import { Layout } from "antd";
import { useSelector } from "react-redux";
import { RootState } from "../stores";
// import { useDispatch } from "react-redux";
// import { Dispatch } from "../stores";
// import { encryptStorage } from "../utils/encryptStorage";

import SideMenu from "../components/templates/SideMenu";

import "./styles/authorizedLayout.css";

const { Sider, Content } = Layout;

function AuthorizedLayout() {
  const navigate = useNavigate();
  //   const dispatch = useDispatch<Dispatch>();
  const userAuth = useSelector((state: RootState) => state.userAuth);
  const outlet = useOutlet();

  //   const refreshTokenHandle = async () => {
  //     let token = { token: await encryptStorage.getItem("refreshToken") };
  //     // let token = { token: "123" };
  //     if (token) await dispatch.userAuth.refreshToken(token);
  //   };

  useLayoutEffect(() => {
    (() => {
      if (!userAuth.isAuth) {
        setTimeout(() => {
          navigate("/auth", { replace: true });
        }, 500);
        return;
      }
    })();
  }, []);
  return (
    <Layout>
      <Sider width={320} className="sideContainer">
        <SideMenu />
      </Sider>
      <div className="authorizeBG" />
      <Layout style={{ marginLeft: 320 }}>
        <Content className="authorizeContentContainer">
          <div>{outlet}</div>
        </Content>
      </Layout>
    </Layout>
  );
}

export default AuthorizedLayout;
