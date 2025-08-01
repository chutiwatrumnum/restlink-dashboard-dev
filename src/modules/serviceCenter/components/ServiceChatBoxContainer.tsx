import { useState, useEffect, useRef } from "react";
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import {
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  ConversationHeader,
  MessageSeparator,
  Sidebar,
  MainContainer,
} from "@chatscope/chat-ui-kit-react";
import { SendServiceChatDataType } from "../../../stores/interfaces/Service";
import { DownloadOutlined } from "@ant-design/icons";
import { whiteLabel } from "../../../configs/theme";
import { Empty, Image, Row, Tag, Spin, Avatar, message } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { Dispatch, RootState } from "../../../stores";
import dayjs from "dayjs";
import { TrashIcon } from "../../../assets/icons/Icons";
import {
  getServiceChatDataByIDQuery,
  getMoreServiceChatDataByIDQuery,
} from "../../../utils/queriesGroup/serviceQueries";
import {
  ServiceChatListDataType,
  ServiceChatDataType,
} from "../../../stores/interfaces/Service";
import { postServiceMessageByJuristicMutation } from "../../../utils/mutationsGroup/serviceCenterMutations";
import { useQueryClient } from "@tanstack/react-query";
import fallbackImg from "../../../assets/images/noImg.jpeg";

import "../styles/serviceChat.css";
import "../styles/serviceChatControl.css";
import ServiceCenterChatManage from "./ServiceCenterChatManage";
const ServiceChatBoxContainer = ({
  chatData,
}: {
  chatData?: ServiceChatListDataType;
}) => {
  // Variables
  // const getListRef = () =>
  //   document.querySelector(
  //     "[data-message-list-container] [data-cs-message-list]"
  //   );
  const dispatch = useDispatch<Dispatch>();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { curPageChatData } = useSelector((state: RootState) => state.chat);
  const [file, setFile] = useState<File | null>(null);
  const [base64, setBase64] = useState<string | null>(null);
  const [fileType, setFileType] = useState<"image" | "file" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [messageValue, setMessageValue] = useState<string>("");
  const [isSending, setIsSending] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState(true);
  const [shouldFetch, setShouldFetch] = useState(false);
  const [isMoreChatLoading, setIsMoreChatLoading] = useState(false);
  const [isChatLimited, setIsChatLimited] = useState(false);

  // API
  const {
    data: chatDataById,
    isLoading: isChatDataByIDLoading,
    refetch: updateChatData,
  } = getServiceChatDataByIDQuery({ id: chatData?.serviceId.toString() ?? "" });

  const { data: moreServiceChatData, refetch: loadMoreServiceChatData } =
    getMoreServiceChatDataByIDQuery({
      id: chatData?.serviceId.toString() ?? "",
      curPage: curPageChatData.toString(),
      shouldFetch: shouldFetch,
    });
  const postMessageMutation = postServiceMessageByJuristicMutation();

  let lastDate = "";

  // Functions
  const messageDirectionSelector = (direction: boolean | string) => {
    if (direction) return "outgoing";
    return "incoming";
  };

  const messageController = (message: ServiceChatDataType) => {
    let result = null;
    // console.log(message);
    switch (message.type) {
      case "text":
        result = (
          <div
            className={
              message.isMessageOwner ? "outgoingMessage" : "incomingMessage"
            }
          >
            <div className="avatarInChatBoxContainer">
              {message.ownerMessage.imageProfile ? (
                <Avatar
                  size={32}
                  src={
                    <Image
                      preview={false}
                      src={message.ownerMessage.imageProfile}
                      fallback={fallbackImg}
                    />
                  }
                />
              ) : (
                <Avatar size={32}>
                  {message?.ownerMessage.givenName.charAt(0).toUpperCase() ??
                    "N"}
                </Avatar>
              )}
            </div>
            <div className="messageContainer">
              <span style={{ fontSize: 12, fontWeight: 500 }}>
                {message.ownerMessage.givenName ?? "Undefined"}
              </span>
              <Message
                type="text"
                model={{
                  direction: messageDirectionSelector(message.isMessageOwner),
                  message: message.message,
                  position: "single",
                  sentTime: dayjs(message.createdAt).format("HH:mm"),
                }}
              />
            </div>
            <div className="message-meta">
              {message.seen && <span className="message-read">Read</span>}
              <span className="message-time">
                {dayjs(message.createdAt).format("HH:mm")}
              </span>
            </div>
          </div>
        );
        break;

      case "image":
        result = (
          <div
            className={
              message.isMessageOwner ? "outgoingMessage" : "incomingMessage"
            }
          >
            <div className="avatarInChatBoxContainer">
              {message.ownerMessage.imageProfile ? (
                <Avatar
                  size={32}
                  src={
                    <Image
                      preview={false}
                      src={message.ownerMessage.imageProfile}
                    />
                  }
                />
              ) : (
                <Avatar size={32}>
                  {message?.ownerMessage.givenName?.charAt(0).toUpperCase() ??
                    "N"}
                </Avatar>
              )}
            </div>
            <div className="messageContainer">
              <span style={{ fontSize: 12, fontWeight: 500 }}>
                {message.ownerMessage.givenName ?? "Undefined"}
              </span>
              <Message
                type="image"
                model={{
                  direction: messageDirectionSelector(message.isMessageOwner),
                  position: "single",
                  sentTime: dayjs(message.createdAt).format("HH:mm"),
                }}
              >
                {message.uploadUrl ? (
                  <Message.CustomContent>
                    <Image
                      src={message.uploadUrl}
                      style={{
                        height: 150,
                        objectFit: "cover",
                      }}
                    />
                  </Message.CustomContent>
                ) : (
                  <Message.TextContent text="Image not found" />
                )}
              </Message>
            </div>
            <div className="message-meta">
              {message.seen && <span className="message-read">Read</span>}
              <span className="message-time">
                {dayjs(message.createdAt).format("HH:mm")}
              </span>
            </div>
          </div>
        );
        break;

      case "file":
        result = (
          <div
            className={
              message.isMessageOwner ? "outgoingMessage" : "incomingMessage"
            }
          >
            <div className="avatarInChatBoxContainer">
              {message.ownerMessage.imageProfile ? (
                <Avatar
                  size={32}
                  src={
                    <Image
                      preview={false}
                      src={message.ownerMessage.imageProfile}
                    />
                  }
                />
              ) : (
                <Avatar size={32}>
                  {message?.ownerMessage.givenName?.charAt(0).toUpperCase() ??
                    "N"}
                </Avatar>
              )}
            </div>
            <div className="messageContainer">
              <span style={{ fontSize: 12, fontWeight: 500 }}>
                {message.ownerMessage.givenName ?? "Undefined"}
              </span>
              <Message
                type="custom"
                model={{
                  direction: messageDirectionSelector(message.isMessageOwner),
                  position: "single",
                  sentTime: dayjs(message.createdAt).format("HH:mm"),
                }}
              >
                {message.uploadUrl ? (
                  <Message.CustomContent>
                    <a href={message.uploadUrl} download={message.message}>
                      <div className="fileMessage">
                        <DownloadOutlined style={{ fontSize: 16 }} />
                        {"  "}{" "}
                        {message.fileName !== ""
                          ? message.fileName
                          : "PDF File"}
                      </div>
                    </a>
                  </Message.CustomContent>
                ) : (
                  <Message.TextContent text="File not found" />
                )}
              </Message>
            </div>
            <div className="message-meta">
              {message.seen && <span className="message-read">Read</span>}
              <span className="message-time">
                {dayjs(message.createdAt).format("HH:mm")}
              </span>
            </div>
          </div>
        );
        break;

      default:
        break;
    }
    return result;
  };

  const resetMessageValue = () => {
    setFile(null);
    setBase64(null);
    setFileType(null);
    setError(null);
    setMessageValue("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const onSendMessage = async (message: string) => {
    let payload: SendServiceChatDataType;
    setIsSending(true);
    let messagePayload = messageValue.replace(/&nbsp;/g, " ");
    if (chatData && messagePayload.trim() !== "") {
      payload = {
        type: "text",
        value: messagePayload,
        userId: chatData.userId,
        serviceId: chatData.serviceId,
      };
      // console.log(payload);

      await postMessageMutation.mutateAsync(payload);
    }

    if (chatData && base64 && fileType) {
      payload = {
        type: fileType,
        value: base64,
        userId: chatData.userId,
        serviceId: chatData.serviceId,
        fileName: file?.name,
      };
      // console.log(payload);

      await postMessageMutation.mutateAsync(payload);
    }
    // console.log(chatData);

    setIsSending(false);
    resetMessageValue();
    updateChatData();
  };

  const formatDate = (date: string) => {
    return dayjs(date).format("DD/MMM/YYYY");
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFile(null);
    setBase64(null);
    setMessageValue("");

    const selectedFile = event.target.files?.[0];
    // console.log(selectedFile);

    if (selectedFile) {
      const fileSizeLimit = 3 * 1024 * 1024; // 5 MB
      const validFileTypes: any = {
        "image/jpeg": "image",
        "image/png": "image",
        "image/webp": "image",
        "application/pdf": "file",
      };
      if (!Object.keys(validFileTypes).includes(selectedFile.type)) {
        setError(
          "Invalid file type. Please select a JPG, PNG, WEBP image, or PDF."
        );
        setFile(null);
        setFileType(null);
      } else if (selectedFile.size > fileSizeLimit) {
        setError("File size exceeds the limit of 3 MB.");
        setFile(null);
        setFileType(null);
      } else {
        setError(null);
        setFile(selectedFile);
        setFileType(validFileTypes[selectedFile.type]);
        convertToBase64(selectedFile);
      }
    }
  };

  const convertToBase64 = (file: File) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      setBase64(reader.result as string);
      setMessageValue(" ");
    };
    reader.onerror = () => {
      setError("Error converting file to base64.");
    };
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const onTypeMessage = (val: string) => {
    // const replacedVal = val.replace(/&nbsp;/, " ");

    if (val.length <= 200) {
      setMessageValue(val);
    } else if (!isChatLimited) {
      setIsChatLimited(true);
      message.info("Message should be less than 200 characters.");
    }
  };

  const onYReachStart = async () => {
    if (!shouldFetch && !isFirstTime) {
      console.log("no more chat data");
    }
    if (isMoreChatLoading) {
      // console.log("isMoreChatLoading");
      return;
    }
    if (isFirstTime) {
      setIsFirstTime(false);
      setShouldFetch(true);
      // console.log("First Time => false and \nshould fetch => true");
      return;
    }

    if (shouldFetch) {
      setIsMoreChatLoading(true);
      await loadMoreServiceChatData();
      if (moreServiceChatData?.length === 0) {
        setShouldFetch(false);
        setIsMoreChatLoading(false);
        return;
      }
      dispatch.chat.updateCurPageChatData(curPageChatData + 1);
      await queryClient.setQueryData(
        ["serviceChatDataByID", chatData?.serviceId.toString() ?? ""],
        (oldData: ServiceChatDataType[]) => {
          if (moreServiceChatData) return [...oldData, ...moreServiceChatData];
        }
      );
      setIsMoreChatLoading(false);
    }
  };

  const tagColorSelector = (status: string) => {
    switch (status) {
      case "Pending":
        return "red";
      case "Repairing":
        return "orange";
      case "Success":
        return "green";
      default:
        return "black";
    }
  };

  // Actions
  useEffect(() => {
    // console.log(chatData);
    resetMessageValue();
    updateChatData();
    dispatch.chat.updateCurPageChatData(2);
    setIsFirstTime(true);
  }, [chatData]);

  return (
    <>
      {chatData ? (
        <>
          <input
            type="file"
            onChange={handleFileChange}
            style={{ display: "none" }}
            ref={fileInputRef}
          />
          <MainContainer responsive>
            <ChatContainer className="rightSideContainer">
              <ConversationHeader className="chatBoxHeader">
                <ConversationHeader.Content
                  userName={
                    chatData.service && chatData.service
                      ? `${chatData?.service?.serviceType?.nameEn} (${chatData?.myHome?.unit?.roomAddress})`
                      : `${chatData?.serviceType} (${chatData?.roomAddress})`
                  }
                  className="titleChatName"
                />
              </ConversationHeader>
              <MessageList
                loadingMore={isMoreChatLoading}
                onYReachStart={onYReachStart}
              >
                {isChatDataByIDLoading ? (
                  <div style={{ textAlign: "center", marginTop: "20px" }}>
                    <Spin />
                  </div>
                ) : chatDataById ? (
                  <>
                    {chatDataById
                      .slice()
                      .reverse()
                      .map((item, index) => {
                        const messageDate = dayjs(item.createdAt).format(
                          "DD/MMM/YYYY"
                        );
                        const showSeparator = messageDate !== lastDate;
                        lastDate = messageDate;

                        return (
                          <div key={index}>
                            {showSeparator && (
                              <MessageSeparator
                                content={formatDate(item.createdAt)}
                              />
                            )}
                            {messageController(item)}
                          </div>
                        );
                      })}
                  </>
                ) : null}
              </MessageList>
              <MessageInput
                onAttachClick={handleButtonClick}
                onChange={onTypeMessage}
                onSend={onSendMessage}
                placeholder="Type message here"
                value={messageValue}
                sendDisabled={
                  (messageValue !== "" &&
                    messageValue !== "<br>" &&
                    !isSending) ||
                  (base64 !== null && !isSending)
                    ? false
                    : true
                }
                onPaste={(e) => {
                  e.preventDefault();
                  const text = e.clipboardData.getData("text/plain");
                  setMessageValue(text);
                }}
              />
            </ChatContainer>
            <Sidebar position="right">
              <ServiceCenterChatManage chatData={chatData} />
            </Sidebar>
          </MainContainer>
          <Row style={{ padding: "4px 0 12px" }}>
            {file ? (
              <Tag
                className="tagControl"
                onClick={() => resetMessageValue()}
                color={whiteLabel.successColor}
              >
                {file.name}
                <TrashIcon
                  color={whiteLabel.whiteColor}
                  className="fileDeleteIcon"
                />
              </Tag>
            ) : error ? (
              <Tag color={whiteLabel.dangerColor}>{error}</Tag>
            ) : null}
          </Row>
        </>
      ) : (
        <div className="emptyContainer">
          <Empty />
        </div>
      )}
    </>
  );
};

export default ServiceChatBoxContainer;
