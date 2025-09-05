// import { useEffect, useLayoutEffect } from "react";
import {
  Navigate,
  Route,
  Routes,
  BrowserRouter,
  useLocation,
} from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "./stores";
import { useEffect, useState, useLayoutEffect } from "react";

import { useRouteChange } from "./utils/hooks";
import { useNavigate } from "react-router-dom";

import { encryptStorage } from "./utils/encryptStorage";
// import { useDispatch, useSelector } from "react-redux";
// import { Dispatch, RootState } from "./stores";
// import { getProjectIDQuery } from "./utils/queriesGroup/authQueries";

import "antd/dist/reset.css";
import "./App.css";

// layouts
import UnauthorizedLayout from "./navigation/UnauthorizedLayout";
import AuthorizedLayout from "./navigation/AuthorizedLayout";
import SetupProjectLayout from "./navigation/SetupProjectLayout";

// authorize routes
import SummaryDashboard from "./modules/summary/screens/Summary";
import Announcement from "./modules/announcement/screens/Announcement";
import ManagementMain from "./modules/management/screens/ManagementMain";
import ResidentInformationMain from "./modules/userManagement/screens/ResidentInformationMain";
import ResidentActivation from "./modules/userManagement/screens/ResidentActivation";

import ServiceDashboard from "./modules/serviceCenter/screens/ServiceDashboard";
import ServiceCenterLists from "./modules/serviceCenter/screens/ServiceCenterLists";
import ServiceChat from "./modules/serviceCenter/screens/ServiceChat";

import ReservedFacilities from "./modules/facilities/screen/ReservedFacilities";
import ReservationList from "./modules/facilities/screen/ReservationList";

import ChangePassword from "./modules/setting/screens/ChangePassword";
import Profile from "./modules/setting/screens/Profile";
import AdminManagement from "./modules/setting/screens/AdminManagement";

import AreaControl from "./modules/powerManagement/screens/AreaControl";
import DeviceControl from "./modules/powerManagement/screens/DeviceControl";

import WarrantyTracking from "./modules/warrantyTracking/screens/WarrantyTracking";

import SOSWarning from "./modules/sosWarning/screens/sosWarning";
import SecurityAlarm from "./modules/sosWarning/screens/securityAlarm";
import HistoryBuilding from "./modules/sosWarning/screens/historyBuilding";

import LiveChat from "./modules/chat/screens/ChatRoomScreen";

import PublicFolder from "./modules/documentForms/screen/PublicFolder";
import MaintenanceGuideFolder from "./modules/maintenanceGuide/screen/MaintenanceGuideFolder";

import EventLogs from "./modules/eventLogs/screen/EventLogs";
import EventJoinLogs from "./modules/eventLogs/screen/EventJoinLogs";
import VisitorManagementLog from "./modules/vistorManagement/screen/VisitorManagementLog";
// import EventView from "./modules/monitoring/screen/EventView";

import DeliveryLogs from "./modules/deliveryLogs/screen/deliveryLogs";

import Emergency from "./modules/emergency/screens/Emergency";

import JuristicInvitation from "./modules/juristicManagement/screens/JuristicInvitation";
import JuristicManage from "./modules/juristicManagement/screens/JuristicManage";
import StaffManagement from "./modules/staffManagement/screens/StaffManagement";

import RoomManageScreen from "./modules/roomManagement/screens/RoomManageScreen";
import VillageManageScreen from "./modules/villageManagement/screens/VillageManageScreen";

// unauthorize routes
import SignInScreen from "./modules/main/SignInScreen";
import RecoveryScreen from "./modules/main/RecoveryScreen";
import ResetPassword from "./modules/main/ResetPassword";
import SuccessResetScreen from "./modules/main/SuccessResetScreen";
// Removed unused and case-sensitive conflicting import for ParcelDeliverLogs

import SetupProject from "./modules/setupProjectFirst/screens/SetupProject";
// village
import UploadPlan from "./modules/setupProjectFirst/screens/village/UploadPlan";
// import SetUploadType from "./modules/setupProjectFirst/screens/village/SetUploadType";
import UploadUnit from "./modules/setupProjectFirst/screens/village/UploadUnit";
import UnitPreview from "./modules/setupProjectFirst/screens/village/UnitPreview";
// condominium
import UploadNumberBuilding from "./modules/setupProjectFirst/screens/condominium/UploadNumberBuilding";
import UnitPreviewCondo from "./modules/setupProjectFirst/screens/condominium/UnitPreview";
import UploadFloorPlan from "./modules/setupProjectFirst/screens/condominium/UploadFloorPlan";
import JuristicTeamPermission from "./modules/juristicManagement/screens/JuristicTeamPermission";

import VMSInvitation from "./modules/vmsInvitation/screens/VMSInvitation";
import VMSVehicle from "./modules/vmsVehicle/screens/VMSVehicle";
import VMSLogAccess from "./modules/vmsLogAccess/screens/VMSLogAccess";
import VMSLogPassage from "./modules/vmsLogPassage/screens/VMSLogPassage";
import VMSVisitor from "./modules/vmsVisitor/screens/VMSVisitor";

// components

//component Toast
import { ToastContainer } from "react-toastify";

// data project
import { getProject } from "./modules/setupProjectFirst/service/api/SetupProject";

// ตัวอย่างการใช้ Custom Hooks (เก็บไว้สำหรับ scroll to top)
function AppWithCustomHooks() {
  useRouteChange(async () => {
    window.scrollTo(0, 0);
  });
  return null;
}

// Guard for setup-project routes
function SetupProjectGuard() {
  const { step } = useSelector((state: RootState) => state.setupProject);

  if (step === 3) {
    return <Navigate to="/dashboard/profile" replace />;
  }

  return <SetupProjectLayout />;
}

// Route Guard Component ที่เช็คเงื่อนไขก่อน render Routes
function AppRoutes() {
  const { projectData, step } = useSelector(
    (state: RootState) => state.setupProject
  );
  const { isAuth } = useSelector((state: RootState) => state.userAuth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [routeState, setRouteState] = useState<"checking" | "allow">(
    "checking"
  );
  const [previousLayoutType, setPreviousLayoutType] = useState<string>("");

  useLayoutEffect(() => {
    const checkRouteAccess = async () => {
      const currentPath = location.pathname;

      let currentStep = Number(step);
      if (!currentStep) {
        const fetchedStep = await dispatch.setupProject.getStepCondoModel();
        currentStep = Number(fetchedStep);
      }

      // กำหนด layout type ของ route ปัจจุบัน
      let currentLayoutType = "";
      if (currentPath.includes("/dashboard")) {
        currentLayoutType = "dashboard";
      } else if (currentPath.includes("/setup-project")) {
        currentLayoutType = "setup-project";
      } else if (
        currentPath.includes("/auth") ||
        currentPath.includes("/recovery") ||
        currentPath.includes("/forgot-password") ||
        currentPath.includes("/success-reset")
      ) {
        currentLayoutType = "unauthorized";
      }

      // จัดการ setup-project: ถ้า step===3 ให้กลับ dashboard ก่อน จากนั้นค่อยเช็ค token
      if (currentLayoutType === "setup-project") {
        if (currentStep === 3) {
          navigate("/dashboard/profile", { replace: true });
          return;
        }
        const access_token = await encryptStorage.getItem("access_token");
        if (
          !access_token ||
          access_token === "undefined" ||
          access_token === ""
        ) {
          navigate("/auth", { replace: true });
          return;
        }
      }

      // ถ้า step === 3 ให้เข้า dashboard ทันทีจากทุกที่ (ยกเว้นหน้า unauthorized เช่น /auth)
      if (currentStep === 3 && currentLayoutType !== "unauthorized") {
        if (!currentPath.includes("/dashboard")) {
          navigate("/dashboard/profile", { replace: true });
          return;
        }
        setPreviousLayoutType(currentLayoutType);
        setRouteState("allow");
        return;
      }

      if (currentLayoutType === "dashboard") {
        if (currentStep === 3) {
          navigate("/dashboard/profile", { replace: true });
          setRouteState("allow");
          return;
        }
      }

      // ถ้า navigate ภายใน layout เดียวกัน ให้ skip การเช็คและ allow ทันที
      if (
        previousLayoutType === currentLayoutType &&
        currentLayoutType !== "" &&
        currentStep !== 3
      ) {
        setRouteState("allow");

        return;
      }

      setRouteState("checking");
      let projectType = '';
      let response:any = null;
      if (!projectData || Object.keys(projectData).length === 0) {
      if(isAuth){ 
        response = await getProject();
      
      }
      if(response?.status){
        dispatch.setupProject.setProjectData(response || {});
        projectType = response?.projectType?.nameCode || '';
        const strType = projectType.split('_');
        projectType = strType[strType.length - 1];
      } 
      else {
        // dispatch.setupProject.setProjectData({});
      }

        setPreviousLayoutType(currentLayoutType);
        setRouteState("allow");
        // return;
      }
      projectType = (projectData as any)?.projectType?.nameCode  || response?.projectType?.nameCode || "";
      // ถ้าเป็น unauthorized routes ให้ผ่านได้
      if (
        currentPath.includes("/auth") ||
        currentPath.includes("/recovery") ||
        currentPath.includes("/forgot-password") ||
        currentPath.includes("/success-reset")
      ) {
        // อัพเดท previous layout type เฉพาะเมื่อ allow
        setPreviousLayoutType(currentLayoutType);
        setRouteState("allow");
        return;
      }

      if (projectType) {
        const strType = projectType.split("_");
        projectType = strType[strType.length - 1];
        // เช็คเงื่อนไขสำหรับ dashboard routes ก่อน (เพื่อป้องกัน UI flash)
        if (currentPath.includes("/dashboard")) {
          if (projectType === "condo" && currentStep !== 3) {
            const objStep = {
              1: "/setup-project/get-start",
              2: "/setup-project/upload-floor-plan",
            };
            const targetRoute = objStep[currentStep as keyof typeof objStep];
            if (targetRoute) {
              // ไม่ update previousLayoutType เพราะจะ redirect
              navigate(targetRoute, { replace: true });
              return; // ไม่ set state เพื่อให้ useLayoutEffect ทำงานใหม่
            }
            // ถ้าไม่ต้อง redirect แสดงว่าหน้านี้ถูกต้อง (step 3 ขึ้นไป)
            setPreviousLayoutType(currentLayoutType);
            setRouteState("allow");
            return;
          } else if (projectType === "village" && currentStep !== 3) {
            let currentStep = step;
            if (currentStep === 0) {
              currentStep = await dispatch.setupProject.getStepCondoModel();
            }
            const objStep = {
              0: "/setup-project/get-start",
              1: "/setup-project/get-start",
              2: "/setup-project/get-start",
            };
            const targetRoute = objStep[currentStep as keyof typeof objStep];
            if (targetRoute) {
              // ไม่ update previousLayoutType เพราะจะ redirect
              navigate(targetRoute, { replace: true });
              return; // ไม่ set state เพื่อให้ useLayoutEffect ทำงานใหม่
            }
            // ถ้าไม่ต้อง redirect แสดงว่าหน้านี้ถูกต้อง (step 3 ขึ้นไป)
            setPreviousLayoutType(currentLayoutType);
            setRouteState("allow");
            return;
          }
          // ถ้าไม่ใช่ condo หรือ village ให้ผ่านได้
          setPreviousLayoutType(currentLayoutType);
          setRouteState("allow");
          return;
        }

        // เช็คเงื่อนไขสำหรับ setup-project routes
        else if (currentPath.includes("/setup-project") &&  currentStep != 3) {
          if (projectType === "condo") {
            const currentStep = await dispatch.setupProject.getStepCondoModel();
            let storePathCondo = [
              "/setup-project/upload-plan",
              "/setup-project/upload-unit",
              "/setup-project/unit-preview",
            ];
            const currentRoutePath = location.pathname;
            // อนุญาตให้คงอยู่หน้า get-start ไม่ redirect อัตโนมัติ
            if (
              currentRoutePath === "/setup-project/get-start" &&
              currentStep === 1
            ) {
              setPreviousLayoutType(currentLayoutType);
              setRouteState("allow");
              return;
            }
            if (storePathCondo.includes(currentRoutePath)) {
              navigate("/setup-project/get-start", { replace: true });
              return;
            }

            if (currentStep > 0) {
              const objStep = {
                0: "/setup-project/get-start",
                1: "/setup-project/get-start",
                2: "/setup-project/upload-floor-plan",
                3: "/dashboard/profile",
              };
              const targetRoute = objStep[currentStep as keyof typeof objStep];
              if (targetRoute && targetRoute !== currentPath) {
                // ไม่ update previousLayoutType เพราะจะ redirect
                navigate(targetRoute, { replace: true });
                return; // ไม่ set state เพื่อให้ useLayoutEffect ทำงานใหม่
              }
            }
            // ถ้าไม่ต้อง redirect แสดงว่าหน้านี้ถูกต้อง
            setPreviousLayoutType(currentLayoutType);
            setRouteState("allow");
            return;
          } else if (projectType === "village") {
            const currentStep = await dispatch.setupProject.getStepCondoModel();
            let storePathCondo = [
              "/setup-project/upload-number-building",
              "/setup-project/unit-preview-condo",
              "/setup-project/upload-floor-plan",
            ];
            const currentRoutePath = location.pathname;
            // อนุญาตให้คงอยู่หน้า get-start ไม่ redirect อัตโนมัติ
            if (
              currentRoutePath === "/setup-project/get-start" &&
              currentStep === 1
            ) {
              setPreviousLayoutType(currentLayoutType);
              setRouteState("allow");
              return;
            }
            if (storePathCondo.includes(currentRoutePath)) {
              navigate("/setup-project/get-start", { replace: true });
              return;
            }

            if (currentStep > 0) {
              const objStep = {
                2: "/setup-project/upload-floor-plan",
                3: "/dashboard/profile",
              };
              const targetRoute = objStep[currentStep as keyof typeof objStep];
              if (targetRoute && targetRoute !== currentPath) {
                // ไม่ update previousLayoutType เพราะจะ redirect
                navigate(targetRoute, { replace: true });
                return; // ไม่ set state เพื่อให้ useLayoutEffect ทำงานใหม่
              }
            }
            // ถ้าไม่ต้อง redirect แสดงว่าหน้านี้ถูกต้อง
            setPreviousLayoutType(currentLayoutType);
            setRouteState("allow");
            return;
          } else if (projectType === "village") {
            const currentStep = await dispatch.setupProject.getStepCondoModel();
            let storePathCondo = [
              "/setup-project/upload-number-building",
              "/setup-project/unit-preview-condo",
              "/setup-project/upload-floor-plan",
            ];
            const currentRoutePath = location.pathname;
            // อนุญาตให้คงอยู่หน้า get-start ไม่ redirect อัตโนมัติ
            if (
              currentRoutePath === "/setup-project/get-start" &&
              currentStep === 1
            ) {
              setPreviousLayoutType(currentLayoutType);
              setRouteState("allow");
              return;
            }
            if (storePathCondo.includes(currentRoutePath)) {
              // ไม่ update previousLayoutType เพราะจะ redirect
              navigate("/setup-project/upload-plan", { replace: true });
              return;
            }

            if (currentStep > 0) {
              const objStep = {
                3: "/dashboard/profile",
              };
              const targetRoute = objStep[currentStep as keyof typeof objStep];
              if (targetRoute && targetRoute !== currentPath) {
                // ไม่ update previousLayoutType เพราะจะ redirect
                navigate(targetRoute, { replace: true });
                return; // ไม่ set state เพื่อให้ useLayoutEffect ทำงานใหม่
              }
            }
            // ถ้าไม่ต้อง redirect แสดงว่าหน้านี้ถูกต้อง
            setPreviousLayoutType(currentLayoutType);
            setRouteState("allow");
            return;
          }
          // ถ้าไม่ใช่ condo หรือ village ให้ผ่านได้
          setPreviousLayoutType(currentLayoutType);
          setRouteState("allow");
          return;
        } else if (currentStep == 3 && currentLayoutType !== "unauthorized") {
          navigate("/dashboard/profile", { replace: true });
          return;
        }
      }

      // สำหรับ route อื่นๆ ที่ไม่เข้าเงื่อนไขข้างต้น ให้ผ่านได้
      setPreviousLayoutType(currentLayoutType);
      setRouteState("allow");
    };

    checkRouteAccess();
  }, [location.pathname, projectData, step, dispatch, navigate, isAuth]);

  // ไม่ render อะไรเลยระหว่างเช็ค
  if (routeState === "checking") {
    return null;
  }

  // render Routes เฉพาะเมื่อได้รับอนุญาต
  return (
    <Routes>
      {/* unauthorized_route */}

      <Route element={<UnauthorizedLayout />}>
        <Route index path="/auth" element={<SignInScreen />} />
        <Route path="/recovery" element={<RecoveryScreen />} />
        <Route path="/forgot-password/:token" element={<ResetPassword />} />
        <Route path="/success-reset" element={<SuccessResetScreen />} />
      </Route>

      {/* authorized_route */}
      <Route path="dashboard" element={<AuthorizedLayout />}>
        <Route index path="summary" element={<SummaryDashboard />} />
        {/* Facility */}
        <Route path="facility" element={<ReservedFacilities />} />
        <Route path="bookingList" element={<ReservationList />} />
        {/* Fixing report */}
        <Route path="emergencyContact" element={<SummaryDashboard />} />
        {/* Building progress */}
        <Route
          path="buildingProgressDashboard"
          element={<SummaryDashboard />}
        />
        <Route path="vms-invitation" element={<VMSInvitation />} />
        <Route path="vms-vehicle" element={<VMSVehicle />} />
        <Route path="vms-log-access" element={<VMSLogAccess />} />
        <Route path="vms-log-passage" element={<VMSLogPassage />} />
        <Route path="vms-visitor" element={<VMSVisitor />} />
        <Route path="managementMain" element={<ManagementMain />} />
        <Route path="serviceDashboard" element={<ServiceDashboard />} />
        <Route path="serviceCenterLists" element={<ServiceCenterLists />} />
        <Route path="serviceChat" element={<ServiceChat />} />
        <Route path="parcelAlert" element={<SummaryDashboard />} />
        <Route path="announcement" element={<Announcement />} />
        <Route path="payment" element={<SummaryDashboard />} />
        <Route path="liveChat" element={<LiveChat />} />
        <Route path="smartMailbox" element={<SummaryDashboard />} />
        <Route path="securityCenter" element={<SummaryDashboard />} />
        <Route path="contactLists" element={<Emergency />} />
        {/* User management */}
        <Route path="userManagement" element={<ResidentInformationMain />} />
        <Route path="invitation" element={<ResidentActivation />} />
        <Route path="roomManagement" element={<RoomManageScreen />} />
        <Route path="villageManagement" element={<VillageManageScreen />} />
        {/* Setting */}
        <Route path="profile" element={<Profile />} />
        <Route path="changePassword" element={<ChangePassword />} />
        <Route path="adminManagement" element={<AdminManagement />} />
        {/* Device control */}
        <Route path="areaControl" element={<AreaControl />} />
        <Route path="deviceControl" element={<DeviceControl />} />
        {/* Document */}
        <Route path="houseDocument" element={<PublicFolder />} />
        <Route path="projectInfo" element={<MaintenanceGuideFolder />} />
        {/* Delivery logs */}
        <Route path="parcels" element={<DeliveryLogs />} />
        {/* Warranty tracking */}
        <Route path="warranty-tracking" element={<WarrantyTracking />} />
        {/* SOS warning */}
        <Route path="security-alarm" element={<SecurityAlarm />} />
        <Route path="history-building" element={<HistoryBuilding />} />
        <Route path="manage-plan" element={<SOSWarning />} />
        <Route path="event-logs" element={<EventLogs />} />
        <Route path="event-joining-logs" element={<EventJoinLogs />} />
        <Route
          path="visitor-management-log"
          element={<VisitorManagementLog />}
        />
        {/* Juristic manage */}
        <Route path="juristicInvitation" element={<JuristicInvitation />} />
        <Route path="juristicManage" element={<JuristicManage />} />
        <Route path="staffManage" element={<StaffManagement />} />
        <Route
          path="juristicTeamPermission"
          element={<JuristicTeamPermission />}
        />
      </Route>

      {/* setup project first */}
      <Route path="setup-project" element={<SetupProjectGuard />}>
        {/* village */}
        <Route path="get-start" element={<SetupProject />} />
        <Route path="upload-plan" element={<UploadPlan />} />
        <Route path="upload-unit" element={<UploadUnit />} />
        <Route path="unit-preview" element={<UnitPreview />} />
        {/* condominium */}
        <Route
          path="upload-number-building"
          element={<UploadNumberBuilding />}
        />
        <Route path="unit-preview-condo" element={<UnitPreviewCondo />} />
        <Route path="upload-floor-plan" element={<UploadFloorPlan />} />
      </Route>

      <Route path="*" element={<Navigate to="/auth" />} />
    </Routes>
  );
}

function App() {
  const dispatch = useDispatch();
  const { projectData } = useSelector((state: RootState) => state.setupProject);
  const { isAuth } = useSelector((state: RootState) => state.userAuth);
  const [isDataProjectReady, setIsDataProjectReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // ใช้ token ใน storage แทนการพึ่ง isAuth ที่รีเซ็ตตอน refresh
        const access_token = await encryptStorage.getItem("access_token");
        const refreshToken = await encryptStorage.getItem("refreshToken");
        const isLoggedIn = !!(access_token && access_token !== "undefined") || !!(refreshToken && refreshToken !== "undefined");

        if (!isLoggedIn) {
          setIsDataProjectReady(true);
          return;
        }
        if (Object.keys(projectData).length === 0 || projectData === null) {
          await dispatch.setupProject.setDataProject();
          setIsDataProjectReady(true);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setIsDataProjectReady(true);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [isAuth]);

  return (
    <BrowserRouter>
      {isLoading && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "url(/src/assets/images/BG.png)",
            backgroundColor: "#f9f9f9",
            backgroundPosition: "center center",
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-gray-100 border-t-blue-500 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600 text-lg font-medium m-0">Loading...</p>
          </div>
        </div>
      )}
      {isDataProjectReady && <AppWithCustomHooks />}
      {isDataProjectReady && <AppRoutes />}

      {/* Global ToastContainer */}
      <ToastContainer
        position="top-right"
        autoClose={7000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        toastClassName="bg-white text-black"
        progressClassName="toast-progress-red"
      />
    </BrowserRouter>
  );
}

export default App;
