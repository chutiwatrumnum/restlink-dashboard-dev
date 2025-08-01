import { useState, useEffect } from "react";
import { Form, Input, Col, Row, Select, Modal } from "antd";
import { requiredRule, emailRule, telRule } from "../../../configs/inputRule";

import UploadImageGroup from "../../../components/group/UploadImageGroup";
import FormModal from "../../../components/common/FormModal";
import SmallButton from "../../../components/common/SmallButton";

import {
  ManagementAddDataType,
  ManagementFormDataType,
  roleDetail,
} from "../../../stores/interfaces/Management";
import SuccessModal from "../../../components/common/SuccessModal";
import {
  EditDataTeamManagement,
  addDataTeamManagement,
  getdataRole,
} from "../service/api/ManagementServiceAPI";
import FailedModal from "../../../components/common/FailedModal";
import ConfirmModal from "../../../components/common/ConfirmModal";

type ManagementEditModalType = {
  isEditModalOpen: boolean;
  callBack: (isOpen: boolean, saved: boolean) => void;
  data: ManagementFormDataType;
};

const ManagementEditModal = ({
  isEditModalOpen,
  callBack,
  data,
}: ManagementEditModalType) => {
  const [managementForm] = Form.useForm();
  const [open, setOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [role, setrole] = useState<roleDetail[]>([]);
  const onClose = async () => {
    await managementForm.resetFields();
    await setOpen(!open);
    await callBack(!open, false);
  };
  const { confirm } = Modal;
  useEffect(() => {
    if (isEditModalOpen) {
      (async function () {
        await initedit();
        await setOpen(isEditModalOpen);
      })();
    }
  }, [isEditModalOpen]);

  useEffect(() => {
    if (data) {
    }
  }, [data]);

  const initedit = async () => {
    const dataerole: any = await getdataRole();
    const dataEditinit: any = {
      role: data.role,
    };
    if (dataerole?.data) {
      dataerole?.data.map((e: any) => {
        if (e?.label === data.role) {
          dataEditinit.roleId = e?.value;
        }
      });
    }

    await setrole(dataerole?.data);
    await setPreviewImage(data.image ?? "");
    await managementForm.setFieldsValue({
      firstName: data.firstName,
      lastName: data.lastName,
      middleName: data.middleName,
      email: data.email,
      role: dataEditinit.roleId,
      contact: data.contact,
      image: data.image,
    });
  };
  const onOk = () => {};

  const showEditConfirm = (key: string, request: ManagementAddDataType) => {
    ConfirmModal({
      title: "Are you sure you want to edit this?",
      okMessage: "Yes",
      cancelMessage: "Cancel",
      onOk: async () => {
        const resultUpdated = await EditDataTeamManagement(data.key, request);
        if (resultUpdated) {
          SuccessModal("Successfully upload");
          await managementForm.resetFields();
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

  const onFinish = async (values: any) => {
    const request: ManagementAddDataType = {
      firstName: values.firstName,
      lastName: values.lastName,
      middleName: values.middleName ? values.middleName : null,
      email: values.email,
      roleId: values.role,
      contact: values.contact,
      channel: "web",
    };
    if (values.image !== data.image) {
      request.imageProfile = values.image;
    }
    await showEditConfirm(data.key!, request);
  };
  const ModalContent = () => {
    return (
      <Form
        form={managementForm}
        name="managementFormEditModal"
        // style={{ maxWidth: 600 }}

        initialValues={{ remember: true }}
        autoComplete="off"
        layout="vertical"
        onFinish={onFinish}
        onFinishFailed={() => {
          console.log("FINISHED FAILED");
        }}>
        <Row>
          <Col span={12}>
            <Form.Item<ManagementFormDataType>
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
            <Form.Item<ManagementFormDataType>
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
            <Form.Item<ManagementFormDataType>
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
            <Form.Item<ManagementFormDataType>
              label="Role"
              name="role"
              rules={requiredRule}>
              <Select
                size="large"
                placeholder="Select role"
                allowClear
                options={role}
              />
            </Form.Item>
          </Col>
          <Col span={12} style={{ paddingLeft: 20 }}>
            <Form.Item<ManagementFormDataType>
              label="Image"
              name="image"
              rules={requiredRule}>
              <UploadImageGroup
                height={227}
                onChange={() => {}}
                image={previewImage}
                ratio="1920x1080 px"
              />
            </Form.Item>
            <Form.Item<ManagementFormDataType>
              label="Mobile no."
              name="contact"
              rules={telRule}>
              <Input
                size="large"
                placeholder="Please input contact"
                maxLength={10}
                showCount
              />
            </Form.Item>
            {/* <div style={{}}>
              <SmallButton className="saveButton" message="Add new" />
            </div> */}
          </Col>
        </Row>
      </Form>
    );
  };

  return (
    <>
      <FormModal
        isOpen={open}
        title="Edit admin management"
        content={<ModalContent />}
        onOk={onOk}
        onCancel={onClose}
        footer={[
          <div style={{}}>
            <SmallButton
              className="saveButton"
              form={managementForm}
              formSubmit={managementForm.submit}
              message="Save"
            />
          </div>,
        ]}
        className="managementFormModal"
      />
    </>
  );
};

export default ManagementEditModal;
