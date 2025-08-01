import { useEffect, useState, useLayoutEffect } from "react";
import { useOutlet, useNavigate } from "react-router-dom";
import { Layout } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { Dispatch, RootState } from "../stores";
import { encryptStorage } from "../utils/encryptStorage";
import SideMenu from "../components/templates/SideMenu";
import "./styles/authorizedLayout.css";
import { io, Socket } from "socket.io-client";
import AlertSOS from "../components/templates/AlertSOS";
import { getEmergency } from "../modules/sosWarning/service/api/SOSwarning";

const { Sider, Content } = Layout;

function AuthorizedLayout() {
  const navigate = useNavigate();
  const { isAuth } = useSelector((state: RootState) => state.userAuth);
  const dispatch = useDispatch<Dispatch>();
  const outlet = useOutlet();

  const [collapsed, setCollapsed] = useState(() => {
    const savedState = localStorage.getItem("sideMenuCollapsed");
    return savedState === "true";
  });
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [dataEmergency, setDataEmergency] = useState<any>(null);
  const [showToast, setShowToast] = useState<boolean>(false);
  const [isToastExpanded, setIsToastExpanded] = useState<boolean>(false);
  const [reload, setReload] = useState(false);

  const handleHideToast = () => {
    setShowToast(false);
    setIsToastExpanded(false);
  };

  const handleToggleToast = () => {
    setIsToastExpanded(!isToastExpanded);
  };

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
        console.log("🔍 AuthorizedLayout checking auth:", {
          isAuth,
          currentPath: window.location.pathname,
        });

        // Check Access token
        const access_token = await encryptStorage.getItem("access_token");
        if (
          !access_token ||
          access_token === "undefined" ||
          access_token === ""
        ) {
          console.log("❌ No access token found");
          throw "access_token not found";
        }

        // ถ้า isAuth เป็น true แล้ว แสดงว่าเพิ่ง login มา ไม่ต้อง refresh token
        if (isAuth) {
          console.log("✅ User just logged in, skipping refresh token");
          await dispatch.common.fetchUnitOptions();
          return true;
        }

        // ถ้า isAuth เป็น false แต่มี token ให้ลอง refresh
        console.log("🔄 Trying to refresh token");
        const resReToken = await dispatch.userAuth.refreshTokenNew();
        if (!resReToken) {
          console.log("❌ Refresh token failed");
          throw "access_token expired";
        }

        // Token valid - initialize app
        console.log("✅ Auth check passed, initializing app");
        await dispatch.common.fetchUnitOptions();
        dispatch.userAuth.updateAuthState(true);

        return true;
      } catch (error) {
        console.log("❌ Auth check failed:", error);
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

  // เช็คว่าต้อง redirect ไปหน้า login หรือไม่
  useEffect(() => {
    const checkRedirect = async () => {
      const access_token = await encryptStorage.getItem("access_token");
      const projectId = await encryptStorage.getItem("projectId");

      console.log("🔍 Checking redirect need:", {
        isAuth,
        hasToken: !!access_token,
        hasProjectId: !!projectId,
        currentPath: window.location.pathname,
      });

      if (
        (!isAuth || !access_token || access_token === "undefined") &&
        window.location.pathname !== "/auth"
      ) {
        console.log("❌ Redirecting to login");
        navigate("/auth", { replace: true });
      }
    };

    checkRedirect();
  }, [isAuth, navigate]);

  useEffect(() => {
    async function connectSocket() {
      const getEmergencyData = async () => {
        let dataEmergency = await getEmergency();
        if (dataEmergency.status) {
          setDataEmergency(dataEmergency.result);
          let haveEmergency = dataEmergency.result.emergency.length > 0;
          let haveWarning = dataEmergency.result.deviceWarning.length > 0;
          if (haveEmergency || haveWarning) {
            setShowToast(true);
          }
        }
      };
      getEmergencyData();

      const URL =
        "https://reslink-security-wqi2p.ondigitalocean.app/socket/sos/dashboard";
      const access_token = encryptStorage.getItem("access_token");
      const projectID = await encryptStorage.getItem("projectId");
      const newSocket = io(URL, {
        reconnection: true,
        reconnectionAttempts: 2,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 2000,
        timeout: 10000,
        extraHeaders: {
          Authorization: `Bearer ${access_token}`,
          "x-api-key": projectID,
        },
      });
      newSocket.connect();
      newSocket.on("connect", () => {
        setConnected(true);
      });

      newSocket.on("disconnect", () => {
        setConnected(false);
      });

      newSocket.on("sos", (data) => {
        if (data?.marker) {
          if (data) {
            if (data.emergency) {
              setDataEmergency((prev: any) => ({
                ...prev,
                emergency: data.emergency,
                deviceWarning: data.deviceWarning || [],
              }));
            }
          }

          if (data.deviceWarning?.length > 0 || data.emergency?.length > 0) {
            setShowToast(true);
          } else {
            setShowToast(false);
          }
        }
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }

    // เชื่อมต่อ socket เฉพาะเมื่อ login แล้ว
    if (isAuth) {
      connectSocket();
    }
  }, [isAuth]);

  const siderWidth = collapsed ? 80 : 320;

  // ถ้ายังไม่ได้ login ให้แสดง loading หรือ redirect
  if (!isAuth) {
    return <div>Loading...</div>;
  }

  return (
    <Layout>
      <AlertSOS
        showToast={showToast}
        isToastExpanded={isToastExpanded}
        handleToggleToast={handleToggleToast}
        dataEmergency={dataEmergency}
        handleHideToast={handleHideToast}
      />
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
          dataEmergency={dataEmergency}
        />
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
