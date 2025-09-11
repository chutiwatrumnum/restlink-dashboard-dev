import { MinusCircleOutlined } from "@ant-design/icons";
import { Button, Form, Input, Modal, Row, TimePicker } from "antd";
import { useEffect, useState } from "react";
import { requiredRule } from "../../../configs/inputRule";
import UploadImageGroup from "../../../components/group/UploadImageGroup";
import SmallActionButton from "../../../components/common/SmallActionButton";
import ConfirmModal from "../../../components/common/ConfirmModal";

import {
  ReservationListDataType,
  AddNewFacilityPayloadType,
} from "../../../stores/interfaces/Facilities";
import dayjs from "dayjs";

// File Reader ready State

interface AddFacilityModalProps {
  visible: boolean;
  onSave: (values: AddNewFacilityPayloadType) => void;
  onExit: () => void;
  //   readOnly: boolean;
}

const AddFacilityModal = (props: AddFacilityModalProps) => {
  const [addFacilityForm] = Form.useForm();
  const [previewImage, setPreviewImage] = useState("");

  //functions
  const payloadGenerator = () => {
    const formData: ReservationListDataType = addFacilityForm.getFieldsValue();
    const payload: AddNewFacilityPayloadType = {
      name: formData.name,
      subName: formData.subName,
      description: formData.description ?? "",
      startTime: dayjs(formData.startTime, "HH:mm").format("HH:mm"),
      endTime: dayjs(formData.endTime, "HH:mm").format("HH:mm"),
      limitPeople: parseInt(formData.limitPeople.toString()),
      maximumHourBooking: dayjs(formData.maximumHourBooking, "HH:mm").format(
        "HH:mm"
      ),
      maxDayCanBooking: parseInt(formData.maxDayCanBooking?.toString() || "30"),
      imageUrl: formData.imageUrl ?? "",
      facilitiesRules: formData.facilitiesRules,
      accommodates: formData.accommodates,
    };
    if (formData.imageUrl) {
      payload.imageUrl = formData.imageUrl;
    }

    return payload;
  };

  const clear = () => {
    addFacilityForm.resetFields();
    props.onExit();
  };

  const onFinish = () => {
    ConfirmModal({
      title: "Are you sure you want to create facility?",
      okMessage: "Yes",
      cancelMessage: "Cancel",
      onOk: () => {
        props.onSave(payloadGenerator());
        clear();
      },
    });
  };

  // Set initial values when modal opens
  useEffect(() => {
    if (props.visible) {
      addFacilityForm.setFieldsValue({
        maxDayCanBooking: 30, // Set default value to 30 days
      });
    }
  }, [props.visible, addFacilityForm]);

  return (
    <Modal
      key={"createModal"}
      open={props?.visible}
      width={"90%"}
      centered
      onCancel={clear}
      footer={[
        <SmallActionButton
          onClick={onFinish}
          className="saveButton"
          message="Save"
          form={addFacilityForm}
        />,
      ]}
      okText="Save"
      title="Create Facility"
      style={{ maxWidth: 1200 }}>
      <Form onFinish={props.onSave} form={addFacilityForm} layout={"vertical"}>
        <div className="reserveModalColumn">
          <div className="reserveModalContainer">
            <div className="reserveModalColumn">
              <Form.Item<ReservationListDataType>
                label="Room name"
                name="name"
                rules={requiredRule}>
                <Input
                  size="large"
                  placeholder="Please input title"
                  maxLength={120}
                  showCount
                />
              </Form.Item>

              <Form.Item<ReservationListDataType>
                label="Room name detail"
                name="subName"
                rules={requiredRule}>
                <Input
                  size="large"
                  placeholder="Please input title"
                  maxLength={120}
                  showCount
                />
              </Form.Item>

              <Form.Item<ReservationListDataType>
                label="Detail"
                name="description"
                rules={requiredRule}>
                <Input.TextArea
                  rows={5}
                  placeholder="Please input description"
                  maxLength={200}
                  showCount
                />
              </Form.Item>

              {/* End date/time */}
              <span>Daily hour</span>
              <Row justify="space-between">
                <Form.Item<ReservationListDataType>
                  label="From"
                  name="startTime"
                  rules={requiredRule}
                  style={{ width: "48%" }}>
                  <TimePicker
                    format="HH:mm"
                    style={{ width: "100%" }}
                    size="large"
                  />
                </Form.Item>

                <Form.Item<ReservationListDataType>
                  label="To"
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
            </div>
            <div className="reserveModalColumn">
              {/* End date/time */}
              <Form.Item<ReservationListDataType>
                label="Maximum total"
                name="limitPeople"
                rules={requiredRule}>
                <Input size="large" type="number" />
              </Form.Item>
              <Form.Item<ReservationListDataType>
                label="Maximum hour"
                name="maximumHourBooking"
                rules={requiredRule}>
                <TimePicker
                  size="large"
                  style={{ width: "100%" }}
                  minuteStep={5}
                  format={"HH:mm"}
                />
              </Form.Item>
              <Form.Item<ReservationListDataType>
                label="Max Advance Booking Days"
                name="maxDayCanBooking"
                rules={requiredRule}
                tooltip="Booking Days in Advance (1–730 Days)">
                <Input
                  size="large"
                  type="number"
                  min={1}
                  max={730}
                  placeholder="30"
                  suffix="วัน"
                />
              </Form.Item>
              <Form.Item<ReservationListDataType> label="Image" name="imageUrl">
                <UploadImageGroup
                  onChange={() => {}}
                  image={previewImage}
                  height={250}
                />
              </Form.Item>
            </div>
            <div className="reserveModalColumn">
              <span style={{ marginBottom: 8 }}>Accommodates</span>
              <Form.List name="accommodates">
                {(fields, { add, remove }) => (
                  <div
                    style={{
                      display: "flex",
                      rowGap: 4,
                      flexDirection: "column",
                    }}>
                    {fields.map((field) => (
                      <div key={field.key}>
                        <Form.Item name={[field.name, "name"]}>
                          <Input
                            size="large"
                            suffix={
                              <MinusCircleOutlined
                                onClick={() => {
                                  remove(field.name);
                                }}
                              />
                            }
                          />
                        </Form.Item>
                      </div>
                    ))}

                    <Button
                      type="dashed"
                      size="large"
                      onClick={() => add()}
                      block>
                      + Add Accommodates
                    </Button>
                  </div>
                )}
              </Form.List>
              <span style={{ marginTop: 15, marginBottom: 8 }}>Rules</span>
              <Form.List name="facilitiesRules">
                {(fields, { add, remove }) => (
                  <div
                    style={{
                      display: "flex",
                      rowGap: 4,
                      flexDirection: "column",
                    }}>
                    {fields.map((field) => (
                      <div title={`Item ${field.name + 1}`} key={field.key}>
                        <Form.Item name={[field.name, "name"]}>
                          <Input
                            size="large"
                            suffix={
                              <MinusCircleOutlined
                                onClick={() => {
                                  remove(field.name);
                                }}
                              />
                            }
                          />
                        </Form.Item>
                      </div>
                    ))}

                    <Button
                      type="dashed"
                      size="large"
                      onClick={() => add()}
                      block>
                      + Add Rules
                    </Button>
                  </div>
                )}
              </Form.List>
            </div>
          </div>
        </div>
      </Form>
    </Modal>
  );
};

export default AddFacilityModal;
