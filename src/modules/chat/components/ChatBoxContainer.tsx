import { useState, useEffect, useRef } from "react";
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import {
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  ConversationHeader,
  MessageSeparator,
} from "@chatscope/chat-ui-kit-react";
import {
  ChatListDataType,
  ChatDataType,
  SendChatDataType,
} from "../../../stores/interfaces/Chat";
import { DownloadOutlined } from "@ant-design/icons";
import { whiteLabel } from "../../../configs/theme";
import { Empty, Image, Row, Tag, Spin, message } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { Dispatch, RootState } from "../../../stores";
import dayjs from "dayjs";
import { TrashIcon } from "../../../assets/icons/Icons";
import {
  getChatDataByIDQuery,
  getMoreChatDataByIDQuery,
} from "../../../utils/queries";
import { postMessageByJuristicMutation } from "../../../utils/mutations";
import { useQueryClient } from "@tanstack/react-query";

import "../styles/chatRoom.css";
import "../styles/chatLibControl.css";

const ChatBoxContainer = ({ chatData }: { chatData?: ChatListDataType }) => {
  // Variables
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
  } = getChatDataByIDQuery({ id: chatData?.userId ?? "" });
  const { data: moreChatData, refetch: loadMoreChatData } =
    getMoreChatDataByIDQuery({
      id: chatData?.userId ?? "",
      curPage: curPageChatData.toString(),
      shouldFetch: shouldFetch,
    });
  const postMessageMutation = postMessageByJuristicMutation();

  let lastDate = "";

  // Functions
  const messageDirectionSelector = (direction: boolean | string) => {
    if (direction) return "outgoing";
    return "incoming";
  };

  const messageController = (message: ChatDataType) => {
    let result = null;
    // console.log(message);

    switch (message.messageType) {
      case "text":
        result = (
          <div
            className={
              message.isMessageOwner ? "outgoingMessage" : "incomingMessage"
            }
          >
            <Message
              type="text"
              model={{
                direction: messageDirectionSelector(message.isMessageOwner),
                message: message.message,
                position: "single",
                sentTime: dayjs(message.createdAt).format("HH:mm"),
              }}
            />
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
                      height: 200,
                      objectFit: "cover",
                    }}
                  />
                </Message.CustomContent>
              ) : (
                <Message.TextContent text="Image not found" />
              )}
            </Message>
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
                      {message.fileName !== "" ? message.fileName : "PDF File"}
                    </div>
                  </a>
                </Message.CustomContent>
              ) : (
                <Message.TextContent text="File not found" />
              )}
            </Message>
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
    let payload: SendChatDataType;
    setIsSending(true);
    let messagePayload = messageValue.replace(/&nbsp;/g, " ");
    if (chatData && messagePayload.trim() !== "") {
      payload = {
        type: "text",
        value: messagePayload,
        userId: chatData.userId,
      };
      // console.log(payload);

      await postMessageMutation.mutateAsync(payload);
    }

    if (chatData && base64 && fileType) {
      payload = {
        type: fileType,
        value: base64,
        userId: chatData.userId,
        fileName: file?.name,
      };
      // console.log(payload);

      await postMessageMutation.mutateAsync(payload);
    }

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
    reader.onerror = (error) => {
      setError("Error converting file to base64.");
    };
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const onTypeMessage = (val: string) => {
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
      return;
    }

    if (shouldFetch) {
      setIsMoreChatLoading(true);
      await loadMoreChatData();
      if (moreChatData?.length === 0) {
        setShouldFetch(false);
        setIsMoreChatLoading(false);
        return;
      }
      dispatch.chat.updateCurPageChatData(curPageChatData + 1);
      await queryClient.setQueryData(
        ["chatDataByID", chatData?.userId],
        (oldData: ChatDataType[]) => {
          if (moreChatData) return [...oldData, ...moreChatData];
        }
      );
      setIsMoreChatLoading(false);
    }
  };

  // Actions
  useEffect(() => {
    resetMessageValue();
    updateChatData();
    dispatch.chat.updateCurPageChatData(2);
    setIsFirstTime(true);
  }, [chatData]);

  // useImperativeHandle(ref, () => ({
  //   async handleIncomingChat() {
  //     console.log("Handle incoming chat in ChatBoxContainer");
  //     await updateChatData();
  //   },
  // }));

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
          <ChatContainer className="rightSideContainer">
            <ConversationHeader className="chatBoxHeader">
              <ConversationHeader.Content
                userName={
                  chatData.user && chatData?.myHome
                    ? `${chatData?.user?.givenName} ${chatData?.user?.familyName} (${chatData?.myHome?.unit?.roomAddress})`
                    : `${chatData?.firstName} ${chatData?.lastName} (${chatData?.roomAddress})`
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

export default ChatBoxContainer;
