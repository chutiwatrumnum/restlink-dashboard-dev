import { useEffect } from "react";
import { useOutlet, useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../stores";
import { Col, Row } from "antd";
import { encryptStorage } from "../utils/encryptStorage";

// style
import "./styles/unAuthorizedLayout.css";

const UnauthorizedLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuth } = useSelector((state: RootState) => state.userAuth);
  const outlet = useOutlet();

  // ตรวจสอบว่าเป็นหน้า auth หรือไม่
  const isAuthPage = location.pathname === "/auth";

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const access_token = await encryptStorage.getItem("access_token");
        const projectId = await encryptStorage.getItem("projectId");

        console.log("🔍 UnauthorizedLayout checking auth:", {
          isAuth,
          hasToken: !!access_token,
          hasProjectId: !!projectId,
          currentPath: location.pathname,
        });

        // ถ้า login แล้วและมี token ให้ redirect ไป dashboard
        if (isAuth && access_token && access_token !== "undefined") {
          console.log("✅ User is authenticated, redirecting to dashboard");
          navigate("/dashboard/profile", { replace: true });
          return;
        }

        // ถ้าไม่ได้ login และไม่ได้อยู่หน้า auth ให้ redirect ไปหน้า login
        if (!isAuth && !isAuthPage) {
          console.log("❌ User not authenticated, redirecting to login");
          navigate("/auth", { replace: true });
          return;
        }
      } catch (error) {
        console.error("Auth check error:", error);
        if (!isAuthPage) {
          navigate("/auth", { replace: true });
        }
      }
    };

    checkAuth();
  }, [isAuth, location.pathname, navigate, isAuthPage]);

  // สำหรับหน้า login ให้ใช้ layout แบบเต็มหน้าจอ
  if (isAuthPage) {
    return <>{outlet}</>;
  }

  // สำหรับหน้าอื่นๆ ใช้ layout เดิม
  return (
    <Row className="container">
      <Col className="contentContainer">{outlet}</Col>
    </Row>
  );
};

export default UnauthorizedLayout;
