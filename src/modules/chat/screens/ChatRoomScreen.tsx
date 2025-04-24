import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Dispatch, RootState } from "../../../stores";
import {
  ChatListDataType,
  ChatDataType,
} from "../../../stores/interfaces/Chat";
// import { whiteLabel } from "../../../configs/theme";
import { socket } from "../../../configs/socket";
import {
  getChatListQuery,
  getUnitQuery,
  getNameByUnitIDQuery,
  getChatDataByIDQuery,
} from "../../../utils/queries";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";

import Header from "../../../components/templates/Header";
import ChatBoxContainer from "../components/ChatBoxContainer";
import ChatList from "../components/ChatList";
import { AdjustmentIcon } from "../../../assets/icons/Icons";
import { Row, Col, Dropdown, Button, Menu, Spin, Select } from "antd";

import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import "../styles/chatRoom.css";

interface ChatBoxContainerRef {
  handleIncomingChat: () => void;
}

const ChatRoom = () => {
  // Variables
  const dispatch = useDispatch<Dispatch>();
  const chatContainerRef = useRef<ChatBoxContainerRef>(null);
  const queryClient = useQueryClient();
  const { chatListSortBy } = useSelector((state: RootState) => state.chat);
  const [activeUserID, setActiveUserID] = useState("");
  const [currentChat, setCurrentChat] = useState<ChatListDataType>();
  const [currentChatUserID, setCurrentChatUserID] = useState("");
  // const [chatListSortBy, setChatListSortBy] = useState("time");
  const [unitID, setUnitID] = useState("");
  const [shouldFetch, setShouldFetch] = useState(false);
  const [roomAddressSelect, setRoomAddressSelect] = useState();
  const [userSelectValue, setUserSelectValue] = useState("");

  // API
  const {
    data: chatListData,
    isLoading: isChatListLoading,
    refetch: refetchChatList,
  } = getChatListQuery({
    sortBy: chatListSortBy,
  });

  const { data: unitsData, isLoading: isUnitsLoading } = getUnitQuery();

  const { data: nameByUnitData, refetch: loadNewNameWithUnitId } =
    getNameByUnitIDQuery({
      id: unitID,
      shouldFetch: shouldFetch,
    });

  const { refetch: updateChatData } = getChatDataByIDQuery({
    id: currentChat?.userId ?? "",
  });

  // Functions

  const handleUnitChange = async (value: string, option: any) => {
    // console.log(value);
    // console.log(unitsData);
    setRoomAddressSelect(option.roomAddress);
    setUserSelectValue("");
    setShouldFetch(true);
    setUnitID(value.toString());
    if (shouldFetch && unitID) {
      await loadNewNameWithUnitId();
    }
  };

  const onUserSelectByUnit = (userId: string, option: any) => {
    console.log(userId);
    console.log(option);

    let payload = {
      userId: userId,
      firstName: option.firstName,
      lastName: option.lastName,
      roomAddress: roomAddressSelect,
    };
    setCurrentChatUserID(userId);
    setUserSelectValue(userId);
    onUserSelected(payload);
    setActiveUserID(userId);
  };

  const handleMenuClick = (e: any) => {
    dispatch.chat.updateSortByData(e.key);
    // setChatListSortBy(e.key);
  };

  const onUserSelected = (item: any) => {
    setCurrentChat(item);
  };

  const onUserListSelected = async (item: ChatListDataType, index: number) => {
    let seenData = chatListData;
    cleanSelectedMenu();
    setCurrentChatUserID(item.userId);
    onUserSelected(item);
    setActiveUserID(item.userId);
    if (seenData) seenData[index].juristicSeen = true;
  };

  const onChatIncoming = async () => {
    await updateChatData();
  };

  const cleanSelectedMenu = () => {
    setRoomAddressSelect(undefined);
    setUserSelectValue("");
  };

  const menu = (
    <Menu onClick={handleMenuClick}>
      <Menu.Item key="time">Time Received</Menu.Item>
      <Menu.Item key="unread">Unread Messages</Menu.Item>
    </Menu>
  );

  // Actions
  useEffect(() => {
    socket.connect();
    socket.on("connect", () => {
      // console.log("Socket.IO Connection Opened");
    });
    socket.on("chat-list", () => {
      refetchChatList();
    });
    socket.on(`chat-usr-${currentChatUserID}`, (cmd) => {
      if (cmd.cmd === "new_message") {
        onChatIncoming();
      } else if (cmd.cmd === "seen") {
        queryClient.setQueryData(
          ["chatDataByID", currentChatUserID],
          (oldData: ChatDataType[]) => {
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
  }, [currentChatUserID]);

  useEffect(() => {
    dispatch.chat.updateSortByData("time");
  }, [location.pathname]);

  return (
    <>
      <Header title="Chat Room" />
      <Row className="chatRoomContainer">
        <Col span={8} className="leftSideChatContainer">
          <Row className="filterContainer_CR">
            <Col span={20}>
              <Row justify={"space-between"} align={"middle"}>
                <Select
                  size="large"
                  placeholder="Select a unit"
                  style={{ width: "49%" }}
                  value={roomAddressSelect}
                  onChange={handleUnitChange}
                  options={unitsData}
                  optionLabelProp="roomAddress"
                  fieldNames={{ value: "id", label: "roomAddress" }}
                  loading={isUnitsLoading}
                  filterOption={(input, option) =>
                    (option?.roomAddress ?? "").includes(input)
                  }
                  showSearch
                />
                <Select
                  size="large"
                  value={userSelectValue}
                  style={{ width: "49%" }}
                  onChange={onUserSelectByUnit}
                  options={nameByUnitData}
                  fieldNames={{ value: "userId", label: "fullName" }}
                  disabled={!unitID}
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
            {isChatListLoading ? (
              <div style={{ textAlign: "center", marginTop: "20px" }}>
                <Spin />
              </div>
            ) : (
              chatListData?.map((item, index) => {
                return (
                  <ChatList
                    key={index}
                    activeUserID={activeUserID}
                    index={index}
                    item={item}
                    onUserListSelected={onUserListSelected}
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
            <ChatBoxContainer chatData={currentChat} ref={chatContainerRef} />
          </div>
        </Col>
      </Row>
    </>
  );
};

export default ChatRoom;
