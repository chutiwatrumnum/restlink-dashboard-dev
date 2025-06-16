import { useEffect, useState } from "react";
import { useOutlet } from "react-router-dom";
import { Layout } from "antd";
import { useSelector } from "react-redux";
import { RootState } from "../stores";
import SideMenu from "../components/templates/SideMenu";
import "./styles/authorizedLayout.css";

const { Sider, Content } = Layout;

function AuthorizedLayout() {
  const { isAuth } = useSelector((state: RootState) => state.userAuth);
  const outlet = useOutlet();

  const [collapsed, setCollapsed] = useState(() => {
    const savedState = localStorage.getItem("sideMenuCollapsed");
    return savedState === "true";
  });

  // Listen for menu collapse changes
  useEffect(() => {
    const handleCollapsedChange = () => {
      const newCollapsedState =
        localStorage.getItem("sideMenuCollapsed") === "true";
      setCollapsed(newCollapsedState);
    };

    window.addEventListener("sideMenuCollapsed", handleCollapsedChange);
    return () => {
      window.removeEventListener("sideMenuCollapsed", handleCollapsedChange);
    };
  }, []);

  useEffect(() => {
    if (!isAuth && window.location.pathname !== "/auth") {
      window.location.pathname = "/auth";
    }
  }, [isAuth]);

  const siderWidth = collapsed ? 80 : 320;

  return (
    <Layout>
      <Sider
        width={320}
        collapsedWidth={80}
        collapsed={collapsed}
        trigger={null}
        className="sideContainer"
        style={{
          overflow: "auto",
          height: "100vh",
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
        }}>
        <SideMenu />
      </Sider>
      <div className="authorizeBG" style={{ left: siderWidth }} />
      <Layout style={{ marginLeft: siderWidth, transition: "all 0.3s" }}>
        <Content className="authorizeContentContainer">
          <div>{outlet}</div>
        </Content>
      </Layout>
    </Layout>
  );
}

export default AuthorizedLayout;
