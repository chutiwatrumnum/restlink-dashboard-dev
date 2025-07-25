// import { useEffect, useLayoutEffect } from "react";
import { Navigate, Route, Routes, BrowserRouter } from "react-router-dom";
// import { encryptStorage } from "./utils/encryptStorage";
// import { useDispatch, useSelector } from "react-redux";
// import { Dispatch, RootState } from "./stores";
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

import JuristicInvitation from "./modules/juristicManagement/screens/JuristicInvitation";
import JuristicManage from "./modules/juristicManagement/screens/JuristicManage";

import RoomManageScreen from "./modules/roomManagement/screens/RoomManageScreen";

// unauthorize routes
import SignInScreen from "./modules/main/SignInScreen";
import RecoveryScreen from "./modules/main/RecoveryScreen";
import ResetPassword from "./modules/main/ResetPassword";
import SuccessResetScreen from "./modules/main/SuccessResetScreen";
import ParcelDashboard from "./modules/parcelDashboard/screen/ParcelDashboard";
import ParcelDeliverLogs from "./modules/parcelDeliveryLogs/screen/parcelDeliverLogs";

// components

function App() {
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
          <Route path="facility" element={<ReservedFacilities />} />
          <Route path="bookingList" element={<ReservationList />} />
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
          {/* Parcel */}
          <Route path="parcel-dashboard" element={<ParcelDashboard />} />
          <Route path="parcel-delivery-logs" element={<ParcelDeliverLogs />} />
          {/* Delivery Logs */}
          <Route path="delivery-logs" element={<DeliveryLogs />} />
          {/* Warranty tracking */}
          <Route path="warranty-tracking" element={<WarrantyTracking />} />
          {/* SOS warning */}
          <Route path="add-location" element={<SOSWarning />} />
          <Route path="building-plan" element={<SOSBuildingPlan />} />
          <Route path="event-logs" element={<EventLogs />} />
          <Route path="event-joining-logs" element={<EventJoinLogs />} />
          <Route
            path="visitor-management-log"
            element={<VisitorManagementLog />}
          />
          {/* Juristic manage */}
          <Route path="juristicInvitation" element={<JuristicInvitation />} />
          <Route path="juristicManage" element={<JuristicManage />} />
          {/* <Route path="event-view" element={<EventView />} /> */}
        </Route>
        <Route path="*" element={<Navigate to="/auth" />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;
