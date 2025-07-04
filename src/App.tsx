import { useEffect, useLayoutEffect } from "react";
import { Navigate, Route, Routes, BrowserRouter } from "react-router-dom";
import { encryptStorage } from "./utils/encryptStorage";
import { useDispatch, useSelector } from "react-redux";
import { Dispatch, RootState } from "./stores";
// import { getProjectIDQuery } from "./utils/queriesGroup/authQueries";

import "antd/dist/reset.css";
import "./App.css";

// layouts
import UnauthorizedLayout from "./navigation/UnauthorizedLayout";
import AuthorizedLayout from "./navigation/AuthorizedLayout";

// authorize routes
import SummaryDashboard from "./modules/summary/screens/Summary";
import Announcement from "./modules/announcement/screens/Announcement";
import PeopleCountingMain from "./modules/peopleCounting/screens/PeopleCountingMain";
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
import SOSBuildingPlan from "./modules/sosWarning/screens/sosBuildingPlan";

import LiveChat from "./modules/chat/screens/ChatRoomScreen";

import PublicFolder from "./modules/documentForms/screen/PublicFolder";
import MaintenanceGuideFolder from "./modules/maintenanceGuide/screen/MaintenanceGuideFolder";

import EventLogs from "./modules/eventLogs/screen/EventLogs";
import EventJoinLogs from "./modules/eventLogs/screen/EventJoinLogs";
import VisitorManagementLog from "./modules/vistorManagement/screen/VisitorManagementLog";
// import EventView from "./modules/monitoring/screen/EventView";

import DeliveryLogs from "./modules/deliveryLogs/screen/deliveryLogs";

import Emergency from "./modules/emergency/screens/Emergency";

// unauthorize routes
import SignInScreen from "./modules/main/SignInScreen";
import RecoveryScreen from "./modules/main/RecoveryScreen";
import ResetPassword from "./modules/main/ResetPassword";
import SuccessResetScreen from "./modules/main/SuccessResetScreen";

// components

function App() {
  const dispatch = useDispatch<Dispatch>();
  const { isAuth } = useSelector((state: RootState) => state.userAuth);

  useLayoutEffect(() => {
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
  }, [isAuth]);

  return (
    <BrowserRouter>
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
          <Route path="reservedFacilities" element={<ReservedFacilities />} />
          <Route path="reservationList" element={<ReservationList />} />
          <Route path="peopleCounting" element={<PeopleCountingMain />} />
          {/* Fixing report */}
          <Route path="emergencyContact" element={<SummaryDashboard />} />
          {/* Building progress */}
          <Route
            path="buildingProgressDashboard"
            element={<SummaryDashboard />}
          />
          <Route path="managementMain" element={<ManagementMain />} />
          <Route path="serviceDashboard" element={<ServiceDashboard />} />
          <Route path="serviceCenterLists" element={<ServiceCenterLists />} />
          <Route path="serviceChat" element={<ServiceChat />} />
          <Route path="userManagement" element={<ResidentInformationMain />} />
          <Route path="invitation" element={<ResidentActivation />} />
          <Route path="parcelAlert" element={<SummaryDashboard />} />
          <Route path="announcement" element={<Announcement />} />
          <Route path="payment" element={<SummaryDashboard />} />
          <Route path="liveChat" element={<LiveChat />} />
          <Route path="smartMailbox" element={<SummaryDashboard />} />
          <Route path="securityCenter" element={<SummaryDashboard />} />
          <Route path="contactLists" element={<Emergency />} />
          {/* User management */}
          <Route path="residentManagement" element={<SummaryDashboard />} />
          <Route path="registration" element={<SummaryDashboard />} />
          <Route path="roomManagement" element={<SummaryDashboard />} />
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
          <Route path="delivery-logs" element={<DeliveryLogs />} />
          {/* Warranty tracking */}
          <Route path="warranty-tracking" element={<WarrantyTracking />} />
          {/* SOS warning */}
          <Route path="sos-warning" element={<SOSWarning />} />
          <Route path="sos-building-plan" element={<SOSBuildingPlan />} />
          <Route path="event-logs" element={<EventLogs />} />
          <Route path="event-joining-logs" element={<EventJoinLogs />} />
          <Route
            path="visitor-management-log"
            element={<VisitorManagementLog />}
          />
          {/* <Route path="event-view" element={<EventView />} /> */}
        </Route>
        <Route path="*" element={<Navigate to="/auth" />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;
