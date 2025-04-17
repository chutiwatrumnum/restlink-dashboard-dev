import { useState, useEffect } from "react";
import { Form, Input, DatePicker, TimePicker, Select } from "antd";
import { requiredRule } from "../../../configs/inputRule";
import { useDispatch, useSelector } from "react-redux";
import { Dispatch, RootState } from "../../../stores";
import dayjs from "dayjs";

import FormModal from "../../../components/common/FormModal";
import SmallButton from "../../../components/common/SmallButton";
import SuccessModal from "../../../components/common/SuccessModal";
import ConfirmModal from "../../../components/common/ConfirmModal";

import {
  ReservedFormDataType,
  ReservationListDataType,
  FacilitiesItemsType,
  ResidentDataType,
} from "../../../stores/interfaces/Facilities";

import "../styles/ReserveFacility.css";

type ReservedCreateModalType = {
  isCreateModalOpen: boolean;
  onCancel: () => void;
  onRefresh: () => void;
};

type SelectOptionType = {
  label: string;
  value: number | string;
};

const ReservedCreateModal = ({
  isCreateModalOpen,
  onCancel,
  onRefresh,
}: ReservedCreateModalType) => {
  const dispatch = useDispatch<Dispatch>();
  const { reservationListData, unitListData, userData, residentByUnit } =
    useSelector((state: RootState) => state.facilities);
  const [form] = Form.useForm();
  const [open, setOpen] = useState(false);
  // const [facilityId, setFacilityId] = useState(0);
  const [facilityOptions, setFacilityOptions] = useState<SelectOptionType[]>(
    []
  );
  const [subOptions, setSubOptions] = useState<FacilitiesItemsType[]>();
  const [residentOptions, setResidentOptions] = useState<SelectOptionType[]>(
    []
  );
  const [isSubOptions, setIsSubOptions] = useState(false);
  const [limitPeopleOptions, setLimitPeopleOptions] = useState<
    SelectOptionType[]
  >([]);

  //functinos
  const onUnitChange = async (value: string) => {
    const data = await dispatch.facilities.getResidentByUnitList(value);
    handleResidentNameOptions(data);
    form.setFieldValue("userId", null);
  };

  const onFacilityChange = (id: number, val: ReservationListDataType) => {
    const options: FacilitiesItemsType[] | undefined = val.facilitiesItems;
    // setFacilityId(id);
    options?.forEach((option, index) => {
      options[index].label = option.itemName + " " + option.description;
    });
    // console.log(options);
    subOptionsActiveHandle(id);
    setSubOptions(options);
    const limitPeopleTemp: SelectOptionType[] = [];
    for (let index = 0; index < (val.limitPeople ?? 0); index++) {
      limitPeopleTemp.push({
        label: (index + 1).toString(),
        value: index + 1,
      });
    }
    setLimitPeopleOptions(limitPeopleTemp);
  };

  const clear = async () => {
    form.resetFields();
    onCancel();
  };

  const subOptionsActiveHandle = async (id: number) => {
    switch (id) {
      case 11:
      case 12:
      case 16:
      case 17:
        setIsSubOptions(true);
        break;

      default:
        setIsSubOptions(false);
        break;
    }
  };

  const handleFacilityOptions = () => {
    const temp: { label: string; value: number }[] = [];
    reservationListData.map((room) => {
      if (!room.locked)
        temp.push({ label: room.name, value: room.id, ...room });
    });
    setFacilityOptions(temp);
  };

  const handleResidentNameOptions = (data: ResidentDataType[]) => {
    const temp: { label: string; value: string }[] = [];
    data.map((resident: ResidentDataType) => {
      temp.push({
        label: `${resident.firstName} ${resident.lastName}`,
        value: resident.userId,
      });
    });
    setResidentOptions(temp);
  };

  useEffect(() => {
    setOpen(isCreateModalOpen);
    form.setFieldValue(
      "adminId",
      `${userData?.firstName}  ${userData?.lastName}`
    );
    handleFacilityOptions();
  }, [isCreateModalOpen, userData]);

  const ModalContent = () => {
    return (
      <Form
        form={form}
        name="reservedCreateModal"
        // style={{ maxWidth: 600 }}
        initialValues={{ remember: true }}
        autoComplete="off"
        layout="vertical"
        onFinish={async (values: ReservedFormDataType) => {
          ConfirmModal({
            title: "You confirm the information?",
            okMessage: "Yes",
            cancelMessage: "Cancel",
            onOk: async () => {
              const payload = {
                userId: values.userId,
                facilitiesId: values.facilitiesId,
                topic: values.topic,
                joinAt: dayjs(values.joinAt).format("YYYY-MM-DD"),
                startTime: dayjs(values.startTime).format("HH:mm"),
                endTime: dayjs(values.endTime).format("HH:mm"),
                note: values.note,
                numberOfPeople: parseInt(values.numberOfPeople),
                contactNo: "0999999999",
                facilitiesItemId: 0,
              };
              if (isSubOptions) {
                payload.facilitiesItemId = parseInt(values.facilitiesItemId);
              }
              //   console.log(payload);
              const post = await dispatch.facilities.createReservedFacility(
                payload
              );
              if (post < 400) {
                clear();
                onRefresh();
                SuccessModal("Successfully Create reservation");
              }
            },
          });
        }}
        onFinishFailed={() => {
          console.log("FINISHED FAILED");
        }}>
        <div className="reservedModalColumn">
          <div className="reservedModalContainer">
            <div className="reservedModalColumn">
              <Form.Item<ReservedFormDataType>
                label="Facility"
                name="facilitiesId"
                rules={requiredRule}>
                <Select
                  placeholder="Please select facility"
                  onChange={onFacilityChange}
                  options={facilityOptions}
                  size="large"
                />
              </Form.Item>

              <Form.Item<ReservedFormDataType>
                label="Select your options."
                name="facilitiesItemId"
                rules={isSubOptions ? requiredRule : []}>
                <Select
                  placeholder="Please Select your options"
                  fieldNames={{
                    label: "label",
                    value: "id",
                  }}
                  options={subOptions}
                  size="large"
                  disabled={isSubOptions ? false : true}
                />
              </Form.Item>

              <Form.Item<ReservedFormDataType> label="Booked by" name="adminId">
                <Input disabled={true} size="large" />
              </Form.Item>

              <Form.Item<ReservedFormDataType>
                label="Topic"
                name="topic"
                rules={requiredRule}>
                <Input size="large" placeholder="Please input topic" />
              </Form.Item>
            </div>
            <div className="reservedModalColumn">
              <Form.Item<ReservedFormDataType>
                label="Room address"
                name="unitId"
                rules={requiredRule}>
                <Select
                  placeholder="Select a Room address"
                  onChange={onUnitChange}
                  fieldNames={{ label: "roomAddress", value: "id" }}
                  options={unitListData}
                  size="large"
                />
              </Form.Item>
              <Form.Item<ReservedFormDataType>
                label="Resident name"
                name="userId"
                rules={requiredRule}>
                <Select
                  placeholder="Select a person"
                  options={residentOptions}
                  size="large"
                />
              </Form.Item>
              <Form.Item<ReservedFormDataType>
                label="Comment (Optional)"
                name="note">
                <Input.TextArea
                  rows={6}
                  placeholder="Please input comment"
                  maxLength={1200}
                  showCount
                />
              </Form.Item>
            </div>
            <div className="reservedModalColumn">
              <Form.Item<ReservedFormDataType>
                label="Reserve Date"
                name="joinAt"
                rules={requiredRule}>
                <DatePicker style={{ width: "100%" }} size="large" />
              </Form.Item>
              <Form.Item<ReservedFormDataType>
                label="Start time"
                name="startTime"
                rules={requiredRule}>
                <TimePicker
                  style={{ width: "100%" }}
                  size="large"
                  format="HH:mm"
                  minuteStep={5}
                />
              </Form.Item>
              <Form.Item<ReservedFormDataType>
                label="End time"
                name="endTime"
                rules={requiredRule}>
                <TimePicker
                  style={{ width: "100%" }}
                  size="large"
                  format="HH:mm"
                  minuteStep={5}
                />
              </Form.Item>
              <Form.Item<ReservedFormDataType>
                label="Number of people"
                name="numberOfPeople"
                rules={requiredRule}>
                <Select
                  placeholder="Select a number of people"
                  options={limitPeopleOptions}
                  size="large"
                />
              </Form.Item>
            </div>
          </div>

          <SmallButton form={form} className="saveButton" message="Create" />
        </div>
      </Form>
    );
  };

  return (
    <>
      <FormModal
        isOpen={open}
        title="Create reservation"
        content={<ModalContent />}
        onOk={() => {}}
        onCancel={clear}
        className="reservedFormModal"
      />
    </>
  );
};

export default ReservedCreateModal;
