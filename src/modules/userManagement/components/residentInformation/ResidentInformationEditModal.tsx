import { useState, useEffect } from "react";
import { Form, Input, Col, Row, Select, DatePicker } from "antd";
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
import customParseFormat from "dayjs/plugin/customParseFormat";
import dayjs from "dayjs";
import { RangePickerProps } from "antd/es/date-picker";
import {
  editdataresident,
  getDataMasterResidentDetail,
} from "../../service/api/ResidentServiceAPI";
import SuccessModal from "../../../../components/common/SuccessModal";
import FailedModal from "../../../../components/common/FailedModal";
import ConfirmModal from "../../../../components/common/ConfirmModal";

type ManagementEditModalType = {
  isEditModalOpen: boolean;
  callBack: (isOpen: boolean, saved: boolean) => void;
  data: any;
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
const ResidentInformationEditModal = ({
  isEditModalOpen,
  callBack,
  data,
}: ManagementEditModalType) => {
  const [residentInformationForm] = Form.useForm();
  const [open, setOpen] = useState(false);
  const [role, setrole] = useState<roleDetail[]>([]);
  const [unit, setunitDetail] = useState<unitDetail[]>([]);
  const onClose = async () => {
    residentInformationForm.resetFields();

    await setOpen(!open);
    await callBack(!open, false);
  };
  useEffect(() => {
    if (isEditModalOpen) {
      (async function () {
        await initData();
        await setOpen(isEditModalOpen);
      })();
    }
  }, [isEditModalOpen]);

  const initData = async () => {
    const resultDataMaster: any = await getDataMasterResidentDetail();
    if (resultDataMaster.status) {
      if (resultDataMaster?.dataRole) {
        resultDataMaster?.dataRole.map((e: any) => {
          if (e?.label === data.role) {
            data.roleId = e?.value;
          }
        });
      }
      if (resultDataMaster?.dataUnit) {
        resultDataMaster?.dataUnit.map((e: any) => {
          if (e?.label === data.roomAddress) {
            data.unitId = e?.value;
          }
        });
      }
      await setrole(resultDataMaster?.dataRole);
      await setunitDetail(resultDataMaster?.dataUnit);
    }
    (data.birthDate = data.birthDate ? dayjs(data.birthDate) : null),
      (data.moveInDate =
        data.moveInDate !==  null ? dayjs(data.moveInDate) : null),
      (data.moveOutDate =
        data.moveOutDate !== null ? dayjs(data.moveOutDate) : null),
      await residentInformationForm.setFieldsValue({
        ...data,
      });
  };
  const onFinish = async (values: any) => {
    values.moveInDate = dayjs(values.moveInDate).format("YYYY-MM-DD");
    values.moveOutDate = dayjs(values.moveOutDate).format("YYYY-MM-DD");
    values.birthDate = dayjs(values.birthDate).format("YYYY-MM-DD");
    values.channel = "web";
    values.imageProfile = data.imageProfile;
    const request: ResidentAddNew = {
      firstName: values.firstName,
      lastName: values.lastName,
      middleName: values.middleName,
      nickName: values.nickName ? values.nickName : null,
      email: values.email,
      roleId: values.roleId,
      hobby: values.hobby,
      unitId: values.unitId,
      iuNumber: values.iuNumber ? values.iuNumber : null,
      contact: values.contact,
      birthDate: values.birthDate !== "Invalid Date" ? values.birthDate : null,
      channel: values.channel,
      moveInDate:
        values.moveInDate !== "Invalid Date" ? values.moveInDate : null,
      moveOutDate:
        values.moveOutDate !== "Invalid Date" ? values.moveOutDate : null,
      lockerCode: values.lockerCode,
    };
    await showEditConfirm(data.key!, request);
  };

  const showEditConfirm = (key: string, request: ResidentAddNew) => {
    ConfirmModal({
      title: "You confirm the information?",
      okMessage: "Yes",
      cancelMessage: "Cancel",
      onOk: async () => {
        const resultedit = await editdataresident(key, request);
        if (resultedit) {
          SuccessModal("Successfully upload");
          await residentInformationForm.resetFields();
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
    return (
      <Form
        form={residentInformationForm}
        name="residentEditModal"
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
                  name="moveOutDate"
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

  function onOk(): void {
    throw new Error("Function not implemented.");
  }

  return (
    <>
      <FormModal
        isOpen={open}
        title="Edit resident's"
        content={<ModalContent />}
        footer={[
          <div style={{}}>
            <SmallButton
              className="saveButton"
              form={residentInformationForm}
              formSubmit={residentInformationForm.submit}
              message="save"
            />
          </div>,
        ]}
        onOk={onOk}
        onCancel={onClose}
        className="managementFormModal"
      />
    </>
  );
};

export default ResidentInformationEditModal;
