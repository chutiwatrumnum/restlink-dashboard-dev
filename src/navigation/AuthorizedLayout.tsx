import { useEffect, useState, useLayoutEffect } from "react";
import { useOutlet } from "react-router-dom";
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
  const { isAuth } = useSelector((state: RootState) => state.userAuth);
  const dispatch = useDispatch<Dispatch>();
  const access_token = encryptStorage.getItem("access_token");
  const projectId = encryptStorage.getItem("projectId");
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
    setIsToastExpanded(false); // รีเซ็ตการขยายเมื่อปิด toast
  };

  // ฟังก์ชันสำหรับ toggle การขยาย toast
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
    if (window.location.pathname !== "/auth") {
      (async () => {
        try {
          // Check Access token
          const access_token = await encryptStorage.getItem("access_token");
          if (
            access_token === null ||
            access_token === undefined ||
            access_token === ""
          )
            throw "access_token not found";

          // Check Refresh token
          const resReToken = await dispatch.userAuth.refreshTokenNew();
          if (!resReToken) throw "access_token expired";

          // Token pass
          await dispatch.common.fetchUnitOptions();
          dispatch.userAuth.updateAuthState(true);

          return true;
        } catch (e) {
          dispatch.userAuth.onLogout();
          return false;
        }
      })();
    }
  }, [isAuth, reload]);

  useEffect(() => {
    if (
      (!isAuth || !access_token || !projectId) &&
      window.location.pathname !== "/auth"
    ) {
      window.location.pathname = "/auth";
    }
  }, [isAuth]);

  useEffect(() => {

    async function connectSocket() {
      const getEmergencyData = async () => {
        let dataEmergency = await getEmergency();
        if (dataEmergency.status) {
          setDataEmergency(dataEmergency.result)
          let haveEmergency = dataEmergency.result.emergency.length > 0
          let haveWarning = dataEmergency.result.deviceWarning.length > 0
          if (haveEmergency || haveWarning) {
            setShowToast(true);
          }
        }
      }
      getEmergencyData();
      const URL = "https://reslink-security-wqi2p.ondigitalocean.app/socket/sos/dashboard"
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
          "x-api-key": projectID
        },
      });
      newSocket.connect();
      newSocket.on("connect", () => {
        // console.log("Connected Successfully!");
        setConnected(true);
      });

      newSocket.on("disconnect", () => {
        // console.log("Disconnected!");
        setConnected(false);
      });

      newSocket.on("sos", (data) => {
        if (data?.marker) {
          if (data) {
            if (data.emergency) {
              setDataEmergency((prev: any) => ({
                ...prev,
                emergency: data.emergency,
                deviceWarning: data.deviceWarning || []
              }));
            }
          }

          if (data.deviceWarning?.length > 0 || data.emergency?.length > 0) {
            setShowToast(true);
          }
          else {
            setShowToast(false);
          }
        }
      });

      // newSocket.onAny((eventName, ...args) => {
      //   console.log('🔍 Received ANY event:', eventName, args);
      // });

      // Debug - Listen for ANY event
      setSocket(newSocket); // เพิ่มบรรทัดนี้


      // Cleanup เมื่อ component unmount
      return () => {
        // console.log('🧹 Cleaning up Socket.IO connection');
        newSocket.close();
      };
    }
    connectSocket();
  }, []); //

  const siderWidth = collapsed ? 80 : 320;

  return (
    <Layout>
      <AlertSOS
        showToast={showToast}
        isToastExpanded={isToastExpanded}
        handleToggleToast={handleToggleToast}
        dataEmergency={dataEmergency}
        handleHideToast={handleHideToast} />
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
        }}
      >
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
