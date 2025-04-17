import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import { ChatListDataType } from "../../../stores/interfaces/Chat";
import { Empty, Image, Col, Row, Avatar, Badge } from "antd";
import dayjs from "dayjs";

import "../styles/chatRoom.css";
import "../styles/chatLibControl.css";
import { whiteLabel } from "../../../configs/theme";

interface ChatListType {
  item: ChatListDataType;
  activeUserID: string;
  index: number;
  onUserListSelected: (item: ChatListDataType, index: number) => void;
}

const ChatList = ({
  item,
  activeUserID,
  index,
  onUserListSelected,
}: ChatListType) => {
  const lastTextSelector = (
    type: "text" | "file" | "image",
    value: ChatListDataType
  ) => {
    let showText = "";
    switch (type) {
      case "text":
        showText = value.message;
        break;

      case "file":
        showText = "User sent a file";
        break;

      case "image":
        showText = "User sent an image";
        break;
      default:
        break;
    }
    return showText;
  };

  return (
    <>
      {item ? (
        <Col
          className={`userContainer ${
            activeUserID === item.userId ? "active" : ""
          }`}
          onClick={() => {
            onUserListSelected(item, index);
          }}
        >
          <Row>
            <Col className="avatarContainer" span={5}>
              {item.imageProfile ? (
                <Avatar
                  size={{
                    xs: 32,
                    sm: 32,
                    md: 32,
                    lg: 32,
                    xl: 40,
                    xxl: 56,
                  }}
                  src={<Image preview={false} src={item.imageProfile} />}
                />
              ) : (
                <Avatar
                  size={{
                    xs: 32,
                    sm: 32,
                    md: 32,
                    lg: 32,
                    xl: 40,
                    xxl: 56,
                  }}
                >
                  {item?.firstName?.charAt(0).toUpperCase() ?? "N"}
                </Avatar>
              )}
            </Col>
            <Col className="textInUserContainer" span={16}>
              <p className="ellipsisText">
                <b>{`${item.firstName} ${item.lastName} (${item.roomAddress})`}</b>
              </p>
              <span className="ellipsisText">
                {lastTextSelector(item.type, item)}
              </span>
            </Col>
            <Col className="timeShowUserContainer" span={3}>
              <span>{dayjs(item.createdAt).format("HH:mm")}</span>
              {item.juristicSeen ? null : (
                <Badge color={whiteLabel.dangerColor} />
              )}
            </Col>
          </Row>
        </Col>
      ) : (
        <div className="emptyContainer">
          <Empty />
        </div>
      )}
    </>
  );
};

export default ChatList;
