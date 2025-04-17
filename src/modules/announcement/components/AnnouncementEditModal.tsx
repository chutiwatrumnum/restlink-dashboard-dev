import { useState, useEffect } from "react";
import { Form, Input, DatePicker, Row, TimePicker } from "antd";
import { requiredRule } from "../../../configs/inputRule";
import dayjs from "dayjs";
import { useDispatch } from "react-redux";
import { Dispatch } from "../../../stores";
import { ConvertDate } from "../../../utils/helper";

import UploadImageGroup from "../../../components/group/UploadImageGroup";
import FormModal from "../../../components/common/FormModal";
import SmallButton from "../../../components/common/SmallButton";
import ConfirmModal from "../../../components/common/ConfirmModal";
import SuccessModal from "../../../components/common/SuccessModal";

import {
  AnnounceFormDataType,
  AddNewAnnouncementType,
} from "../../../stores/interfaces/Announcement";

type AnnouncementEditModalType = {
  isEditModalOpen: boolean;
  onOk: () => void;
  onCancel: () => void;
  data: AnnounceFormDataType;
  onRefresh: () => void;
};

const AnnouncementEditModal = ({
  isEditModalOpen,
  onOk,
  onCancel,
  data,
  onRefresh,
}: AnnouncementEditModalType) => {
  const dispatch = useDispatch<Dispatch>();
  const id = data.id;
  const [announceForm] = Form.useForm();
  const [open, setOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");

  const onClose = () => {
    announceForm.resetFields();
    onCancel();
  };

  useEffect(() => {
    setOpen(isEditModalOpen);
  }, [isEditModalOpen]);

  useEffect(() => {
    if (data) {
      // console.log(data);
      setPreviewImage(data.image ?? "");
      announceForm.setFieldsValue({
        title: data.title,
        status: data.status,
        startDate: dayjs(data.startDate),
        startTime: dayjs(data.startTime),
        endDate: dayjs(data.endDate),
        endTime: dayjs(data.endTime),
        description: data.description,
        link: data.link,
      });
    }
  }, [data]);

  const ModalContent = () => {
    return (
      <Form
        form={announceForm}
        name="announcementEditModal"
        // style={{ maxWidth: 600 }}
        initialValues={{ remember: true }}
        autoComplete="off"
        layout="vertical"
        onFinish={async (value) => {
          ConfirmModal({
            title: "Are you sure you want to edit this?",
            okMessage: "Yes",
            cancelMessage: "Cancel",
            onOk: async () => {
              const payload: AddNewAnnouncementType = {
                id,
                title: value.title,
                description: value.description,
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
              };
              // console.log(payload);

              const result = await dispatch.announcement.editAnnounce(payload);
              if (result) {
                announceForm.resetFields();
                onOk();
                onRefresh();
                SuccessModal("Successfully upload");
              }
            },
            onCancel: () => console.log("Cancel"),
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
              <Form.Item<AnnounceFormDataType> label="Image" name="image">
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

              <Form.Item<AnnounceFormDataType>
                label="Announcement body"
                name="description"
                rules={requiredRule}>
                <Input.TextArea
                  rows={7}
                  placeholder="Please input announcement body"
                  maxLength={1200}
                  showCount
                />
              </Form.Item>
              <Form.Item<AnnounceFormDataType> label="URL" name="link">
                <Input size="large" placeholder="https://example.com" />
              </Form.Item>
            </div>
          </div>
          <SmallButton
            className="saveButton"
            message="Save"
            form={announceForm}
          />
        </div>
      </Form>
    );
  };

  return (
    <>
      <FormModal
        isOpen={open}
        title="Edit Announcement"
        content={<ModalContent />}
        onOk={onOk}
        onCancel={onClose}
        className="announceFormModal"
      />
    </>
  );
};

export default AnnouncementEditModal;
