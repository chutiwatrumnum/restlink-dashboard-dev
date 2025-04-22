import { useState } from "react";
import { Menu } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Dispatch } from "../../stores";
import { APP_VERSION } from "../../configs/configs";
import { whiteLabel } from "../../configs/theme";
import ConfirmModal from "../../components/common/ConfirmModal";
import {
  FacilityBookingIcon,
  ReservationDashboardIcon,
  ReservationListIcon,
  LogOutIcon,
  PeopleCountingIcon,
  AnnouncementIcon,
  // ParcelIcon,
  UserManagementIcon,
  ResidentManagementIcon,
  RegistrationIcon,
  ProfileIcon,
  ManagementIcon,
  PowerManagementIcon,
  AreaControlIcon,
  DeviceControlIcon,
  ChatIcon,
  DocumentIcon,
  PublicFolderIcon,
  PersonalFolderIcon,
  DeliveryLogIcon,
  EmergencyIcon,
  ServiceCenterIcon,
  ServiceCenterDashboardIcon,
  ServiceCenterListIcon,
  EventIcon,
  EventLogIcon,
  EventJoinLogIcon,
} from "../../assets/icons/Icons";

//icon svg
import MENU_LOGO from "../../assets/images/Reslink-Logo.png";

import "../styles/sideMenu.css";

//antd constraints components
const { SubMenu } = Menu;
const main_link = "/dashboard";
// const path = window.location.pathname.split("/");

const SideMenu = () => {
  const dispatch = useDispatch<Dispatch>();
  const navigate = useNavigate();

  const [keyPath, setKeyPath] = useState<string>("");
  const [openKeys, setOpenKeys] = useState<string[]>([]);
  const logoutHandler = () => {
    ConfirmModal({
      title: "Do you want to log out?",
      okMessage: "Yes",
      cancelMessage: "Cancel",
      onOk: onLogoutOk,
      onCancel: onLogoutCancel,
    });
  };

  const onLogoutOk = async () => {
    await dispatch.userAuth.onLogout();
    dispatch.userAuth.updateAuthState(false);
    navigate("/auth", { replace: true });
  };

  const onLogoutCancel = async () => {
    console.log("Cancel");
  };

  const iconMenuColorSelector = (key: string) => {
    // console.log(keyPath);
    // console.log(key);
    // console.log(keyPath.includes(key));

    if (keyPath.includes(key)) return whiteLabel.whiteColor;
    return whiteLabel.mainTextColor;
  };

  const iconSubMenuColorSelector = (key: string) => {
    if (keyPath.includes(key)) return whiteLabel.primaryColor;
    return whiteLabel.subMenuTextColor;
  };

  return (
    <>
      <div className="sideMenuContainer">
        <div className="sideMenuLogo">
          <img style={{ width: "30%" }} src={MENU_LOGO} alt="menuLogo" />
        </div>
        <div className="menuContainer">
          <div>
            <Menu
              defaultSelectedKeys={[window.location.pathname]}
              mode="inline"
              onSelect={({ keyPath }) => {
                setKeyPath(keyPath.toString());
              }}
              onOpenChange={(keys) => {
                const latestOpenKey = keys.find(
                  (key) => openKeys.indexOf(key) === -1
                );
                setOpenKeys(latestOpenKey ? [latestOpenKey] : []);
              }}
              openKeys={openKeys}>
              <Menu.Item
                key={`${main_link}/profile`}
                icon={
                  <ProfileIcon
                    color={iconMenuColorSelector(`profile`)}
                    className="sideMenuIcon"
                  />
                }>
                <Link to={`${main_link}/profile`}>Profile</Link>
              </Menu.Item>

              <Menu.Item
                key={`${main_link}/managementMain`}
                icon={
                  <ManagementIcon
                    color={iconMenuColorSelector("managementMain")}
                    className="sideMenuIcon"
                  />
                }>
                <Link to={`${main_link}/managementMain`}>Management team</Link>
              </Menu.Item>

              {/* User management */}

              <SubMenu
                key="userManagement"
                icon={
                  <UserManagementIcon
                    color={iconMenuColorSelector("userManagement")}
                    className="sideMenuIcon"
                  />
                }
                title="User management">
                <Menu.Item
                  key={`${main_link}/residentInformation`}
                  icon={
                    <ResidentManagementIcon
                      color={iconSubMenuColorSelector("residentInformation")}
                      className="sideMenuIcon"
                    />
                  }>
                  <Link to={`${main_link}/residentInformation`}>
                    Resident’s information
                  </Link>
                </Menu.Item>
                <Menu.Item
                  key={`${main_link}/residentSignUp`}
                  icon={
                    <RegistrationIcon
                      color={iconSubMenuColorSelector("residentSignUp")}
                      className="sideMenuIcon"
                    />
                  }>
                  <Link to={`${main_link}/residentSignUp`}>
                    Resident’s sign up
                  </Link>
                </Menu.Item>
              </SubMenu>

              {/* Facility Center */}

              <SubMenu
                key="facilities"
                icon={
                  <FacilityBookingIcon
                    color={iconMenuColorSelector("facilities")}
                    className="sideMenuIcon"
                  />
                }
                title="Facility booking">
                <Menu.Item
                  key={`${main_link}/reservationDashboard`}
                  icon={
                    <ReservationDashboardIcon
                      color={iconSubMenuColorSelector("reservationDashboard")}
                      className="sideMenuIcon"
                    />
                  }>
                  <Link to={`${main_link}/reservedFacilities`}>Facilities</Link>
                </Menu.Item>
                <Menu.Item
                  key={`${main_link}/reservationList`}
                  icon={
                    <ReservationListIcon
                      color={iconSubMenuColorSelector("reservationList")}
                      className="sideMenuIcon"
                    />
                  }>
                  <Link to={`${main_link}/reservationList`}>
                    Reservation lists
                  </Link>
                </Menu.Item>
              </SubMenu>

              <Menu.Item
                key={`${main_link}/peopleCounting`}
                icon={
                  <PeopleCountingIcon
                    color={iconMenuColorSelector("peopleCounting")}
                    className="sideMenuIcon"
                  />
                }>
                <Link to={`${main_link}/peopleCounting`}>People counting</Link>
              </Menu.Item>
              {/* <Menu.Item
                key={`${main_link}/parcel `}
                icon={
                  <ParcelIcon
                    color={iconMenuColorSelector("parcel")}
                    className="sideMenuIcon"
                  />
                }
              >
                <Link to={`${main_link}/parcel`}>Parcel</Link>
              </Menu.Item> */}

              <Menu.Item
                key={`${main_link}/announcement`}
                icon={
                  <AnnouncementIcon
                    color={iconMenuColorSelector("announcement")}
                    className="sideMenuIcon"
                  />
                }>
                <Link to={`${main_link}/announcement`}>Announcement</Link>
              </Menu.Item>
              
              <Menu.Item
                key={`${main_link}/projectNew`}
                icon={
                  <AnnouncementIcon
                    color={iconMenuColorSelector("projectNew")}
                    className="sideMenuIcon"
                  />
                }>
                <Link to={`${main_link}/projectNew`}>projectNew</Link>
              </Menu.Item>

              <Menu.Item
                key={`${main_link}/liveChat`}
                icon={
                  <ChatIcon
                    color={iconMenuColorSelector("liveChat")}
                    className="sideMenuIcon"
                  />
                }>
                <Link to={`${main_link}/liveChat`}>Live chat</Link>
              </Menu.Item>

              {/* <div className={"group-name"}>Document</div> */}
              <SubMenu
                key="Document forms"
                icon={
                  <DocumentIcon
                    color={iconMenuColorSelector("document")}
                    className="sideMenuIcon"
                  />
                }
                title="Document forms">
                <Menu.Item
                  key={`${main_link}11`}
                  icon={
                    <PublicFolderIcon
                      color={iconSubMenuColorSelector("publicFolder")}
                      className="sideMenuIcon"
                    />
                  }>
                  <Link to={`${main_link}/public-folder`}>Public folder</Link>
                </Menu.Item>
                <Menu.Item
                  key={`${main_link}12`}
                  icon={
                    <PersonalFolderIcon
                      color={iconSubMenuColorSelector("personalFolder")}
                      className="sideMenuIcon"
                    />
                  }>
                  <Link to={`${main_link}/personal-folder`}>
                    Personal folder
                  </Link>
                </Menu.Item>
              </SubMenu>

              <Menu.Item
                key={`${main_link}16`}
                icon={
                  <DeliveryLogIcon
                    color={iconSubMenuColorSelector("delivery-logs")}
                    className="sideMenuIcon"
                  />
                }>
                <Link to={`${main_link}/delivery-logs`}>Delivery logs</Link>
              </Menu.Item>
              <Menu.Item
                key={`${main_link}/emergencyCall`}
                icon={
                  <EmergencyIcon
                    color={iconMenuColorSelector("emergencyCall")}
                    className="sideMenuIcon"
                  />
                }>
                <Link to={`${main_link}/emergencyCall`}>Emergency Call</Link>
              </Menu.Item>

              <SubMenu
                key="seviceCenter"
                icon={
                  <ServiceCenterIcon
                    color={iconMenuColorSelector("serviceDashboard")}
                    className="sideMenuIcon"
                  />
                }
                title="Service Center">
                <Menu.Item
                  key={`${main_link}/serviceDashboard`}
                  icon={
                    <ServiceCenterDashboardIcon
                      color={iconSubMenuColorSelector("serviceDashboard")}
                      className="sideMenuIcon"
                    />
                  }>
                  <Link to={`${main_link}/serviceDashboard`}>
                    Service Center Dashboard
                  </Link>
                </Menu.Item>
                <Menu.Item
                  key={`${main_link}/ServiceCenterLists`}
                  icon={
                    <ServiceCenterListIcon
                      color={iconSubMenuColorSelector("ServiceCenterLists")}
                      className="sideMenuIcon"
                    />
                  }>
                  <Link to={`${main_link}/serviceCenterLists`}>
                    Service Center Lists
                  </Link>
                </Menu.Item>
                <Menu.Item
                  key={`${main_link}/ServiceChat`}
                  icon={
                    <ChatIcon
                      color={iconSubMenuColorSelector("ServiceChat")}
                      className="sideMenuIcon"
                    />
                  }>
                  <Link to={`${main_link}/ServiceChat`}>Messages</Link>
                </Menu.Item>
              </SubMenu>
              <SubMenu
                key="event"
                icon={
                  <EventIcon
                    color={iconMenuColorSelector("event")}
                    className="sideMenuIcon"
                  />
                }
                title="Event">
                <Menu.Item
                  key={`${main_link}event-logs`}
                  icon={
                    <EventLogIcon
                      color={iconMenuColorSelector("event-logs")}
                      className="sideMenuIcon"
                    />
                  }>
                  <Link to={`${main_link}/event-logs`}>Event logs</Link>
                </Menu.Item>
                <Menu.Item
                  key={`${main_link}event-joining-logs`}
                  icon={
                    <EventJoinLogIcon
                      color={iconMenuColorSelector("event-joining-logs")}
                      className="sideMenuIcon"
                    />
                  }>
                  <Link to={`${main_link}/event-joining-logs`}>
                    Event joining logs
                  </Link>
                </Menu.Item>
              </SubMenu>
              {/* <SubMenu
                key="powerManagement"
                icon={
                  <PowerManagementIcon
                    color={iconMenuColorSelector("powerManagement")}
                    className="sideMenuIcon"
                  />
                }
                title="Power management">
                <Menu.Item
                  key={`${main_link}/areaControl`}
                  icon={
                    <AreaControlIcon
                      color={iconMenuColorSelector("areaControl")}
                      className="sideMenuIcon"
                    />
                  }>
                  <Link to={`${main_link}/areaControl`}>Area control</Link>
                </Menu.Item>
                <Menu.Item
                  key={`${main_link}/deviceControl`}
                  icon={
                    <DeviceControlIcon
                      color={iconMenuColorSelector("deviceControl")}
                      className="sideMenuIcon"
                    />
                  }>
                  <Link to={`${main_link}/deviceControl`}>Device control</Link>
                </Menu.Item>
              </SubMenu> */}
            </Menu>
          </div>
          <div>
            <Menu
              style={{ marginBottom: "auto" }}
              mode="inline"
              selectable={false}>
              <Menu.Item
                key="auth"
                icon={
                  <LogOutIcon
                    color={whiteLabel.logoutColor}
                    className="sideMenuIcon"
                  />
                }
                onClick={logoutHandler}
                style={{ alignSelf: "end", bottom: 0 }}>
                <span style={{ color: whiteLabel.logoutColor }}>Logout</span>
              </Menu.Item>
              <div className="textVersion">version {APP_VERSION}</div>
            </Menu>
          </div>
        </div>
      </div>
    </>
  );
};

export default SideMenu;
