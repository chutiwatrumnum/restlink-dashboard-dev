import { useEffect, useState, useLayoutEffect } from "react";
import { useOutlet, useLocation } from "react-router-dom";
import {  Layout } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { Dispatch, RootState } from "../stores";
import { encryptStorage } from "../utils/encryptStorage";
import SideMenu from "../components/templates/SideMenu";
import "./styles/authorizedLayout.css";
import AlertSOS from "../components/templates/AlertSOS";
import { useNavigate } from "react-router-dom";


const { Sider, Content } = Layout;

function AuthorizedLayout() {
  const navigate = useNavigate();
  const { isAuth } = useSelector((state: RootState) => state.userAuth);
  // const  showToast  = useSelector((state: RootState) => state.sosWarning.showToast);
  const dispatch = useDispatch<Dispatch>();
  const outlet = useOutlet();
  const location = useLocation(); // เพิ่ม useLocation hook
  
  // ตัวอย่างการใช้งาน path
  const currentPath = location.pathname;
  const [collapsed, setCollapsed] = useState(() => {
    const savedState = localStorage.getItem("sideMenuCollapsed");
    return savedState === "true";
  });

  
  const [reload, setReload] = useState(false);
  const [storePathNotContentLayout] = useState([
    '/dashboard/manage-plan'
  ]);

  // ตรวจสอบว่า current path อยู่ใน list ที่ไม่ต้องใช้ Content layout หรือไม่
  const shouldUseContentLayout = !storePathNotContentLayout.includes(currentPath);
  // กำหนด path ที่ไม่ต้องการแสดง AlertSOS
  const shouldShowAlertSOS = !['/dashboard/manage-plan'].includes(currentPath);




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

  useLayoutEffect(() => {
    const checkAuthAndInitialize = async () => {
      try {
        // Check Access token
        const access_token = await encryptStorage.getItem("access_token");
        if (
          !access_token ||
          access_token === "undefined" ||
          access_token === ""
        ) {
          throw "access_token not found";
        }

        // ดึง project data ก่อนทำอย่างอื่นเสมอ
        await dispatch.setupProject.setDataProject();

        // ถ้า isAuth เป็น true แล้ว แสดงว่าเพิ่ง login มา ไม่ต้อง refresh token
        if (isAuth) {
          await dispatch.common.fetchUnitOptions();
          return true;
        }

        // ถ้า isAuth เป็น false แต่มี token ให้ลอง refresh
        const resReToken = await dispatch.userAuth.refreshTokenNew();
        if (!resReToken) {
          throw "access_token expired";
        }

        // Token valid - initialize app
        await dispatch.setupProject.setDataProject();
        await dispatch.common.fetchUnitOptions();
        dispatch.userAuth.updateAuthState(true);

        return true;
      } catch (error) {
        dispatch.userAuth.onLogout();
        navigate("/auth", { replace: true });
        return false;
      }
    };

    // เรียกเช็ค auth เฉพาะถ้าไม่ได้อยู่หน้า login
    if (window.location.pathname !== "/auth") {
      checkAuthAndInitialize();
    }
  }, [dispatch, navigate, reload]);



  const siderWidth = collapsed ? 80 : 320;



  // ถ้ายังไม่ได้ login ให้แสดง loading หรือ redirect
  if (!isAuth) {
    return <div>Loading...</div>;
  }
  const LayoutCardWrapContent = () => {
    return (
      <Content className="authorizeContentContainer">
        <div>{outlet}</div>
      </Content>
    );
  };

  const LayoutContent = () => {
    return <div>{outlet}</div>;
  };
  return (
    <Layout>
      {shouldShowAlertSOS && <AlertSOS  isAuth={isAuth} />}
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
        <SideMenu
          onMenuChange={() => {
            setReload(!reload);
          }}
          isAuth={isAuth}
        />
      </Sider>
      <div className="authorizeBG" style={{ left: siderWidth }} />
        
        <Layout style={{ marginLeft: siderWidth, transition: "all 0.3s" }}>  
          {shouldUseContentLayout && <LayoutCardWrapContent />}
          {!shouldUseContentLayout && <LayoutContent />}
      </Layout>
    </Layout>
  );
}

export default AuthorizedLayout;
