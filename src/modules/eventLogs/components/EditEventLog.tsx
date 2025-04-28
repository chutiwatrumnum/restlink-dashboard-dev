import { useState, useEffect } from "react";
import dayjs from "dayjs";
import {
  Button,
  Modal,
  Form,
  Input,
  Row,
  Col,
  Checkbox,
  DatePicker,
  TimePicker,
  InputNumber,
  Select,
} from "antd";
import SendToGroup from "../../../components/group/SendToGroup";
import UploadImageGroup from "../../../components/group/UploadImageGroup";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { editEventLogs } from "../service/api/EventLogsServiceAPI";
import { useDispatch } from "react-redux";
import { Dispatch } from "../../../stores";
dayjs.extend(customParseFormat);
import "../styles/eventLogs.css";
import { EditEventLogsType } from "../../../stores/interfaces/EventLog";
import FailedModal from "../../../components/common/FailedModal";
import SuccessModal from "../../../components/common/SuccessModal";
interface EditEventLogProps {
  eventLogs: any;
  isOpen: boolean;

  callBack: (isOpen: boolean, saved: boolean) => void;
}
const EditEventLog = (props: EditEventLogProps) => {
  const [Payable, setPayable] = useState<boolean>(false);
  const [Allowvisitorregistration, setAllowvisitorregistration] =
    useState<boolean>(false);
  const [isSendToModalOpen, setIsSendToModalOpen] = useState(false);
  const [units, setUnits] = useState<number[]>([]);
  const [isAllSelected, setIsAllSelected] = useState(false);
  const [previewImage, setPreviewImage] = useState<string>("");
  const [isMaxBookingPerUnit, setIsMaxBookingPerUnit] =
    useState<boolean>(false);
  const dispatch = useDispatch<Dispatch>();
  const handleCancel = async () => {
    resetValue();
    props.callBack(!props?.isOpen, false);
  };
  const resetValue = async () => {
    form.resetFields();
    setIsAllSelected(false);
    setPreviewImage("");
    setAllowvisitorregistration(false);
    setPayable(false);
    setIsMaxBookingPerUnit(false);
  };
  useEffect(() => {
    if (props?.isOpen) {
      (async function () {
        await initedit();
      })();
    }
  }, [props?.isOpen]);
  const initedit = async () => {
    const editdata: any = props?.eventLogs;

    setPreviewImage(editdata?.imageUrl);
    setAllowvisitorregistration(editdata?.visitorRegister);
    setPayable(editdata?.isPayable);
    setIsMaxBookingPerUnit(editdata?.isMaxBookingPerUnit);
    form.setFieldsValue({
      title: editdata?.title,
      description: editdata?.description,
      image: editdata?.imageUrl,
      startTime: dayjs(editdata?.startTime, "HH:mm A"),
      endTime: dayjs(editdata?.endTime, "HH:mm A"),
      limitPeople: editdata?.limitPeople,
      Date: dayjs(editdata?.startDate, "YYYY-MM-DD"),
      isPayable: editdata?.isPayable,
      isAllowVisitor: editdata?.visitorRegister,
      fee: editdata?.fee,
      sendTo: editdata?.unitAll,
      isMaxBookingPerUnit: editdata?.isMaxBookingPerUnit,
      maxBookingPerUnit: editdata?.maxBookingPerUnit,
    });
    if (!editdata.unitAll) {
      setUnits(
        editdata.unitList.map((e: any) => {
          return e.unitId;
        })
      );
    }
  };
  //from
  const [form] = Form.useForm();
  const onFinish = async (values: any) => {
    const dataEventLog: EditEventLogsType = {
      id: props?.eventLogs?.key,
      title: values?.title,
      description: values?.description,
      startTime: dayjs(values?.startTime).format("HH:mm A"),
      endTime: dayjs(values?.endTime).format("HH:mm A"),
      limitPeople: values?.limitPeople,
      date: dayjs(values?.Date).format("YYYY-MM-DD"),
      isPayable: Payable,
      isAllowVisitor: Allowvisitorregistration,
      unitAll: values?.sendTo,
      unitId: !values?.sendTo ? units : [],
      isMaxBookingPerUnit: isMaxBookingPerUnit,
    };
    if (props?.eventLogs?.imageUrl !== values?.image) {
      dataEventLog.image = values?.image;
    } else {
      dataEventLog.image = null;
    }
    if (dataEventLog.isPayable) {
      dataEventLog.fee = values?.fee;
      dataEventLog.isPayable;
    }
    if (dataEventLog.isMaxBookingPerUnit) {
      dataEventLog.maxBookingPerUnit = values?.maxBookingPerUnit;
    }
    // console.log("editEventLogs:",dataEventLog);
    // return
    const resultEdit = await editEventLogs(dataEventLog);
    if (resultEdit) {
     SuccessModal("Successfully Edit");
      await resetValue();
      await props.callBack(!props?.isOpen, true);
    } else {
      FailedModal("Failed Edit");
    }
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log("Failed:", errorInfo);
  };
  const onCancelSendToModal = () => {
    setIsSendToModalOpen(false);
  };
  const handleImageChange = (url: string) => {
    setPreviewImage(url);
  };
  const onSelectedUnits = (data: number[]) => {
    setUnits(data);
    if (data.length > 0) {
      form.setFieldsValue({ sendTo: false });
    } else {
      form.setFieldsValue({ sendTo: undefined });
    }
  };
  const onSendToChange = async (value: {
    value: string;
    label: React.ReactNode;
  }) => {
    if (value) {
      setIsAllSelected(true);
    } else {
      setIsSendToModalOpen(true);
    }
  };
  return (
    <>
      <Modal
        title={"Edit event"}
        width={1200}
        centered
        open={props?.isOpen}
        onCancel={handleCancel}
        footer={false}
        style={{
          borderBottom: 20,
          borderWidth: 200,
          borderBlock: 10,
        }}>
        <Form
          form={form}
          layout="vertical"
          name="basic"
          labelCol={{ span: 22 }}
          wrapperCol={{ span: 22 }}
          initialValues={{ remember: true }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off">
          <Row>
            <Col span={8}>
              <Form.Item
                label="Title"
                name="title"
                rules={[
                  {
                    required: true,
                    message: "This field is required !",
                  },
                  {
                    max: 99,
                    message: "Value should be less than 99 character",
                  },
                ]}>
                <Input placeholder="Input title" maxLength={100} />
              </Form.Item>
              <Form.Item
                label="Description"
                name="description"
                rules={[
                  {
                    required: true,
                    message: "This field is required !",
                  },
                ]}>
                <Input.TextArea
                  placeholder="Input announcement body"
                  maxLength={2000}
                  rows={6}
                  showCount
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Row>
                <Col span={24}>
                  <Form.Item
                    label="Date"
                    name="Date"
                    rules={[
                      {
                        required: true,
                        message: "This field is required !",
                      },
                    ]}>
                    <DatePicker className="fullWidth" format="YYYY-MM-DD" />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item
                    name={"limitPeople"}
                    label="Maximum number of participant"
                    rules={[
                      { type: "number" },
                      {
                        required: true,
                        message: "This field is required !",
                      },
                      {
                        validator: async (_, value) => {
                          if (value < 1) {
                            return Promise.reject(
                              new Error("number gte than 0.")
                            );
                          } else {
                            return Promise.resolve();
                          }
                        },
                      },
                    ]}>
                    <InputNumber
                      className="fullWidth"
                      placeholder="select maximum number"
                    />
                  </Form.Item>

                  <Checkbox
                    checked={isMaxBookingPerUnit}
                    value={isMaxBookingPerUnit}
                    onChange={() => {
                      setIsMaxBookingPerUnit(!isMaxBookingPerUnit);
                    }}
                    style={
                      isMaxBookingPerUnit
                        ? { marginBottom: 8 }
                        : { marginBottom: 24 }
                    }>
                    Maximum participant per unit
                  </Checkbox>
                  {isMaxBookingPerUnit ? (
                    <Form.Item
                      name={"maxBookingPerUnit"}
                      // label="Maximum participant per unit"
                      rules={[
                        { type: "number" },
                        {
                          required: true,
                          message: "This field is required !",
                        },
                        {
                          validator: async (_, value) => {
                            if (value < 1) {
                              return Promise.reject(
                                new Error("number gte than 0.")
                              );
                            } else {
                              return Promise.resolve();
                            }
                          },
                        },
                      ]}>
                      <InputNumber
                        className="fullWidth"
                        placeholder="input number"
                      />
                    </Form.Item>
                  ) : null}
                </Col>
                <Col span={24}>
                  <Row>
                    <Col span={12}>
                      <Form.Item
                        label="Start time"
                        name="startTime"
                        rules={[
                          {
                            required: true,
                            message: "This field is required !",
                          },
                        ]}>
                        <TimePicker className="fullWidth" format="hh:mm a" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        label="End time"
                        name="endTime"
                        rules={[
                          {
                            required: true,
                            message: "This field is required !",
                          },
                        ]}>
                        <TimePicker className="fullWidth" format="hh:mm a" />
                      </Form.Item>
                    </Col>
                  </Row>
                </Col>
              </Row>
              <Form.Item
                label="Send to"
                name="sendTo"
                rules={[
                  {
                    required: true,
                    message: "This field is required !",
                  },
                ]}>
                <Select
                  placeholder="Select receiver"
                  onSelect={onSendToChange}
                  options={[
                    {
                      value: true,
                      label: "Select all",
                    },
                    {
                      value: false,
                      label: "Select by unit",
                    },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Image"
                name="image"
                rules={[
                  {
                    required: true,
                    message: "This field is required !",
                  },
                ]}>
                <UploadImageGroup
                  image={previewImage ? previewImage : ""}
                  onChange={handleImageChange}
                />
              </Form.Item>
              <Col span={24}>
                <Checkbox
                  checked={Allowvisitorregistration}
                  value={Allowvisitorregistration}
                  onChange={async () => {
                    if (Allowvisitorregistration) {
                      await setAllowvisitorregistration(false);
                    } else {
                      await setAllowvisitorregistration(true);
                    }
                  }}>
                  Allow visitor registration
                </Checkbox>
              </Col>
              <Col span={8}>
                <Checkbox
                  checked={Payable}
                  value={Payable}
                  onChange={async () => {
                    if (Payable) {
                      await setPayable(false);
                    } else {
                      await setPayable(true);
                    }
                  }}>
                  Payable
                </Checkbox>
              </Col>
              <Col span={24}>
                {Payable ? (
                  <Form.Item
                    name={"fee"}
                    label="fee"
                    rules={[
                      { type: "number" },
                      {
                        required: true,
                        message: "This field is required !",
                      },
                      {
                        validator: async (_, value) => {
                          if (value < 1) {
                            return Promise.reject(
                              new Error("number gte than 0.")
                            );
                          } else {
                            return Promise.resolve();
                          }
                        },
                      },
                    ]}>
                    <InputNumber
                      className="fullWidth"
                      prefix="$"
                      placeholder="input free"
                    />
                  </Form.Item>
                ) : null}
              </Col>
            </Col>
          </Row>
          <Form.Item className="noMargin" wrapperCol={{ offset: 22, span: 2 }}>
            <Button type="primary" htmlType="submit">
              Save
            </Button>
          </Form.Item>
        </Form>
        <SendToGroup
          onChange={onSelectedUnits}
          isModalOpen={isSendToModalOpen}
          onClose={onCancelSendToModal}
          data={units}
        />
      </Modal>
    </>
  );
};

export default EditEventLog;
