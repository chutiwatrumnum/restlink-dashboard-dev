import { useState, useEffect } from "react";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";
import {
  Spin,
  Button,
  Modal,
  Form,
  Input,
  Row,
  Col,
  Select,
  DatePicker,
  TimePicker,AutoComplete
} from "antd";
import {
  EditDeliveryLogsType,
  blockDetail,
  unitDetail,
} from "../../../stores/interfaces/DeliveryLogs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { useDispatch } from "react-redux";
import { Dispatch } from "../../../stores";
dayjs.extend(customParseFormat);
import "../styles/deliveryLogs.css";
import {
  getUserByunit,
  editDeliveryLogs,
  getDataBlock,
} from "../service/api/DeliveryLogsServiceAPI";
import SuccessModal from "../../../components/common/SuccessModal";
import FailedModal from "../../../components/common/FailedModal";
const { RangePicker } = DatePicker;
interface EditEventLogProps {
  deliveryLogs: any;
  isOpen: boolean;

  callBack: (isOpen: boolean, saved: boolean) => void;
}
const reminderNotification: any = [
  {
    label: "1 Day",
    value: 1,
  },
  {
    label: "2 Day",
    value: 2,
  },
  {
    label: "3 Day",
    value: 3,
  },
  {
    label: "4 Day",
    value: 4,
  },
];

// เพิ่มรายการบริษัทขนส่งในไทย
const senderTypeOptions = [
  { label: "Thailand Post (ไปรษณีย์ไทย)", value: "Thailand Post" },
  { label: "Kerry Express", value: "Kerry Express" },
  { label: "Flash Express", value: "Flash Express" },
  { label: "J&T Express", value: "J&T Express" },
  { label: "DHL", value: "DHL" },
  { label: "FedEx", value: "FedEx" },
  { label: "UPS", value: "UPS" },
  { label: "SCG Express", value: "SCG Express" },
  { label: "Ninja Van", value: "Ninja Van" },
  { label: "Best Express", value: "Best Express" },
  { label: "Shopee Express", value: "Shopee Express" },
  { label: "Lazada Express", value: "Lazada Express" },
  { label: "Alpha Fast", value: "Alpha Fast" },
  { label: "CJ Logistics", value: "CJ Logistics" },
  { label: "Grab Express", value: "Grab Express" },
  { label: "foodpanda", value: "foodpanda" },
  { label: "Lalamove", value: "Lalamove" },
  { label: "GoGoVan", value: "GoGoVan" },
];

type RangeValue = [Dayjs | null, Dayjs | null] | null;
let blocklst: any[] = [];
const EditDeliverylog = (props: EditEventLogProps) => {
  const dispatch = useDispatch<Dispatch>();
  const [selectedblock, setselectedblock] = useState(true);
  const [selectedunit, setselectedunit] = useState(true);
  const [block, setblock] = useState<blockDetail[] | any>([]);
  const [unit, setunitDetail] = useState<unitDetail[]>([]);
  const [occupantsName, setoccupantsName] = useState<unitDetail[]>([]);
  const [isOpenModal, setisOpenModal] = useState(false);
  const [dates, setDates] = useState<RangeValue>(null);
  const [value, setValue] = useState<RangeValue>(null);
  const [disableDatePicker, setdisableDatePicker] = useState<boolean>(true);
  const [reminderNotificationSelect, setReminderNotificationSelect] =
    useState<any>();
  const handleCancel = async () => {
    await resetValue();
    await props.callBack(!props?.isOpen, false);
  };
  const resetValue = async () => {
    await form.resetFields();
  };

  // Custom validator for time validation
  const validateTimeRange = () => ({
    validator: async () => {
        const startTime = form.getFieldValue('startTime');
        const endTime = form.getFieldValue('endTime');
        
        if (startTime && endTime) {
            const start = dayjs(startTime);
            const end = dayjs(endTime);
            
            // Check if end time is after start time (same day)
            if (end.isBefore(start) || end.isSame(start)) {
                return Promise.reject(new Error('End time must be greater than start time and cannot cross midnight'));
            }
            
            // Check minimum 30 minutes difference
            const timeDiff = end.diff(start, 'minute');
            if (timeDiff < 30) {
                return Promise.reject(new Error('Delivery window must be at least 30 minutes'));
            }
        }
        return Promise.resolve();
    },
});
  useEffect(() => {
    if (props?.isOpen) {
      (async function () {
        await initedit();
      })();
    }
    // dispatch.common.getBlockOptions();
  }, [props?.isOpen]);
  const initedit = async () => {
    const editdata: any = props?.deliveryLogs;
    const dataeblock = await getDataBlock();
    blocklst = dataeblock?.datablock;
    setunitDetail(dataeblock?.dataselectblock as unitDetail[]);

    const arrayUserList: unitDetail[] = [];

    const result = await getUserByunit(editdata?.unitId);
    if (result?.status) {
      result?.data.map((e: any) => {
        
        if (`${e?.firstName} ${e?.lastName}` === editdata?.name) {
          editdata.nameId = e.userId;
        }
        const userList: unitDetail = {
          label: `${e?.firstName} ${e?.lastName}`,
          value: e?.userId,
        };
        arrayUserList.push(userList);
      });
    } else {
      await setselectedunit(true);
    }
    if (arrayUserList.length > 0) {
      await setoccupantsName(arrayUserList);
      await setselectedunit(false);
    }
    await form.setFieldsValue({
      pickUpLocation: editdata?.pickUpLocation,
      blockNo: editdata?.blockId,
      occupantsName: editdata.nameId,
      unitId: editdata?.unitId,
      reminderNotification: editdata?.reminderNotification,
      senderType: editdata?.senderType,
      trackingNumber: editdata?.trackingNumber,
      Date: [
        dayjs(editdata?.startDate, "YYYY-MM-DD"),
        dayjs(editdata?.endDate, "YYYY-MM-DD"),
      ],
      startTime: dayjs(editdata?.startTime, "HH:mm A"),
      endTime: dayjs(editdata?.endTime, "HH:mm A"),
      arrivalDate:dayjs(editdata?.arrivalDate, "YYYY-MM-DD"),
      description: editdata?.comment ? editdata?.comment : null,
    });
    if (editdata?.reminderNotification === 0) {
      await setdisableDatePicker(true);
      await form.setFieldsValue({
        reminderNotification: "Select day",
      });
    }
    if (editdata?.pickUpType !== "-") {
      await form.setFieldValue("pickUpLocation", editdata?.pickUpType);
    }
    await setselectedblock(false);
    await setisOpenModal(props?.isOpen);
  };
  //from
  const [form] = Form.useForm();
  const onFinish = async (values: any) => {
    const data: EditDeliveryLogsType = {
      id: props?.deliveryLogs.key,
      userId: values.occupantsName,
      unitId: values.unitId,
      reminderNotification: values.reminderNotification,
      senderType: values.senderType,
      trackingNumber: values.trackingNumber,
      pickUpLocation: values.pickUpLocation,
      startDate: dayjs(values.Date[0]).format("YYYY-MM-DD"),
      startTime: dayjs(values.startTime).format("HH:mm A"),
      endDate: dayjs(values.Date[1]).format("YYYY-MM-DD"),
      endTime: dayjs(values.endTime).format("HH:mm A"),
      arrivalDate: dayjs(values.arrivalDate).format("YYYY-MM-DD"),
    };
    if (values.description) {
      data.comment = values.description;
    } else {
      data.comment = null;
    }
    if (values.reminderNotification === "Select day") {
      data.reminderNotification = 0;
    }
    const reultEdit = await editDeliveryLogs(data)
    if (reultEdit) {
      SuccessModal("Successfully save");
      await resetValue()
      await props.callBack(!props?.isOpen, true);
    } else {
      FailedModal("Failed save");
    }
  };

  const disabledDate = (current: dayjs.Dayjs) => {
    if (!dates) {
      return false;
    }
    const tooLate = dates[0] && current.diff(dates[0], "days") >= 7;
    const tooEarly = dates[1] && dates[1].diff(current, "days") >= 7;

    // Add the check for one day before the current date
    const oneDayBeforeCurrent = current.isBefore(dayjs().subtract(1, "days"));

    return !!tooEarly || !!tooLate || oneDayBeforeCurrent;
  };
  const onFinishFailed = (errorInfo: any) => {
    console.log("Failed:", errorInfo);
  };
  const handleChangeBlock = async (e: any) => {
    await form.setFieldsValue({
      unitId: null,
    });
    if (e) {
      await setselectedblock(false);
      await setselectedunit(true);
      await form.setFieldsValue({
        occupantsName: null,
      });
      const unitdata = blocklst[e - 1].unit;
      const arrayUnit: unitDetail[] = [];
      unitdata.map((e: any) => {
        if (e?.active) {
          const unitdata: unitDetail = {
            label: e.unitNo,
            value: e.id,
          };
          arrayUnit.push(unitdata);
        }
      });
      if (arrayUnit.length > 0) {
        await setunitDetail(arrayUnit);
      }
    }
  };
  const handleChangeUnit = async (e: any) => {
    await form.setFieldsValue({
      occupantsName: null,
    });
    if (e) {
      const arrayUserList: unitDetail[] = [];

      const result = await getUserByunit(e);
      if (result?.status) {
        result?.data.map((e: any) => {
          const userList: unitDetail = {
            label: e?.fullName,
            value: e?.id,
          };
          arrayUserList.push(userList);
        });
      } else {
        await setselectedunit(true);
      }
      if (arrayUserList.length > 0) {
        await setoccupantsName(arrayUserList);
        await setselectedunit(false);
      }
    }
  };
  const onOpenChange = (open: boolean) => {
    if (open) {
      setDates([null, null]);
    } else {
      setDates(null);
    }
  };
  return (
    <>
      <Modal
        title={"Record a delivery"}
        width={700}
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
            <Col span={12}>
              {/* <Form.Item
                name="blockNo"
                label="Block no."
                rules={[
                  { required: true, message: "Please select Input block no." },
                ]}
              >
                <Select
                  options={block}
                  onChange={handleChangeBlock}
                  placeholder="Input block no."
                />
              </Form.Item> */}
              <Form.Item
                name="unitId"
                label="Room address"
                rules={[
                  {
                    required: true,
                    message: "Please select Input room address",
                  },
                ]}>
                <Select
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    (option?.label ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  options={unit}
                  onChange={handleChangeUnit}
                  placeholder="Input unit no."
                />
              </Form.Item>
              <Form.Item
                name="occupantsName"
                label="Occupant's name"
                rules={[
                  { required: true, message: "Please select occupant's name" },
                ]}>
                <Select
                  disabled={selectedunit}
                  options={occupantsName}
                  placeholder="Select occupant's name"
                />
              </Form.Item>
              <Form.Item
                label="Sender type"
                name="senderType"
                rules={[
                  {
                    required: true,
                    message: "Please select or input sender type!",
                  },
                  {
                    validator: async (_, value) => {
                      if (value && typeof value === "string") {
                        // ตรวจสอบว่าเป็นภาษาอังกฤษและตัวเลขเท่านั้น
                        const pattern = /^[A-Za-z0-9\s&.-]+$/;
                        if (!pattern.test(value)) {
                          return Promise.reject(
                            new Error(
                              "Please use English characters, numbers, and basic symbols only"
                            )
                          );
                        }
                        // ตรวจสอบความยาว
                        if (value.length > 50) {
                          return Promise.reject(
                            new Error(
                              "Sender type should not exceed 50 characters"
                            )
                          );
                        }
                      }
                      return Promise.resolve();
                    },
                  },
                ]}>
                <AutoComplete
                  options={senderTypeOptions}
                  placeholder="Select or type sender type"
                  filterOption={(inputValue, option) =>
                    option!.label
                      .toUpperCase()
                      .indexOf(inputValue.toUpperCase()) !== -1
                  }
                />
              </Form.Item>
              <Form.Item
                label="Tracking number"
                name="trackingNumber"
                rules={[
                  {
                    pattern: new RegExp(/^[A-Za-z0-9][A-Za-z0-9]*$/),
                    message: "english word and digit only",
                  },
                  {
                    required: true,
                    message: "Please input your tracking number!",
                  },
                ]}>
                <Input placeholder="Input tracking number" />
              </Form.Item>
              <Form.Item
                label="Pick-up location"
                name="pickUpLocation"
                rules={[
                  {
                    required: true,
                    message: "Please input your pick-up location!",
                  },
                ]}>
                <Input placeholder="Input pick-up location" />
              </Form.Item>
            </Col>
            <Col span={12} style={{ paddingLeft: 10 }}>
              <Form.Item
                label="Date"
                name="Date"
                rules={[
                  {
                    required: true,
                    message: "This field is required !",
                  },
                ]}>
                <RangePicker
                  value={dates || value}
                  disabledDate={disabledDate}
                  onCalendarChange={(val) => {
                    setDates(val);
                  }}
                  onChange={async (val) => {
                    if (val) {
                      const date1 = dayjs(dayjs(val[0]).format("YYYY-MM-DD"));
                      const date2 = dayjs(dayjs().format("YYYY-MM-DD"));
                      const diffRsult = date1.diff(date2, "day");
                      if (diffRsult > 0) {
                        if (diffRsult > 0 && diffRsult <= 4) {
                          const reminderNotificationResult =
                            reminderNotification.slice(0, diffRsult);
                          await setReminderNotificationSelect(
                            reminderNotificationResult
                          );
                          await form.setFieldsValue({
                            reminderNotification: null,
                          });
                        } else if (diffRsult > 4) {
                          await setReminderNotificationSelect(
                            reminderNotification
                          );
                          await form.setFieldsValue({
                            reminderNotification: null,
                          });
                        }
                        await setdisableDatePicker(false);
                      } else if (diffRsult === 0) {
                        await form.setFieldsValue({
                          reminderNotification: "Select day",
                        });
                      } else {
                        await setdisableDatePicker(true);
                      }
                    } else {
                      await setdisableDatePicker(true);
                    }
                    setValue(val);
                  }}
                  onOpenChange={onOpenChange}
                />
                {/* <DatePicker
                      disabledDate={disabledDate}
                      className="fullWidth"
                      format="YYYY-MM-DD"
                      defaultValue={dayjs(new Date())}
                    /> */}
              </Form.Item>

              <Row>
                <Col span={12}>
                  <Form.Item
                    label="Start time"
                    name="startTime"
                    rules={[
                      {
                        required: true,
                        message: "This field is required!",
                      },
                      validateTimeRange(),
                    ]}>
                    <TimePicker
                      className="fullWidth"
                      format="hh:mm a"
                      style={{ width: "100%" }}
                      onChange={() => {
                        // Re-validate end time when start time changes
                        form.validateFields(["endTime"]);
                      }}
                      minuteStep={15}
                    />
                  </Form.Item>
                </Col>
                <Col span={11}>
                  <Form.Item
                    label="End time"
                    name="endTime"
                    rules={[
                      {
                        required: true,
                        message: "This field is required!",
                      },
                      validateTimeRange(),
                    ]}>
                    <TimePicker
                      className="fullWidth"
                      format="hh:mm a"
                      style={{ width: "100%" }}
                      onChange={() => {
                        // Re-validate start time when end time changes
                        form.validateFields(["startTime"]);
                      }}
                      minuteStep={15}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="reminderNotification"
                label="Reminder notification"
                rules={[
                  {
                    required: true,
                    message: "Select day",
                  },
                ]}>
                <Select
                  disabled={disableDatePicker}
                  options={reminderNotificationSelect}
                  placeholder="Select day"
                />
              </Form.Item>
              <Form.Item label="Arrival Date" name="arrivalDate">
                <DatePicker />
              </Form.Item>
              <Form.Item label="Comment(Optional)" name="description">
                <Input.TextArea
                  style={{ height: 200 }}
                  placeholder="Input comment"
                  maxLength={100}
                  rows={6}
                  showCount
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            className="noMargin"
            wrapperCol={{ offset: 22, span: 2 }}
            style={{ paddingRight: 30 }}>
            <Button type="primary" htmlType="submit">
              Save
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default EditDeliverylog;
