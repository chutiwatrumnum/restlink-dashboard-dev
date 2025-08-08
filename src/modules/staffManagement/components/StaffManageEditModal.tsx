import { useEffect } from "react";
import { Form, Input, Col, Row, Modal, Select } from "antd";
import { requiredRule } from "../../../configs/inputRule";

import SmallButton from "../../../components/common/SmallButton";

import { JuristicAddNew } from "../../../stores/interfaces/JuristicManage";
import ConfirmModal from "../../../components/common/ConfirmModal";
import { getJuristicRoleQuery } from "../../../utils/queriesGroup/juristicQueries";

import { JuristicManageDataType } from "../../../stores/interfaces/JuristicManage";

type ManagementEditModalType = {
  isEditModalOpen: boolean;
  callBack: (isOpen: boolean, saved: boolean) => void;
  data: JuristicManageDataType;
};

const StaffManageEditModal = ({
  isEditModalOpen,
  callBack,
  data,
}: ManagementEditModalType) => {
  const [staffManageForm] = Form.useForm();

  // Data
  const { data: roleData } = getJuristicRoleQuery();

  const onClose = async () => {
    staffManageForm.resetFields();
    callBack(!open, false);
  };

  const onFinish = async (values: JuristicAddNew) => {
    const payload: JuristicAddNew = {
      givenName: values.givenName,
      familyName: values.familyName,
      middleName: values.middleName,
      roleId: values.roleId,
      contact: values.contact,
    };
    // console.log(data.userId, payload);
    showEditConfirm(data.userId, payload);
  };

  const showEditConfirm = (userId: string, payload: JuristicAddNew) => {
    ConfirmModal({
      title: "You confirm the information?",
      okMessage: "Yes",
      cancelMessage: "Cancel",
      onOk: async () => {},
      onCancel: () => {
        console.log("Cancel");
      },
    });
  };

  useEffect(() => {
    staffManageForm.setFieldsValue({
      givenName: data?.givenName,
      middleName: data?.middleName ?? "",
      familyName: data?.familyName,
      nickName: data?.nickName,
      contact: data?.contact,
      email: data?.email,
      roleId: data?.role.id,
    });
    return () => {
      staffManageForm.resetFields();
    };
  }, [isEditModalOpen]);

  const ModalContent = () => {
    return (
      <Form
        form={staffManageForm}
        name="staffEditModal"
        initialValues={{ remember: true }}
        autoComplete="off"
        layout="vertical"
        onFinish={onFinish}
        onFinishFailed={() => {
          console.log("FINISHED FAILED");
        }}
      >
        <Row gutter={16}>
          <Col sm={{ span: 12 }} xs={{ span: 24 }}>
            <Form.Item<JuristicAddNew>
              label="First name"
              name="givenName"
              rules={requiredRule}
            >
              <Input
                size="large"
                placeholder="Please input first name"
                maxLength={120}
                showCount
              />
            </Form.Item>
            <Form.Item<JuristicAddNew> label="Middle name" name="middleName">
              <Input
                size="large"
                placeholder="Please input middle name"
                maxLength={120}
                showCount
              />
            </Form.Item>
            <Form.Item<JuristicAddNew>
              label="Last name"
              name="familyName"
              rules={requiredRule}
            >
              <Input
                size="large"
                placeholder="Please input last name"
                maxLength={120}
                showCount
              />
            </Form.Item>
          </Col>
          <Col sm={{ span: 12 }} xs={{ span: 24 }}>
            <Form.Item<JuristicAddNew>
              label="Phone number"
              name="contact"
              rules={requiredRule}
            >
              <Input
                size="large"
                placeholder="Please input last name"
                maxLength={120}
                showCount
              />
            </Form.Item>
            <Form.Item<JuristicAddNew>
              label="Role"
              name="roleId"
              rules={requiredRule}
            >
              <Select
                placeholder="Select a role"
                options={roleData}
                size="large"
                fieldNames={{ label: "name", value: "id" }}
              />
            </Form.Item>
            <Form.Item label="Email" name="email">
              <Input
                size="large"
                placeholder="Please input nickname"
                maxLength={120}
                showCount
                disabled={true}
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
      <Modal
        open={isEditModalOpen}
        title="Edit staff"
        centered={true}
        width={"100%"}
        style={{ minWidth: 400, maxWidth: 900 }}
        footer={[
          <SmallButton
            className="saveButton"
            form={staffManageForm}
            formSubmit={staffManageForm.submit}
            message="Register"
          />,
          ,
        ]}
        onOk={onOk}
        onCancel={onClose}
        className="managementFormModal"
      >
        <ModalContent />
      </Modal>
    </>
  );
};

export default StaffManageEditModal;
