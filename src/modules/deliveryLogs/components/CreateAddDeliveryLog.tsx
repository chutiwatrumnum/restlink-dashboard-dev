import { useState, useEffect } from "react";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";
import { Button, Modal, Form, Select, Row, Col, Input, DatePicker, TimePicker } from "antd";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { useDispatch } from "react-redux";
import { Dispatch } from "../../../stores";
import { getUserByunit, addDeliveryLogs, getDataBlock } from "../service/api/DeliveryLogsServiceAPI";
dayjs.extend(customParseFormat);
import "../styles/deliveryLogs.css";
import { AddNewDeliveryLogsType, blockDetail, unitDetail } from "../../../stores/interfaces/DeliveryLogs";
import SuccessModal from "../../../components/common/SuccessModal";
import FailedModal from "../../../components/common/FailedModal";
const { RangePicker } = DatePicker;
interface ComponentCreateProps {
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

type RangeValue = [Dayjs | null, Dayjs | null] | null;

let blocklst: any[] = [];
const CreateAddDeliveryLog = (props: ComponentCreateProps) => {
    const dispatch = useDispatch<Dispatch>();
    const [selectedblock, setselectedblock] = useState(true);
    const [selectedunit, setselectedunit] = useState(true);
    const [block, setblock] = useState<blockDetail[] | any>([]);
    const [unit, setunitDetail] = useState<unitDetail[]>([]);
    const [occupantsName, setoccupantsName] = useState<unitDetail[]>([]);
    const [dates, setDates] = useState<RangeValue>(null);
    const [value, setValue] = useState<RangeValue>(null);
    const [disableDatePicker, setdisableDatePicker] = useState<boolean>(true);
    const [reminderNotificationSelect, setReminderNotificationSelect] = useState<any>();
    const handleCancel = async () => {
        await resetValue();
        await props.callBack(!props?.isOpen, false);
    };
    const resetValue = async () => {
        await form.resetFields();
    };
    //from
    const [form] = Form.useForm();
    const onFinish = async (values: any) => {
        const data: AddNewDeliveryLogsType = {
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
        }
        if (values.reminderNotification === "Select day") {
            data.reminderNotification = 0;
        }
        const reultCreated = await addDeliveryLogs(data);
        if (reultCreated) {
              SuccessModal("Successfully create");
            // dispatch.common.updateSuccessModalState({
            //   open: true,
            //   text: "Successfully create",
            // });
            await resetValue();
            props.callBack(!props?.isOpen, true);
        } else {
            // dispatch.common.updateSuccessModalState({
            //   open: true,
            //   status: "error",
            //   text: "Failed create",
            // });
             FailedModal("Failed create");
        }
    };

    useEffect(() => {
        if (props?.isOpen) {
            (async function () {
                await initDataCreate();
            })();
        }
    }, [props?.isOpen]);
    const initDataCreate = async () => {
        const dataeblock = await getDataBlock();
        blocklst = dataeblock?.datablock;
        setunitDetail(dataeblock?.dataselectblock as unitDetail[]);
        await form.setFieldsValue({
            startTime: dayjs().hour(8).minute(0),
            endTime: dayjs().hour(23).minute(0),
            pickUpLocation: "Level 1 Arrival Lobby",
        });
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
            console.log("handleChangeUnit:", result);

            if (result?.status) {
                result?.data.map((e: any) => {
                    const userList: unitDetail = {
                        label: e?.firstName,
                        value: e?.userId,
                    };
                    arrayUserList.push(userList);
                });
            } else {
                await setselectedunit(true);
            }
            if (arrayUserList.length > 0) {
              console.log("arrayUserList:",arrayUserList);
              
                await setoccupantsName(arrayUserList);
                await setselectedunit(false);
            }
        }
    };
    const onFinishFailed = (errorInfo: any) => {
        console.log("Failed:", errorInfo);
    };

    //   const disabledDate: RangePickerProps["disabledDate"] = (current) => {{
    //    var startDate = dayjs().subtract(1, 'days') //Today.
    //    var endDate = dayjs().add(30, "days"); // 10 days in the future from now.
    //    // It will return false if its before today or after 10 days from now.
    //    return current < startDate || current > endDate;
    // }
    //   };

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
                }}
            >
                <Form form={form} layout="vertical" name="basic" labelCol={{ span: 22 }} wrapperCol={{ span: 22 }} initialValues={{ remember: true }} onFinish={onFinish} onFinishFailed={onFinishFailed} autoComplete="off">
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
                            <Form.Item name="unitId" label="Unit no." rules={[{ required: true, message: "Please select Input unit no." }]}>
                                <Select
                                    showSearch
                                    optionFilterProp="children"
                                    filterOption={(input, option) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase())}
                                    // disabled={selectedblock}
                                    options={unit}
                                    onChange={handleChangeUnit}
                                    placeholder="Input unit no."
                                />
                            </Form.Item>
                            <Form.Item name="occupantsName" label="Occupant's name" rules={[{ required: true, message: "Please select occupant's name" }]}>
                                <Select disabled={selectedunit} options={occupantsName} placeholder="Select occupant's name" />
                            </Form.Item>

                            <Form.Item
                                label="Sender type"
                                name="senderType"
                                rules={[
                                    {
                                        pattern: new RegExp(/^[A-Za-z][A-Za-z]*$/),
                                        message: "english word only",
                                    },
                                    { required: true, message: "Please input your sender type!" },
                                ]}
                            >
                                <Input placeholder="Input sender type" />
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
                                ]}
                            >
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
                                ]}
                            >
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
                                ]}
                            >
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
                                                    const reminderNotificationResult = reminderNotification.slice(0, diffRsult);
                                                    await setReminderNotificationSelect(reminderNotificationResult);
                                                    await form.setFieldsValue({
                                                        reminderNotification: null,
                                                    });
                                                } else if (diffRsult > 4) {
                                                    await setReminderNotificationSelect(reminderNotification);
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
                                                message: "This field is required !",
                                            },
                                        ]}
                                    >
                                        <TimePicker className="fullWidth" format="hh:mm a" />
                                    </Form.Item>
                                </Col>
                                <Col span={11}>
                                    <Form.Item
                                        label="End time"
                                        name="endTime"
                                        rules={[
                                            {
                                                required: true,
                                                message: "This field is required !",
                                            },
                                        ]}
                                    >
                                        <TimePicker className="fullWidth" format="hh:mm a" />
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
                                ]}
                            >
                                <Select disabled={disableDatePicker} options={reminderNotificationSelect} placeholder="Select day" />
                            </Form.Item>
                            <Form.Item label="Arrival Date" name="arrivalDate">
                            <DatePicker  />
                            </Form.Item>
                            <Form.Item label="Comment(Optional)" name="description">
                                <Input.TextArea style={{ height: 200 }} placeholder="Input comment" maxLength={100} rows={6} showCount />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item className="noMargin" wrapperCol={{ offset: 22, span: 2 }} style={{ paddingRight: 30 }}>
                        <Button type="primary" htmlType="submit">
                            Save
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};

export default CreateAddDeliveryLog;
