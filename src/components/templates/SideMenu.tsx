import { useState, useEffect } from "react";
import { Menu } from "antd";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Dispatch } from "../../stores";
import { APP_VERSION } from "../../configs/configs";
import ConfirmModal from "../../components/common/ConfirmModal";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import {
  LogOutIcon,
  AnnouncementIcon,
  ManagementIcon,
  UserManagementIcon,
  ResidentManagementIcon,
  InvitationIcon,
  ChatIcon,
  DocumentIcon,
  HouseDocumentIcon,
  ProjectInfoIcon,
  DeliveryLogIcon,
  ContactListIcon,
  FixingReportIcon,
  FixingReportDashboardIcon,
  FixingReportListIcon,
  FixingReportChatIcon,

  RegistrationIcon,
  ProfileIcon,
  PowerManagementIcon,
  AreaControlIcon,
  DeviceControlIcon,
  EventIcon,
  EventLogIcon,
  EventJoinLogIcon,
  VisitorManagementLogIcon,
  WarrantyTrackingIcon,
  SOSWarningIcon,
  AddLocationIcon,
  SOSBuildingPlanIcon,
} from "../../assets/icons/Icons";

import MENU_LOGO from "../../assets/images/Reslink-Logo.png";
import "../styles/sideMenu.css";

const { SubMenu } = Menu;
const main_link = "/dashboard";

const SideMenu = () => {
  const dispatch = useDispatch<Dispatch>();
  const navigate = useNavigate();
  const location = useLocation();

  const [collapsed, setCollapsed] = useState(() => {
    const savedState = localStorage.getItem("sideMenuCollapsed");
    return savedState === "true";
  });

  const [selectedKeys, setSelectedKeys] = useState<string[]>([
    location.pathname,
  ]);
  const [openKeys, setOpenKeys] = useState<string[]>([]);

  // Update selected keys when location changes
  useEffect(() => {
    const currentPath = location.pathname;
    setSelectedKeys([currentPath]);

    // Find parent menu keys
    const findParentKeys = (pathname: string): string[] => {
      if (
        pathname.includes("/residentInformation") ||
        pathname.includes("/residentActivation")
      ) {
        return ["userManagement"];
      }
      if (
        pathname.includes("/invitation") ||
        pathname.includes("/userManagement") ||
        pathname.includes("/roomManagement")
      ) {
        return ["management"];
      }
      if (
        pathname.includes("/houseDocument") ||
        pathname.includes("/projectInfo")
      ) {
        return ["documents"];
      }
      if (
        pathname.includes("/serviceDashboard") ||
        pathname.includes("/serviceCenterLists") ||
        pathname.includes("/ServiceChat")
      ) {
        return ["serviceCenter"];
      }
      if (
        pathname.includes("/event-logs") ||
        pathname.includes("/event-joining-logs") ||
        pathname.includes("/visitor-management-log")
      ) {
        return ["event"];
      }
      if (
        pathname.includes("/sos-warning") ||
        pathname.includes("/sos-building-plan")
      ) {
        return ["sos"];
      }
      // if (
      //   pathname.includes("/areaControl") ||
      //   pathname.includes("/deviceControl")
      // ) {
      //   return ["powerManagement"];
      // }
      return [];
    };

    if (!collapsed) {
      const parentKeys = findParentKeys(currentPath);
      setOpenKeys(parentKeys);
    } else {
      setOpenKeys([]);
    }
  }, [location.pathname, collapsed]);

  // Save collapsed state
  useEffect(() => {
    localStorage.setItem("sideMenuCollapsed", collapsed.toString());
    window.dispatchEvent(new Event("sideMenuCollapsed"));
  }, [collapsed]);

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  const logoutHandler = () => {
    ConfirmModal({
      title: "Do you want to log out?",
      okMessage: "Yes",
      cancelMessage: "Cancel",
      onOk: async () => {
        await dispatch.userAuth.onLogout();
        dispatch.userAuth.updateAuthState(false);
        navigate("/auth", { replace: true });
      },
      onCancel: () => {
        console.log("Cancel");
      },
    });
  };

  // ฟังก์ชันเลือกสี icon
  const iconMenuColorSelector = (key: string) => {
    return "#3B82F6"; // สีฟ้าสำหรับ icons ทั่วไป
  };

  const iconSubMenuColorSelector = (key: string) => {
    return "#3B82F6"; // สีฟ้าสำหรับ submenu icons
  };

  return (
    <div className={`sideMenuContainer ${collapsed ? "collapsed" : ""}`}>
      <div className="sideMenuHeader">
        <div className="sideMenuLogo">
          {!collapsed ? (
            <img src={MENU_LOGO} alt="Reslink Logo" />
          ) : (
            <div className="collapsedLogo">R</div>
          )}
        </div>
        <button className="collapseToggle" onClick={toggleCollapsed}>
          {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        </button>
      </div>

      <div className="menuWrapper">
        <Menu
          mode="inline"
          selectedKeys={selectedKeys}
          openKeys={openKeys}
          inlineCollapsed={collapsed}
          onSelect={({ key }) => {
            navigate(key);
          }}
          onOpenChange={setOpenKeys}>
          <Menu.Item
            key={`${main_link}/profile`}
            icon={
              <ProfileIcon
                color={iconMenuColorSelector("profile")}
                className="sideMenuIcon"
              />
            }>
            <Link to={`${main_link}/profile`}>Profile</Link>
          </Menu.Item>
          <SubMenu
            key="management"
            icon={
              <UserManagementIcon
                color={iconMenuColorSelector("management")}
                className="sideMenuIcon"
              />
            }
            title="Management">
            <Menu.Item
              key={`${main_link}/invitation`}
              icon={
                <InvitationIcon
                  color={iconSubMenuColorSelector("invitation")}
                  className="sideMenuIcon"
                />
              }>
              <Link to={`${main_link}/invitation`}>Invitations</Link>
            </Menu.Item>
            <Menu.Item
              key={`${main_link}/userManagement`}
              icon={
                <ResidentManagementIcon
                  color={iconSubMenuColorSelector("userManagement")}
                  className="sideMenuIcon"
                />
              }>
              <Link to={`${main_link}/userManagement`}>User management</Link>
            </Menu.Item>
            {/* <Menu.Item
                  key={`${main_link}/roomManagement`}
                  icon={
                    <RegistrationIcon
                      color={iconSubMenuColorSelector("roomManagement")}
                      className="sideMenuIcon"
                    />
                  }
                >
                  <Link to={`${main_link}/roomManagement`}>
                    Room management
                  </Link>
                </Menu.Item> */}
          </SubMenu>

          {/* <SubMenu
            key="userManagement"
            icon={
              <UserManagementIcon
                color="#3B82F6" // สีฟ้าสำหรับ parent menu icon default
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
                Resident's information
              </Link>
            </Menu.Item>
            <Menu.Item
              key={`${main_link}/residentActivation`}
              icon={
                <RegistrationIcon
                  color={iconSubMenuColorSelector("residentActivation")}
                  className="sideMenuIcon"
                />
              }>
              <Link to={`${main_link}/residentActivation`}>
                Resident's invitations
              </Link>
            </Menu.Item>
          </SubMenu> */}
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
            key={`${main_link}/liveChat`}
            icon={
              <ChatIcon
                color={iconMenuColorSelector("liveChat")}
                className="sideMenuIcon"
              />
            }>
            <Link to={`${main_link}/liveChat`}>Chat</Link>
          </Menu.Item>
          <SubMenu
            key="documents"
            icon={
              <DocumentIcon
                color="#3B82F6" // สีฟ้าสำหรับ parent menu icon default
                className="sideMenuIcon"
              />
            }
            title="Documents">
            <Menu.Item
              key={`${main_link}/houseDocument`}
              icon={
                <HouseDocumentIcon
                  color={iconSubMenuColorSelector("houseDocument")}
                  className="sideMenuIcon"
                />
              }>
              <Link to={`${main_link}/houseDocument`}>House documents</Link>
            </Menu.Item>
            <Menu.Item
              key={`${main_link}/projectInfo`}
              icon={
                <ProjectInfoIcon
                  color={iconSubMenuColorSelector("projectInfo")}
                  className="sideMenuIcon"
                />
              }>
              <Link to={`${main_link}/projectInfo`}>Project info</Link>
            </Menu.Item>
          </SubMenu>
          <Menu.Item
            key={`${main_link}/delivery-logs`}
            icon={
              <DeliveryLogIcon
                color={iconMenuColorSelector("delivery-logs")}
                className="sideMenuIcon"
              />
            }>
            <Link to={`${main_link}/delivery-logs`}>Delivery logs</Link>
          </Menu.Item>
          <Menu.Item
            key={`${main_link}/contactLists`}
            icon={
              <ContactListIcon
                color={iconMenuColorSelector("contactLists")}
                className="sideMenuIcon"
              />
            }>
            <Link to={`${main_link}/contactLists`}>Contact Lists</Link>
          </Menu.Item>
          <SubMenu
            key="serviceCenter"
            icon={
              <FixingReportIcon
                color="#3B82F6" // สีฟ้าสำหรับ parent menu icon default
                className="sideMenuIcon"
              />
            }
            title="Fixing Report">
            <Menu.Item
              key={`${main_link}/serviceDashboard`}
              icon={
                <FixingReportDashboardIcon
                  color={iconSubMenuColorSelector("serviceDashboard")}
                  className="sideMenuIcon"
                />
              }>
              <Link to={`${main_link}/serviceDashboard`}>
                Fixing Report Dashboard
              </Link>
            </Menu.Item>
            <Menu.Item
              key={`${main_link}/serviceCenterLists`}
              icon={
                <FixingReportListIcon
                  color={iconSubMenuColorSelector("serviceCenterLists")}
                  className="sideMenuIcon"
                />
              }>
              <Link to={`${main_link}/serviceCenterLists`}>
                Fixing Report Lists
              </Link>
            </Menu.Item>
            <Menu.Item
              key={`${main_link}/ServiceChat`}
              icon={
                <FixingReportChatIcon
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
                color="#3B82F6" // สีฟ้าสำหรับ parent menu icon default
                className="sideMenuIcon"
              />
            }
            title="Event">
            <Menu.Item
              key={`${main_link}/event-logs`}
              icon={
                <EventLogIcon
                  color={iconSubMenuColorSelector("event-logs")}
                  className="sideMenuIcon"
                />
              }>
              <Link to={`${main_link}/event-logs`}>Event logs</Link>
            </Menu.Item>
            <Menu.Item
              key={`${main_link}/event-joining-logs`}
              icon={
                <EventJoinLogIcon
                  color={iconSubMenuColorSelector("event-joining-logs")}
                  className="sideMenuIcon"
                />
              }>
              <Link to={`${main_link}/event-joining-logs`}>
                Event joining logs
              </Link>
            </Menu.Item>
            <Menu.Item
              key={`${main_link}/visitor-management-log`}
              icon={
                <VisitorManagementLogIcon
                  color={iconSubMenuColorSelector("visitor-management-log")}
                  className="sideMenuIcon"
                />
              }>
              <Link to={`${main_link}/visitor-management-log`}>
                Visitor management log
              </Link>
            </Menu.Item>
          </SubMenu>
          {/* <SubMenu
            key="powerManagement"
            icon={
              <PowerManagementIcon
                color="#3B82F6" // สีฟ้าสำหรับ parent menu icon default
                className="sideMenuIcon"
              />
            }
            title="Power management"
          >
            <Menu.Item
              key={`${main_link}/areaControl`}
              icon={
                <AreaControlIcon
                  color={iconMenuColorSelector("areaControl")}
                  className="sideMenuIcon"
                />
              }
            >
              <Link to={`${main_link}/areaControl`}>Area control</Link>
            </Menu.Item>
            <Menu.Item
              key={`${main_link}/deviceControl`}
              icon={
                <DeviceControlIcon
                  color={iconMenuColorSelector("deviceControl")}
                  className="sideMenuIcon"
                />
              }
            >
              <Link to={`${main_link}/deviceControl`}>Device control</Link>
            </Menu.Item>
          </SubMenu> */}

          <SubMenu
            key="sos"
            icon={
              <SOSWarningIcon
                color={iconMenuColorSelector("sos")}
                className="sideMenuIcon"
              />
            }
            title="SOS">
            <Menu.Item
              key={`${main_link}/sos-warning`}
              icon={
                <AddLocationIcon
                  color={iconSubMenuColorSelector("sos-warning")}
                  className="sideMenuIcon"
                />
              }>
              <Link to={`${main_link}/sos-warning`}>Upload Plan</Link>
            </Menu.Item>
            <Menu.Item
              key={`${main_link}/sos-building-plan`}
              icon={
                <SOSBuildingPlanIcon
                  color={iconSubMenuColorSelector("sos-building-plan")}
                  className="sideMenuIcon"
                />
              }>
              <Link to={`${main_link}/sos-building-plan`}>
                SOS Building Plan
              </Link>
            </Menu.Item>
          </SubMenu>
          <Menu.Item
            key={`${main_link}/warranty-tracking`}
            icon={
              <WarrantyTrackingIcon
                color={iconMenuColorSelector("warranty-tracking")}
                className="sideMenuIcon"
              />
            }>
            <Link to={`${main_link}/warranty-tracking`}>Warranty Tracking</Link>
          </Menu.Item>
        </Menu>
      </div>

      <div className="sideMenuFooter">
        <Menu mode="inline" selectable={false} inlineCollapsed={collapsed}>
          <Menu.Item
            key="logout"
            icon={
              <LogOutIcon
                color="#9CA3AF" // สีเทาสำหรับ logout
                className="sideMenuIcon"
              />
            }
            onClick={logoutHandler}>
            <span style={{ color: "#9CA3AF" }}>Logout</span>
          </Menu.Item>
        </Menu>
        {!collapsed && <div className="textVersion">version {APP_VERSION}</div>}
      </div>
    </div>
  );
};

export default SideMenu;
