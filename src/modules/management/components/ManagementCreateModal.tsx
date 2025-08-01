import { useState, useEffect } from "react";
import { Form, Input, Col, Row, Select, FormInstance } from "antd";
import { requiredRule, emailRule, telRule } from "../../../configs/inputRule";
import { useDispatch } from "react-redux";
import UploadImageGroup from "../../../components/group/UploadImageGroup";
import FormModal from "../../../components/common/FormModal";
import SmallButton from "../../../components/common/SmallButton";
import { Dispatch, RootState } from "../../../stores";
import {
  ManagementAddDataType,
  ManagementFormDataType,
  roleDetail,
} from "../../../stores/interfaces/Management";
import {
  addDataTeamManagement,
  getdataRole,
} from "../service/api/ManagementServiceAPI";
import SuccessModal from "../../../components/common/SuccessModal";
import FailedModal from "../../../components/common/FailedModal";
import ConfirmModal from "../../../components/common/ConfirmModal";

type ManagementCreateModalType = {
  isCreateModalOpen: boolean;
  callBack: (isOpen: boolean, saved: boolean) => void;
};

const ManagementCreateModal = ({
  isCreateModalOpen,
  callBack,
}: ManagementCreateModalType) => {
  const [open, setOpen] = useState(false);
  const [role, setrole] = useState<roleDetail[]>([]);
  const [imageUrl, setImageUrl] = useState<string>();
  const dispatch = useDispatch<Dispatch>();
  useEffect(() => {
    if (isCreateModalOpen) {
      (async function () {
        await initData();
        await setOpen(isCreateModalOpen);
      })();
    }
  }, [isCreateModalOpen]);

  const initData = async () => {
    const dataerole: any = await getdataRole();

    await setrole(dataerole?.data);
  };

  const handleImageChange = (url: string) => {
    setImageUrl(url);
  };

  const onOk = () => {};
  const onCancel = async () => {
    await managementForm
      .validateFields({ validateOnly: true })
      .then(async () => {
        await managementForm.resetFields();
      })
      .catch(async () => {
        await managementForm.resetFields();
      });
    await setImageUrl("");
    await setOpen(!open);
    await callBack(!open, false);
  };
  //from
  const [managementForm] = Form.useForm();
  const onFinish = async (values: any) => {
    const request: ManagementAddDataType = {
      firstName: values.firstName,
      lastName: values.lastName,
      middleName: values.middleName ? values.middleName : null,
      email: values.email,
      roleId: values.role,
      contact: values.contact,
      channel: "web",
      imageProfile: values.image ? values.image : null,
    };
    await showAddConfirm(request);
  };
  const showAddConfirm = (request: ManagementAddDataType) => {
    ConfirmModal({
      title: "You confirm the information?",
      okMessage: "Yes",
      cancelMessage: "Cancel",
      onOk: async () => {
        const resultCreated = await addDataTeamManagement(request);
        if (resultCreated) {
          SuccessModal("Successfully upload");
          await managementForm.resetFields();
          await setImageUrl("");
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
        form={managementForm}
        name="managementCreateModal"
        className="managementFormContainer"
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
              <Select size="large" placeholder="Select role" options={role} />
            </Form.Item>
          </Col>
          <Col span={12} style={{ paddingLeft: 20 }}>
            <Form.Item<ManagementFormDataType>
              label="Image"
              name="image"
              // rules={requiredRule}
            >
              <UploadImageGroup
                height={227}
                onChange={handleImageChange}
                image={imageUrl ?? ""}
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
          </Col>
        </Row>
      </Form>
    );
  };

  return (
    <>
      <FormModal
        isOpen={open}
        title="Add admin management"
        content={<ModalContent />}
        footer={[
          <div style={{}}>
            <SmallButton
              className="saveButton"
              form={managementForm}
              formSubmit={managementForm.submit}
              message="Add new"
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

export default ManagementCreateModal;
