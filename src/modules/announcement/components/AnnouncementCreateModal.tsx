import { useState, useEffect } from "react";
import { Form, Input, DatePicker, Row, TimePicker, Select } from "antd";
import { requiredRule } from "../../../configs/inputRule";
import { useDispatch } from "react-redux";
import { Dispatch } from "../../../stores";
import { ConvertDate } from "../../../utils/helper";

import UploadImageGroup from "../../../components/group/UploadImageGroup";
import FormModal from "../../../components/common/FormModal";
import SmallButton from "../../../components/common/SmallButton";
import ConfirmModal from "../../../components/common/ConfirmModal";
import TextEditor from "../../../components/common/TextEditor"; // นำเข้า TextEditor ใหม่

import {
  AnnounceFormDataType,
  AddNewAnnouncementType,
} from "../../../stores/interfaces/Announcement";

type AnnouncementCreateModalType = {
  isCreateModalOpen: boolean;
  onOk: () => void;
  onCancel: () => void;
  onRefresh: () => void;
};

const AnnouncementCreateModal = ({
  isCreateModalOpen,
  onOk,
  onCancel,
  onRefresh,
}: AnnouncementCreateModalType) => {
  const dispatch = useDispatch<Dispatch>();
  const [form] = Form.useForm();
  const [open, setOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");

  const onModalClose = () => {
    form.resetFields();
    setPreviewImage("");
    onCancel();
  };

  useEffect(() => {
    setOpen(isCreateModalOpen);
  }, [isCreateModalOpen]);

  const ModalContent = () => {
    return (
      <Form
        form={form}
        name="announcementCreateModal"
        initialValues={{ remember: true }}
        autoComplete="off"
        layout="vertical"
        onFinish={async (value) => {
          ConfirmModal({
            title: "You confirm the information?",
            okMessage: "Yes",
            cancelMessage: "Cancel",
            onOk: async () => {
              const payload: AddNewAnnouncementType = {
                title: value.title,
                description: value.description, // นี่จะเป็น HTML content จาก text editor
                url: value.link,
                imageUrl: value.image,
                startDate: ConvertDate(
                  `${value.startDate.format(
                    "YYYY-MM-DD"
                  )} ${value.startTime.format("HH:mm")}`
                ).dateTimeUTC,
                endDate: ConvertDate(
                  `${value.endDate.format("YYYY-MM-DD")} ${value.endTime.format(
                    "HH:mm"
                  )}`
                ).dateTimeUTC,
                type: value.type,
              };

              const result = await dispatch.announcement.addNewAnnounce(
                payload
              );
              if (result) {
                form.resetFields();
                setPreviewImage("");
                onOk();
                onRefresh();
              }
            },
          });
        }}
        onFinishFailed={() => {
          console.log("FINISHED FAILED");
        }}>
        <div className="announceModalColumn">
          <div className="announceModalContainer">
            <div className="announceModalColumn">
              <Form.Item<AnnounceFormDataType>
                label="Title"
                name="title"
                rules={requiredRule}>
                <Input
                  size="large"
                  placeholder="Please input title"
                  maxLength={120}
                  showCount
                />
              </Form.Item>

              <Form.Item<AnnounceFormDataType>
                label="Type"
                name="type"
                rules={requiredRule}>
                <Select size="large" placeholder="Please select type">
                  <Select.Option value="projectNews">
                    Project news
                  </Select.Option>
                  <Select.Option value="announcement">
                    Announcement
                  </Select.Option>
                  <Select.Option value="devNews">Developer news</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item<AnnounceFormDataType>
                label="Image"
                name="image"
                rules={requiredRule}>
                <UploadImageGroup
                  onChange={(url) => {
                    setPreviewImage(url);
                  }}
                  image={previewImage}
                  ratio="1920x1080 px"
                />
              </Form.Item>
            </div>

            <div className="announceModalColumn">
              {/* Start date/time */}
              <Row justify="space-between">
                <Form.Item<AnnounceFormDataType>
                  label="Start date"
                  name="startDate"
                  rules={requiredRule}
                  style={{ width: "48%" }}>
                  <DatePicker style={{ width: "100%" }} size="large" />
                </Form.Item>
                <Form.Item<AnnounceFormDataType>
                  label="End date"
                  name="endDate"
                  rules={requiredRule}
                  style={{ width: "48%" }}>
                  <DatePicker style={{ width: "100%" }} size="large" />
                </Form.Item>
              </Row>

              {/* End date/time */}
              <Row justify="space-between">
                <Form.Item<AnnounceFormDataType>
                  label="Start time"
                  name="startTime"
                  rules={requiredRule}
                  style={{ width: "48%" }}>
                  <TimePicker
                    format="HH:mm"
                    style={{ width: "100%" }}
                    size="large"
                  />
                </Form.Item>

                <Form.Item<AnnounceFormDataType>
                  label="End time"
                  name="endTime"
                  rules={requiredRule}
                  style={{ width: "48%" }}>
                  <TimePicker
                    format="HH:mm"
                    style={{ width: "100%" }}
                    size="large"
                  />
                </Form.Item>
              </Row>

              {/* แทนที่ Input.TextArea ด้วย TextEditor */}
              <Form.Item<AnnounceFormDataType>
                label="Announcement body"
                name="description"
                rules={[
                  { required: true, message: "Please input announcement body" },
                  {
                    validator: (_, value) => {
                      if (!value) return Promise.resolve();

                      // Remove HTML tags to count actual text length
                      const tempDiv = document.createElement("div");
                      tempDiv.innerHTML = value;
                      const textLength = (
                        tempDiv.textContent ||
                        tempDiv.innerText ||
                        ""
                      ).length;

                      if (textLength > 1200) {
                        return Promise.reject(
                          new Error("Content exceeds 1200 characters")
                        );
                      }
                      return Promise.resolve();
                    },
                  },
                ]}>
                <TextEditor
                  placeholder="Please input announcement body"
                  maxLength={1200}
                />
              </Form.Item>

              <Form.Item<AnnounceFormDataType> label="URL" name="link">
                <Input size="large" placeholder="https://example.com" />
              </Form.Item>
            </div>
          </div>
          <SmallButton className="saveButton" message="Save" form={form} />
        </div>
      </Form>
    );
  };

  return (
    <>
      <FormModal
        isOpen={open}
        title="Add new"
        content={<ModalContent />}
        onOk={onOk}
        onCancel={onModalClose}
        className="announceFormModal"
      />
    </>
  );
};

export default AnnouncementCreateModal;