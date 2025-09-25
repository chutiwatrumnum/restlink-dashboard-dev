import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Dispatch, RootState } from "../../../stores";
import { socket } from "../../../configs/socket";

import {
  getServiceChatListQuery,
  getOptionsChatListQuery,
  getServiceChatDataByIDQuery,
} from "../../../utils/queriesGroup/serviceQueries";
import { useQueryClient } from "@tanstack/react-query";

import Header from "../../../components/templates/Header";
import ServiceChatBoxContainer from "../components/ServiceChatBoxContainer";
import ServiceChatList from "../components/ServiceChatList";
import { AdjustmentIcon } from "../../../assets/icons/Icons";
import { Row, Col, Dropdown, Button, Menu, Spin, Select, Tabs } from "antd";

import {
  ServiceChatListDataType,
  ServiceChatDataType,
} from "../../../stores/interfaces/Service";
import type { TabsProps } from "antd";

import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import "../styles/serviceChat.css";

const ServiceChat = () => {
  const dispatch = useDispatch<Dispatch>();
  const queryClient = useQueryClient();
  const { chatListSortBy } = useSelector((state: RootState) => state.chat);
  const { status } = useSelector((state: RootState) => state.serviceCenter);

  const [activeServiceId, setActiveServiceId] = useState(-1);
  const [currentChat, setCurrentChat] = useState<
    ServiceChatListDataType | undefined
  >();
  const [currentServiceId, setCurrentServiceId] = useState("");
  const [currentTab, setCurrentTab] = useState("in_progress"); // เพิ่ม state สำหรับ tab

  // API calls
  const {
    data: serviceChatListData,
    isLoading: isServiceChatListLoading,
    refetch: refetchServiceChatList,
  } = getServiceChatListQuery({
    sortBy: chatListSortBy,
    status: status,
  });

  const { data: chatListOptions, isLoading: isChatListOptionsLoading } =
    getOptionsChatListQuery();

  const { refetch: updateChatData } = getServiceChatDataByIDQuery({
    id: currentServiceId ?? "",
  });

  // Filter chat list options based on current tab
  const filteredChatOptions = chatListOptions?.filter((option) => {
    // Try different possible field paths for service status
    const serviceStatus =
      option.serviceStatus ||
      option.status ||
      option.service?.status?.nameEn ||
      option.service?.status?.nameCode;

    if (currentTab === "in_progress") {
      const inProgressStatuses = [
        "Pending",
        "Waiting for confirmation",
        "Confirm appointment",
        "Repairing",
        "pending",
        "waiting_for_confirmation",
        "confirm_appointment",
        "repairing",
      ];
      return inProgressStatuses.includes(serviceStatus);
    } else if (currentTab === "history") {
      const historyStatuses = ["Success", "Closed", "success", "closed"];
      return historyStatuses.includes(serviceStatus);
    }

    return true;
  });

  const filteredChatData = serviceChatListData?.filter((item) => {
    const serviceStatus =
      item.service?.serviceStatus?.nameEn || item.serviceStatus;

    if (currentTab === "in_progress") {
      // In Progress: Pending, Waiting for confirmation, Confirm appointment, Repairing
      return [
        "Pending",
        "Waiting for confirmation",
        "Confirm appointment",
        "Repairing",
      ].includes(serviceStatus);
    } else if (currentTab === "history") {
      // History: Success, Closed
      return ["Success", "Closed"].includes(serviceStatus);
    }

    return true; // fallback
  });

  // Functions
  const handleServiceSelected = async (serviceId: number, option: any) => {
    // Check if the selected service matches current tab filter
    const serviceStatus =
      option.serviceStatus ||
      option.status ||
      option.service?.status?.nameEn ||
      option.service?.status?.nameCode;

    let isValidForCurrentTab = false;
    if (currentTab === "in_progress") {
      const inProgressStatuses = [
        "Pending",
        "Waiting for confirmation",
        "Confirm appointment",
        "Repairing",
        "pending",
        "waiting_for_confirmation",
        "confirm_appointment",
        "repairing",
      ];
      isValidForCurrentTab = inProgressStatuses.includes(serviceStatus);
    } else if (currentTab === "history") {
      const historyStatuses = ["Success", "Closed", "success", "closed"];
      isValidForCurrentTab = historyStatuses.includes(serviceStatus);
    }

    // Only proceed if the service matches current tab
    if (!isValidForCurrentTab) {
      return; // Don't select services that don't match current tab
    }

    // Create proper ServiceChatListDataType object with enhanced data handling
    const chatData: ServiceChatListDataType = {
      serviceId: serviceId,
      serviceType: option.serviceType || "Unknown Service",
      roomAddress: option.roomAddress || "N/A",
      userId: option.userId,

      // Enhanced fields with fallbacks
      messageId: 0,
      message: "",
      type: "text" as const,
      uploadUrl: undefined,
      fileName: undefined,
      seen: true,
      createdAt: new Date().toISOString(),
      lastName: option.lastName || "User",
      firstName: option.firstName || "Unknown",
      middleName: option.middleName || "",
      unit: option.unit || 0,
      serviceDescription: option.serviceDescription || "",
      serviceStatusNameCode: option.serviceStatusNameCode || "unknown",
      serviceStatus: serviceStatus || "Unknown",
      unitNo: option.unitNo || "N/A",
      imageProfile: option.imageProfile || "",
      juristicSeen: true,

      // Add nested objects for compatibility
      service: {
        serviceType: {
          nameEn: option.serviceType || "Unknown Service",
        },
        serviceStatus: {
          nameEn: serviceStatus || "Unknown",
        },
      },
      myHome: {
        unit: {
          roomAddress: option.roomAddress || "N/A",
        },
      },
      user: {
        givenName: option.firstName || "Unknown",
        familyName: option.lastName || "User",
        imageProfile: option.imageProfile || "",
      },
    };

    setActiveServiceId(serviceId);
    onServiceSelected(chatData);
  };

  const handleMenuClick = (e: any) => {
    dispatch.chat.updateSortByData(e.key);
  };

  const onServiceSelected = (item: ServiceChatListDataType) => {
    setCurrentChat(item);
  };

  const onServiceListSelected = async (
    item: ServiceChatListDataType,
    index: number
  ) => {
    let seenData = serviceChatListData;

    setCurrentServiceId(item.serviceId.toString());
    onServiceSelected(item);
    setActiveServiceId(item.serviceId);
    if (seenData) seenData[index].juristicSeen = true;
  };

  // Handle tab change
  const onTabsChange = (key: string) => {
    setCurrentTab(key);

    // Clear current selection when switching tabs
    setCurrentChat(undefined);
    setActiveServiceId(-1);
    setCurrentServiceId("");

    let payload = undefined;

    // Map tab to status for API
    switch (key) {
      case "in_progress":
        payload = "all"; // Get all data and filter on client side
        break;
      case "history":
        payload = "all"; // Get all data and filter on client side
        break;
      default:
        payload = "all";
        break;
    }

    dispatch.serviceCenter.updateStatusData(payload);
  };

  const onChatIncoming = async () => {
    await updateChatData();
  };

  const menu = (
    <Menu onClick={handleMenuClick}>
      <Menu.Item key="time">Time Received</Menu.Item>
      <Menu.Item key="unread">Unread Messages</Menu.Item>
    </Menu>
  );

  // Calculate counts for both tabs
  const inProgressCount =
    serviceChatListData?.filter((item) => {
      const serviceStatus =
        item.service?.serviceStatus?.nameEn ||
        item.service?.serviceStatus?.nameCode ||
        item.serviceStatus ||
        item.service?.status?.nameEn ||
        item.service?.status?.nameCode;

      const inProgressStatuses = [
        "Pending",
        "Waiting for confirmation",
        "Confirm appointment",
        "Repairing",
        "pending",
        "waiting_for_confirmation",
        "confirm_appointment",
        "repairing",
      ];
      return inProgressStatuses.includes(serviceStatus);
    }).length || 0;

  const historyCount =
    serviceChatListData?.filter((item) => {
      const serviceStatus =
        item.service?.serviceStatus?.nameEn ||
        item.service?.serviceStatus?.nameCode ||
        item.serviceStatus ||
        item.service?.status?.nameEn ||
        item.service?.status?.nameCode;

      const historyStatuses = ["Success", "Closed", "success", "closed"];
      return historyStatuses.includes(serviceStatus);
    }).length || 0;

  // Updated tab items with always visible counts
  const tabItems: TabsProps["items"] = [
    {
      key: "in_progress",
      label: (
        <span>
          In Progress
          <span style={{ marginLeft: 8, color: "var(--secondary)" }}>
            ({inProgressCount})
          </span>
        </span>
      ),
    },
    {
      key: "history",
      label: (
        <span>
          History
          <span style={{ marginLeft: 8, color: "var(--secondary)" }}>
            ({historyCount})
          </span>
        </span>
      ),
    },
  ];

  // Actions
  useEffect(() => {
    socket.connect();
    socket.on("connect", () => {
      console.log("Socket.IO Connection Opened");
    });
    socket.on("service-center-chat-list", () => {
      refetchServiceChatList();
    });
    socket.on(`service-center-chat-service-id-${currentServiceId}`, (cmd) => {
      if (cmd.cmd === "new_message") {
        onChatIncoming();
      } else if (cmd.cmd === "seen") {
        queryClient.setQueryData(
          ["serviceChatDataByID", currentServiceId],
          (oldData: ServiceChatDataType[]) => {
            const seenMessages = oldData.map((item) =>
              item.seen === false ? { ...item, seen: true } : item
            );
            return seenMessages;
          }
        );
      }
    });
    socket.on("connect_error", (error) => {
      console.error("Connection Error:", error);
    });
    socket.on("reconnect_attempt", (attempt) => {
      console.log(`Reconnect attempt ${attempt}`);
    });
    socket.on("disconnect", (reason) => {
      console.log("Socket.IO Connection Closed: Reason is =>", reason);
    });

    return () => {
      socket.disconnect();
    };
  }, [currentServiceId]);

  useEffect(() => {
    dispatch.chat.updateSortByData("time");
  }, [location.pathname]);

  return (
    <>
      <Header title="Fixing chat" />

      {/* Updated Tabs */}
      <Tabs
        defaultActiveKey="in_progress"
        items={tabItems}
        onChange={onTabsChange}
        style={{ marginBottom: 16 }}
      />

      <Row className="chatRoomContainer">
        <Col
          xs={{ span: 24 }}
          lg={{ span: 10 }}
          xxl={{ span: 8 }}
          className="leftSideChatContainer">
          <Row className="filterContainer_CR">
            <Col span={20}>
              <Row justify={"space-between"} align={"middle"}>
                <Select
                  size="large"
                  placeholder={
                    currentTab === "in_progress"
                      ? "Select an active service"
                      : "Select a completed service"
                  }
                  style={{ width: "100%" }}
                  onChange={handleServiceSelected}
                  options={filteredChatOptions} // Use filtered options
                  fieldNames={{
                    value: "serviceId",
                    label: "label",
                  }}
                  loading={isChatListOptionsLoading}
                  filterOption={(input, option) =>
                    (option?.label.toUpperCase() ?? "").includes(
                      input.toUpperCase()
                    )
                  }
                  showSearch
                  value={activeServiceId > 0 ? activeServiceId : undefined}
                />
              </Row>
            </Col>
            <Col style={{ display: "flex", justifyContent: "end" }} span={4}>
              <Dropdown overlay={menu} trigger={["click"]}>
                <Button
                  size="large"
                  shape="circle"
                  className="adjustButton"
                  icon={<AdjustmentIcon className="adjustIcon" />}
                />
              </Dropdown>
            </Col>
          </Row>

          <Col className="userListContainer">
            {isServiceChatListLoading ? (
              <div style={{ textAlign: "center", marginTop: "20px" }}>
                <Spin />
              </div>
            ) : (
              // Use filtered data instead of raw data
              filteredChatData?.map((item, index) => {
                return (
                  <ServiceChatList
                    key={index}
                    activeServiceId={activeServiceId}
                    index={index}
                    item={item}
                    onServiceListSelected={onServiceListSelected}
                  />
                );
              })
            )}

            {/* Show message when no data */}
            {!isServiceChatListLoading &&
              (!filteredChatData || filteredChatData.length === 0) && (
                <div
                  style={{
                    textAlign: "center",
                    marginTop: "40px",
                    color: "#999",
                  }}>
                  <p>
                    {currentTab === "in_progress"
                      ? "No active conversations found"
                      : "No completed conversations found"}
                  </p>
                  <p style={{ fontSize: "12px", marginTop: "8px" }}>
                    {currentTab === "in_progress"
                      ? "Services with Pending, Waiting, Confirmed, or Repairing status will appear here"
                      : "Services with Success or Closed status will appear here"}
                  </p>
                </div>
              )}
          </Col>

          <Row className="userListBottomLine">
            <div className="horizontal-line" />
            <p className="centered-text">It is all, nothing more.</p>
            <div className="horizontal-line" />
          </Row>
        </Col>

        <Col
          xs={{ span: 24 }}
          lg={{ span: 14 }}
          xxl={{ span: 16 }}
          style={{ height: "100%" }}>
          <div style={{ position: "relative", height: "100%" }}>
            <ServiceChatBoxContainer chatData={currentChat} />
          </div>
        </Col>
      </Row>
    </>
  );
};

export default ServiceChat;