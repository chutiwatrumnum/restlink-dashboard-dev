import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Dispatch, RootState } from "../../../stores";
// import { whiteLabel } from "../../../configs/theme";
import { socket } from "../../../configs/socket";

import {
  getServiceChatListQuery,
  getOptionsChatListQuery,
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
  // Variables
  const dispatch = useDispatch<Dispatch>();
  const queryClient = useQueryClient();
  const { chatListSortBy } = useSelector((state: RootState) => state.chat);
  const { status } = useSelector((state: RootState) => state.serviceCenter);
  const [activeServiceId, setActiveServiceId] = useState(-1);
  const [currentChat, setCurrentChat] = useState();
  const [currentServiceId, setCurrentServiceId] = useState("");
  // const [chatListSortBy, setChatListSortBy] = useState("time");

  // API
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

  // Functions

  const handleServiceSelected = async (serviceId: number, option: any) => {
    // console.log(serviceId);
    // console.log(option);
    let payload = {
      serviceId: serviceId,
      serviceType: option.serviceType,
      roomAddress: option.roomAddress,
      userId: option.userId,
    };
    setActiveServiceId(serviceId);
    onServiceSelected(payload);
  };

  const handleMenuClick = (e: any) => {
    dispatch.chat.updateSortByData(e.key);
  };

  const onServiceSelected = (item: any) => {
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

  const onTabsChange = (key: string) => {
    let payload = undefined;
    switch (key) {
      case "all":
        payload = "all";
        break;
      case "pending":
        payload = "pending";
        break;
      case "repairing":
        payload = "repairing";
        break;
      case "success":
        payload = "success";
        break;

      default:
        break;
    }

    dispatch.serviceCenter.updateStatusData(payload);
  };

  const onChatIncoming = async () => {
    await refetchServiceChatList();
  };

  const menu = (
    <Menu onClick={handleMenuClick}>
      <Menu.Item key="time">Time Received</Menu.Item>
      <Menu.Item key="unread">Unread Messages</Menu.Item>
    </Menu>
  );

  const tabItems: TabsProps["items"] = [
    {
      key: "all",
      label: "All",
    },
    {
      key: "pending",
      label: "Pending",
    },
    {
      key: "repairing",
      label: "Repairing",
    },
    {
      key: "success",
      label: "Success",
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
        console.log("Seen");
      }
      // chatContainerRef.current?.handleIncomingChat();
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
      <Header title="Messages" />
      <Tabs defaultActiveKey="all" items={tabItems} onChange={onTabsChange} />
      <Row className="chatRoomContainer">
        <Col span={8} className="leftSideChatContainer">
          <Row className="filterContainer_CR">
            <Col span={20}>
              <Row justify={"space-between"} align={"middle"}>
                <Select
                  size="large"
                  placeholder="Select a by service"
                  style={{ width: "100%" }}
                  onChange={handleServiceSelected}
                  options={chatListOptions}
                  fieldNames={{
                    value: "serviceId",
                    label: "label",
                  }}
                  loading={isChatListOptionsLoading}
                  // disabled={isChatListOptionsLoading}
                  filterOption={(input, option) =>
                    (option?.label.toUpperCase() ?? "").includes(
                      input.toUpperCase()
                    )
                  }
                  showSearch
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
              serviceChatListData?.map((item, index) => {
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
          </Col>
          <Row className="userListBottomLine">
            <div className="horizontal-line" />
            <p className="centered-text">It is all, nothing more.</p>
            <div className="horizontal-line" />
          </Row>
        </Col>
        <Col span={16} style={{ height: "100%" }}>
          <div style={{ position: "relative", height: "100%" }}>
            <ServiceChatBoxContainer chatData={currentChat} />
          </div>
        </Col>
      </Row>
    </>
  );
};

export default ServiceChat;
