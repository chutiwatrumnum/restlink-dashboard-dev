import { MinusCircleOutlined } from "@ant-design/icons";
import { Button, Form, Input, Modal, Row, TimePicker } from "antd";
import { useEffect, useState } from "react";
import { requiredRule } from "../../../configs/inputRule";
import UploadImageGroup from "../../../components/group/UploadImageGroup";
import SmallActionButton from "../../../components/common/SmallActionButton";
import ConfirmModal from "../../../components/common/ConfirmModal";

import { ReservationListDataType } from "../../../stores/interfaces/Facilities";
import dayjs from "dayjs";

// File Reader ready State

interface EditFacilityModalProps {
  visible: boolean;
  data: ReservationListDataType | undefined;
  onSave: (values: ReservationListDataType) => void;
  onExit: () => void;
  //   readOnly: boolean;
}

const EditFacilityModal = (props: EditFacilityModalProps) => {
  const [editFacilityForm] = Form.useForm();
  const [previewImage, setPreviewImage] = useState("");

  //functions
  const payloadGenerator = () => {
    const formData: ReservationListDataType = editFacilityForm.getFieldsValue();
    const payload: ReservationListDataType = {
      id: props?.data?.id ?? -1,
      name: formData.name,
      subName: formData.subName,
      description: formData.description,
      startTime: dayjs(formData.startTime, "HH:mm").format("HH:mm"),
      endTime: dayjs(formData.endTime, "HH:mm").format("HH:mm"),
      limitPeople: parseInt(formData.limitPeople),
      maximumHourBooking: dayjs(formData.maximumHourBooking, "HH:mm").format(
        "HH:mm"
      ),
      facilitiesRules: formData.facilitiesRules,
      accommodates: formData.accommodates,
    };
    if (formData.imageUrl) {
      payload.imageUrl = formData.imageUrl;
    }

    return payload;
  };

  const clear = () => {
    editFacilityForm.resetFields();
    props.onExit();
  };

  const onFinish = () => {
    ConfirmModal({
      title: "Are you sure you want to edit facility?",
      okMessage: "Yes",
      cancelMessage: "Cancel",
      onOk: () => {
        props.onSave(payloadGenerator());
        clear();
      },
    });
  };

  useEffect(() => {
    if (props?.data) {
      editFacilityForm.setFieldsValue({
        name: props?.data?.name,
        subName: props?.data?.subName,
        description: props?.data?.description,
        startTime: dayjs(props?.data?.startTime, "HH:mm"),
        endTime: dayjs(props?.data?.endTime, "HH:mm"),
        limitPeople: props?.data?.limitPeople,
        maximumHourBooking: dayjs(props?.data?.maximumHourBooking, "HH:mm"),
        accommodates: props?.data?.accommodates,
        facilitiesRules: props?.data?.facilitiesRules,
      });
      setPreviewImage(props?.data?.imageUrl);
    }
  }, [props?.visible]);

  return (
    <Modal
      key={props?.data?.id}
      open={props?.visible}
      centered
      onCancel={clear}
      title={"Edit Facility"}
      footer={[
        <SmallActionButton
          onClick={onFinish}
          className="saveButton"
          message="Save"
          form={editFacilityForm}
        />,
      ]}
      okText="Save"
      width="90%"
      bodyStyle={{ display: "block", overflowY: "auto", maxHeight: "65vh" }}
    >
      <Form onFinish={props.onSave} form={editFacilityForm} layout={"vertical"}>
        <div className="reserveModalColumn">
          <div className="reserveModalContainer">
            <div className="reserveModalColumn">
              <Form.Item<ReservationListDataType>
                label="Room name"
                name="name"
                rules={requiredRule}
              >
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
                rules={requiredRule}
              >
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
                rules={requiredRule}
              >
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
                  style={{ width: "48%" }}
                >
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
                  style={{ width: "48%" }}
                >
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
                rules={requiredRule}
              >
                <Input size="large" type="number" />
              </Form.Item>
              <Form.Item<ReservationListDataType>
                label="Maximum hour"
                name="maximumHourBooking"
                rules={requiredRule}
              >
                <TimePicker
                  size="large"
                  style={{ width: "100%" }}
                  minuteStep={5}
                  format={"HH:mm"}
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
                    }}
                  >
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
                      block
                    >
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
                    }}
                  >
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
                      block
                    >
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

export default EditFacilityModal;
