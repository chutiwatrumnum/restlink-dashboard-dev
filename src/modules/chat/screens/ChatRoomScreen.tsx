import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Dispatch, RootState } from "../../../stores";
import {
  ChatListDataType,
  ChatDataType,
} from "../../../stores/interfaces/Chat";
import { socket } from "../../../configs/socket";
import {
  getChatListQuery,
  getUnitQuery,
  getNameByUnitIDQuery,
  getChatDataByIDQuery,
} from "../../../utils/queries";
import { useQueryClient } from "@tanstack/react-query";

import Header from "../../../components/templates/Header";
import ChatBoxContainer from "../components/ChatBoxContainer";
import ChatList from "../components/ChatList";
import { AdjustmentIcon } from "../../../assets/icons/Icons";
import { Row, Col, Dropdown, Button, Menu, Spin, Select } from "antd";

import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import "../styles/chatRoom.css";

// ⭐ import usePermission
import { usePermission } from "../../../utils/hooks/usePermission";

const ChatRoom = () => {
  // Variables
  const dispatch = useDispatch<Dispatch>();
  const queryClient = useQueryClient();
  const { chatListSortBy } = useSelector((state: RootState) => state.chat);

  // ⭐ ใช้ permission จาก state.common
  const permissions = useSelector(
    (state: RootState) => state.common?.permission
  );
  const { access } = usePermission(permissions);

  const [activeChecker, setActiveChecker] = useState<[string, number]>([
    "",
    -1,
  ]);
  const [currentChat, setCurrentChat] = useState<ChatListDataType>();
  const [currentChatUserID, setCurrentChatUserID] = useState("");
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

  const {
    data: nameByUnitData,
    refetch: loadNewNameWithUnitId,
    isLoading: isNameLoading,
  } = getNameByUnitIDQuery({
    id: unitID,
    shouldFetch: shouldFetch,
  });

  const { refetch: updateChatData } = getChatDataByIDQuery({
    id: currentChat?.userId ?? "",
    unitId: currentChat?.myHome?.unitId ?? -1,
  });

  // Functions
  const handleUnitChange = async (value: string, option: any) => {
    setRoomAddressSelect(option.roomAddress);
    setUserSelectValue("");
    setShouldFetch(true);
    setUnitID(value.toString());
    if (shouldFetch && unitID) {
      await loadNewNameWithUnitId();
    }
  };

  const onUserSelectByUnit = (userId: string, option: any) => {
    setCurrentChat(option);
    setCurrentChatUserID(userId);
    setUserSelectValue(userId);
    setActiveChecker([userId, option?.unitId]);
  };

  const handleMenuClick = (e: any) => {
    dispatch.chat.updateSortByData(e.key);
  };

  const onUserListSelected = async (item: ChatListDataType, index: number) => {
    let seenData = chatListData;
    setUnitID("");
    cleanSelectedMenu();
    setCurrentChatUserID(item.userId);
    setCurrentChat(item);
    setActiveChecker([item.userId, item?.myHome?.unitId]);
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
      console.log("Socket.IO Connection Opened");
    });
    socket.on("chat-list", () => {
      refetchChatList();
    });
    socket.on(
      `chat-usr-${currentChatUserID}-${currentChat?.myHome?.unitId}`,
      (cmd) => {
        if (cmd.cmd === "new_message") {
          onChatIncoming();
        } else if (cmd.cmd === "seen") {
          queryClient.setQueryData(
            ["chatDataByID", currentChatUserID, currentChat?.myHome?.unitId],
            (oldData: ChatDataType[]) => {
              const seenMessages = oldData.map((item) =>
                item.seen === false ? { ...item, seen: true } : item
              );
              return seenMessages;
            }
          );
        }
      }
    );
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
        <Col
          xs={{ span: 24 }}
          lg={{ span: 10 }}
          xxl={{ span: 8 }}
          className="leftSideChatContainer"
        >
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
                  disabled={!access("chat", "view")} // ⭐ check permission
                />
                <Select
                  size="large"
                  placeholder="Select a user"
                  loading={isNameLoading}
                  value={userSelectValue || undefined}
                  style={{ width: "49%" }}
                  onChange={onUserSelectByUnit}
                  options={nameByUnitData}
                  fieldNames={{ value: "userId", label: "fullName" }}
                  disabled={!unitID || !access("chat", "view")} // ⭐ check permission
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
                  disabled={!access("chat", "view")} // ⭐ check permission
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
                    activeChecker={activeChecker}
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
        <Col
          xs={{ span: 24 }}
          lg={{ span: 14 }}
          xxl={{ span: 16 }}
          style={{ height: "100%" }}
        >
          <div style={{ position: "relative", height: "100%" }}>
            {/* ⭐ ส่ง access ไป ChatBoxContainer ให้เช็กตอนส่งข้อความ */}
            <ChatBoxContainer chatData={currentChat} />
          </div>
        </Col>
      </Row>
    </>
  );
};

export default ChatRoom;