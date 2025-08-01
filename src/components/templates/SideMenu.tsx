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
  RoomManagementIcon,
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
  ProfileIcon,
  EventIcon,
  EventLogIcon,
  EventJoinLogIcon,
  VisitorManagementLogIcon,
  WarrantyTrackingIcon,
  SOSWarningIcon,
  AddLocationIcon,
  SOSBuildingPlanIcon,
  FacilityMenuIcon,
  FacilityIcon,
  FacilityBookingIcon,
  ParcelDashboard,
  Parcel,
  ParcelDeliveryLogIcon,
} from "../../assets/icons/Icons";

import MENU_LOGO from "../../assets/images/Reslink-Logo.png";
import "../styles/sideMenu.css";

// Custom CSS สำหรับ badge animations
const badgeAnimationStyles = `
  @keyframes emergencyPulse {
    0% { 
      box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
    }
    100% { 
      box-shadow: 0 0 0 20px rgba(239, 68, 68, 0);
    }
  }
  
  @keyframes warningPulse {
    0% { 
      box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.7);
    }
    100% { 
      box-shadow: 0 0 0 20px rgba(245, 158, 11, 0);
    }
  }
  
  .emergency-badge {
    animation: emergencyPulse 1.5s ease-in-out infinite;
  }
  
  .warning-badge {
    animation: warningPulse 1.5s ease-in-out infinite;
  }
`;

// เพิ่ม styles ลงใน document head
if (typeof document !== "undefined") {
  const styleElement = document.createElement("style");
  styleElement.textContent = badgeAnimationStyles;
  if (!document.head.querySelector("[data-badge-animations]")) {
    styleElement.setAttribute("data-badge-animations", "true");
    document.head.appendChild(styleElement);
  }
}

const { SubMenu } = Menu;
const main_link = "/dashboard";

const SideMenu = ({
  onMenuChange,
  dataEmergency,
}: {
  onMenuChange: () => void;
  dataEmergency: any;
}) => {
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
      switch (true) {
        case pathname.includes("/residentInformation") ||
          pathname.includes("/residentActivation"):
          return ["userManagement"];

        case pathname.includes("/juristicInvitation") ||
          pathname.includes("/juristicManage"):
          return ["managementTeam"];

        case pathname.includes("/invitation") ||
          pathname.includes("/userManagement") ||
          pathname.includes("/roomManagement") ||
          pathname.includes("/juristicInvitation") ||
          pathname.includes("/juristicManage"):
          return ["management"];

        case pathname.includes("/houseDocument") ||
          pathname.includes("/projectInfo"):
          return ["documents"];

        case pathname.includes("/serviceDashboard") ||
          pathname.includes("/serviceCenterLists") ||
          pathname.includes("/ServiceChat"):
          return ["serviceCenter"];

        case pathname.includes("/event-logs") ||
          pathname.includes("/event-joining-logs") ||
          pathname.includes("/visitor-management-log"):
          return ["event"];

        case pathname.includes("/sos-warning") ||
          pathname.includes("/sos-building-plan"):
          return ["sos"];

        case pathname.includes("/facility") ||
          pathname.includes("/bookingList"):
          return ["facilityBooking"];

        case pathname.includes("/parcel-dashboard") ||
          pathname.includes("/parcel-delivery-logs"):
          return ["parcel"];

        default:
          return [];
      }
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
            onMenuChange();
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
            key="managementTeam"
            icon={
              <UserManagementIcon
                color={iconMenuColorSelector("managementTeam")}
                className="sideMenuIcon"
              />
            }
            title="Management team">
            <Menu.Item
              key={`${main_link}/juristicInvitation`}
              icon={
                <ResidentManagementIcon
                  color={iconSubMenuColorSelector("juristicInvitation")}
                  className="sideMenuIcon"
                />
              }>
              <Link to={`${main_link}/juristicInvitation`}>
                Juristic invitations
              </Link>
            </Menu.Item>

            <Menu.Item
              key={`${main_link}/juristicManage`}
              icon={
                <ResidentManagementIcon
                  color={iconSubMenuColorSelector("juristicManage")}
                  className="sideMenuIcon"
                />
              }>
              <Link to={`${main_link}/juristicManage`}>
                Juristic management
              </Link>
            </Menu.Item>
          </SubMenu>
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
            <Menu.Item
              key={`${main_link}/roomManagement`}
              icon={
                <RoomManagementIcon
                  color={iconSubMenuColorSelector("roomManagement")}
                  className="sideMenuIcon"
                />
              }>
              <Link to={`${main_link}/roomManagement`}>Room management</Link>
            </Menu.Item>
          </SubMenu>
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
          {/* <SubMenu
            key="parcel"
            icon={
              <Parcel
                color={iconMenuColorSelector("parcel")}
                className="sideMenuIcon"
              />
            }
            title="Parcel">
            <Menu.Item
              key={`${main_link}/parcel-dashboard`}
              icon={
                <ParcelDashboard
                  color={iconMenuColorSelector("parcel-dashboard")}
                  className="sideMenuIcon"
                />
              }>
              <Link to={`${main_link}/parcel-dashboard`}>Parcel Dashboard</Link>
            </Menu.Item>
            <Menu.Item
              key={`${main_link}/parcel-delivery-logs`}
              icon={
                <ParcelDeliveryLogIcon
                  color={iconMenuColorSelector("parcel-delivery-logs")}
                  className="sideMenuIcon"
                />
              }>
              <Link to={`${main_link}/parcel-delivery-logs`}>Parcel</Link>
            </Menu.Item>
          </SubMenu> */}
          <Menu.Item
            key={`${main_link}/delivery-logs`}
            icon={
              <DeliveryLogIcon
                color={iconMenuColorSelector("delivery-logs")}
                className="sideMenuIcon"
              />
            }>
            <Link to={`${main_link}/delivery-logs`}>Parcel</Link>
          </Menu.Item>
          <Menu.Item
            key={`${main_link}/contactLists`}
            icon={
              <ContactListIcon
                color={iconMenuColorSelector("contactLists")}
                className="sideMenuIcon"
              />
            }>
            <Link to={`${main_link}/contactLists`}>Contact lists</Link>
          </Menu.Item>
          <SubMenu
            key="serviceCenter"
            icon={
              <FixingReportIcon
                color="#3B82F6" // สีฟ้าสำหรับ parent menu icon default
                className="sideMenuIcon"
              />
            }
            title="Repair">
            <Menu.Item
              key={`${main_link}/serviceDashboard`}
              icon={
                <FixingReportDashboardIcon
                  color={iconSubMenuColorSelector("serviceDashboard")}
                  className="sideMenuIcon"
                />
              }>
              <Link to={`${main_link}/serviceDashboard`}>
                Repair report dashboard
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
                Repair report lists
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
            key="facilityBooking"
            icon={
              <FacilityMenuIcon
                color={iconMenuColorSelector("facilityBooking")}
                className="sideMenuIcon"
              />
            }
            title="Facility booking">
            <Menu.Item
              key={`${main_link}/facility`}
              icon={
                <FacilityIcon
                  color={iconSubMenuColorSelector("facility")}
                  className="sideMenuIcon"
                />
              }>
              <Link to={`${main_link}/facility`}>Facility</Link>
            </Menu.Item>
            <Menu.Item
              key={`${main_link}/bookingList`}
              icon={
                <FacilityBookingIcon
                  color={iconSubMenuColorSelector("bookingList")}
                  className="sideMenuIcon"
                />
              }>
              <Link to={`${main_link}/bookingList`}>Booking list</Link>
            </Menu.Item>
          </SubMenu>

          <SubMenu
            key="sos"
            icon={
              <SOSWarningIcon
                color={iconMenuColorSelector("sos")}
                className="sideMenuIcon"
              />
            }
            title={
              <div className="flex items-center justify-start w-full">
                <span className="mr-auto">SOS</span>
                <div className="flex  items-center space-x-1 mr-6">
                  {dataEmergency?.emergency?.length > 0 && (
                    <span className="bg-red-500 text-white rounded-full text-xs px-2 py-0.5 min-w-[20px] text-center font-medium emergency-badge">
                      {dataEmergency.emergency.length}
                    </span>
                  )}
                  {dataEmergency?.deviceWarning?.length > 0 && (
                    <span className="bg-yellow-500 text-white rounded-full text-xs px-2 py-0.5 min-w-[20px] text-center font-medium ms-2 warning-badge">
                      {dataEmergency.deviceWarning.length}
                    </span>
                  )}
                </div>
              </div>
            }>
            <Menu.Item
              key={`${main_link}/add-location`}
              icon={
                <AddLocationIcon
                  color={iconSubMenuColorSelector("add-location")}
                  className="sideMenuIcon"
                />
              }>
              <Link to={`${main_link}/add-location`}>Add location</Link>
            </Menu.Item>
            <Menu.Item
              key={`${main_link}/building-plan`}
              icon={
                <SOSBuildingPlanIcon
                  color={iconSubMenuColorSelector("building-plan")}
                  className="sideMenuIcon"
                />
              }>
              <Link to={`${main_link}/building-plan`}>Building plan</Link>
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
            <Link to={`${main_link}/warranty-tracking`}>Warranty tracking</Link>
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
