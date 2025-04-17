import { useState, useEffect } from "react";
import { Form, Input, Col, Row, Select, FormInstance } from "antd";
import {
  emailRule,
  requiredRule,
  telRule,
} from "../../../../configs/inputRule";
import FormModal from "../../../../components/common/FormModal";
import SmallButton from "../../../../components/common/SmallButton";
import {
  ResidentAddNew,
  ResidentInformationFormDataType,
  roleDetail,
  unitDetail,
} from "../../../../stores/interfaces/ResidentInformation";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import DatePicker, { RangePickerProps } from "antd/es/date-picker";
import {
  addResident,
  getDataMasterResidentDetail,
} from "../../service/api/ResidentServiceAPI";
import SuccessModal from "../../../../components/common/SuccessModal";
import FailedModal from "../../../../components/common/FailedModal";
import ConfirmModal from "../../../../components/common/ConfirmModal";

type ManagementCreateModalType = {
  isCreateModalOpen: boolean;
  callBack: (isOpen: boolean, saved: boolean) => void;
};
dayjs.extend(customParseFormat);
const disabledDate: RangePickerProps["disabledDate"] = (current) => {
  // Can not select days before today and today
  return current && current < dayjs().startOf("day");
};
const disabledDateBirth: RangePickerProps["disabledDate"] = (current) => {
  // Can not select days before today and today
  return current && current > dayjs().endOf("day");
};
const ResidentInformationCreateModal = ({
  isCreateModalOpen,
  callBack,
}: ManagementCreateModalType) => {
  const [open, setOpen] = useState(false);
  const [role, setrole] = useState<roleDetail[]>([]);
  const [unit, setunitDetail] = useState<unitDetail[]>([]);
  useEffect(() => {
    if (isCreateModalOpen) {
      (async function () {
        await initData();
        await setOpen(isCreateModalOpen);
      })();
    }
  }, [isCreateModalOpen]);

  const initData = async () => {
    const resultDataMaster: any = await getDataMasterResidentDetail();
    if (resultDataMaster.status) {
      await setrole(resultDataMaster?.dataRole);
      await setunitDetail(resultDataMaster?.dataUnit);
    }
  };

  const [residentForm] = Form.useForm();

  const onOk = () => {};
  const onCancel = async () => {
    await residentForm
      .validateFields({ validateOnly: true })
      .then(async () => {
        await residentForm.resetFields();
      })
      .catch(async () => {
        await residentForm.resetFields();
      });
    await setOpen(!open);
    await callBack(!open, false);
  };
  const onFinish = async (values: any) => {
    values.moveInDate = values.moveInDate
      ? dayjs(values.moveInDate).format("YYYY-MM-DD")
      : null;
    values.moveOutDate = values.moveOutDate
      ? dayjs(values.moveOutDate).format("YYYY-MM-DD")
      : null;
    values.birthDate = values.birthDate
      ? dayjs(values.birthDate).format("YYYY-MM-DD")
      : null;
    values.channel = "web";
    const request: ResidentAddNew = {
      firstName: values.firstName,
      lastName: values.lastName,
      nickName: values.nickName ? values.nickName : null,
      email: values.email,
      roleId: values.roleId,
      hobby: values.hobby,
      unitId: values.unitId,
      iuNumber: values.iuNumber ? values.iuNumber : null,
      contact: values.contact,
      middleName: values.middleName,
      birthDate: values.birthDate !== "Invalid Date" ? values.birthDate : null,
      channel: values.channel,
      moveInDate:
        values.moveInDate !== "Invalid Date" ? values.moveInDate : null,
      moveOutDate:
        values.moveOutDate !== "Invalid Date" ? values.moveOutDate : null,
      lockerCode: values.lockerCode,
    };
    await showAddConfirm(request);
  };
  const showAddConfirm = (request: ResidentAddNew) => {
    ConfirmModal({
      title: "You confirm the information?",
      okMessage: "Yes",
      cancelMessage: "Cancel",
      onOk: async () => {
        const resultCreated = await addResident(request);
        if (resultCreated) {
          SuccessModal("Successfully upload");
          await residentForm.resetFields();
          await setOpen(!open);
          await callBack(!open, true);
        } else {
          FailedModal("failed upload");
        }
      },
      onCancel: () => {
        console.log("Cancel");
      },
    });
  };
  const ModalContent = () => {
    const newLocal = "moveOutDate";
    return (
      <Form
        form={residentForm}
        name="residentCreateModal"
        className="managementFormContainer"
        labelCol={{ span: 22 }}
        wrapperCol={{ span: 22 }}
        initialValues={{ remember: true }}
        autoComplete="off"
        layout="vertical"
        onFinish={onFinish}
        onFinishFailed={() => {
          console.log("FINISHED FAILED");
        }}>
        <Row>
          <Col span={8}>
            <Form.Item<ResidentInformationFormDataType>
              label="First name"
              name="firstName"
              rules={requiredRule}>
              <Input
                size="large"
                placeholder="Please input first name"
                maxLength={120}
                showCount
              />
            </Form.Item>
            <Form.Item<ResidentInformationFormDataType>
              label="Last name"
              name="lastName"
              rules={requiredRule}>
              <Input
                size="large"
                placeholder="Please input last name"
                maxLength={120}
                showCount
              />
            </Form.Item>
            <Form.Item<ResidentInformationFormDataType>
              label="Nickname"
              name="nickName"
              // rules={requiredRule}
            >
              <Input
                size="large"
                placeholder="Please input nickname"
                maxLength={120}
                showCount
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item<ResidentInformationFormDataType>
              label="Mobile no."
              name="contact"
              rules={telRule}>
              <Input
                size="large"
                placeholder="Please input mobile no."
                maxLength={10}
                showCount
              />
            </Form.Item>
            <Form.Item<ResidentInformationFormDataType>
              label="Role"
              name="roleId"
              rules={requiredRule}>
              <Select size="large" placeholder="Select role" options={role} />
            </Form.Item>
            <Form.Item<ResidentInformationFormDataType>
              label="Room address"
              name="unitId"
              rules={requiredRule}>
              <Select
                size="large"
                placeholder="Please input Room address"
                options={unit}
              />
            </Form.Item>
            <Row>
              <Col span={12}>
                <Form.Item<ResidentInformationFormDataType>
                  name="moveInDate"
                  label="Move-in date">
                  <DatePicker
                    style={{ width: "92%" }}
                    disabledDate={disabledDate}
                    size="large"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item<ResidentInformationFormDataType>
                  name={newLocal}
                  label="Move-out date">
                  <DatePicker
                    style={{ width: "92%" }}
                    disabledDate={disabledDate}
                    size="large"
                  />
                </Form.Item>
              </Col>
            </Row>
          </Col>
          <Col span={8}>
            <Form.Item label="Hobby" name="hobby">
              <Input
                showCount
                size="large"
                maxLength={40}
                placeholder="Please input hobby"
              />
            </Form.Item>
            <Form.Item<ResidentInformationFormDataType>
              label="Email"
              name="email"
              rules={emailRule}>
              <Input
                size="large"
                placeholder="Please input email"
                maxLength={120}
                showCount
              />
            </Form.Item>
            <Form.Item name="birthDate" label="Birthday (Op)">
              <DatePicker
                size="large"
                style={{ width: "100%" }}
                placeholder="Select birthday"
                disabledDate={disabledDateBirth}
              />
            </Form.Item>
            <Form.Item label="QR Code smart locker" name="lockerCode">
              <Input
                showCount
                size="large"
                maxLength={120}
                placeholder="Please input code"
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  };

  return (
    <>
      <FormModal
        isOpen={open}
        title="Add new resident’s"
        content={<ModalContent />}
        footer={[
          <div style={{}}>
            <SmallButton
              className="saveButton"
              form={residentForm}
              formSubmit={residentForm.submit}
              message="Register"
            />
          </div>,
        ]}
        onOk={onOk}
        onCancel={onCancel}
        className="managementFormModal"
      />
    </>
  );
};
export default ResidentInformationCreateModal;
