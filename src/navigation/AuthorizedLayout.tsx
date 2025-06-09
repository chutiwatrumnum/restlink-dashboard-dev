import { useEffect } from "react";
import { useOutlet } from "react-router-dom";
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
  const { isAuth } = useSelector((state: RootState) => state.userAuth);
  const outlet = useOutlet();

  useEffect(() => {
    if (!isAuth && window.location.pathname !== "/auth") {
      window.location.pathname = "/auth";
    }
  }, [isAuth]);

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
