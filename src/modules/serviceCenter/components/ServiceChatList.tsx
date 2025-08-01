import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import { ServiceChatListDataType } from "../../../stores/interfaces/Service";
import { Empty, Image, Col, Row, Avatar, Badge } from "antd";
import dayjs from "dayjs";

import "../styles/serviceChat.css";
import "../styles/serviceChatControl.css";
import { whiteLabel } from "../../../configs/theme";

interface ServiceChatListType {
  item: ServiceChatListDataType;
  activeServiceId: number;
  index: number;
  onServiceListSelected: (item: ServiceChatListDataType, index: number) => void;
}

const ServiceChatList = ({
  item,
  activeServiceId,
  index,
  onServiceListSelected,
}: ServiceChatListType) => {
  const lastTextSelector = (
    type: "text" | "file" | "image",
    value: ServiceChatListDataType
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
            activeServiceId === item.serviceId ? "active" : ""
          }`}
          onClick={() => {
            onServiceListSelected(item, index);
          }}
        >
          <Row>
            <Col className="avatarContainer" span={5}>
              {item.user.imageProfile ? (
                <Avatar
                  size={{
                    xs: 32,
                    sm: 32,
                    md: 32,
                    lg: 32,
                    xl: 40,
                    xxl: 56,
                  }}
                  src={<Image preview={false} src={item.user.imageProfile} />}
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
                  {item?.user.givenName?.charAt(0).toUpperCase() ?? "N"}
                </Avatar>
              )}
            </Col>
            <Col className="textInUserContainer" span={16}>
              <p className="ellipsisText">
                <b>{`${item.service.serviceType.nameEn} (${item.myHome.unit.roomAddress})`}</b>
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

export default ServiceChatList;
