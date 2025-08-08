// import { useState, useEffect } from "react";
import { Form, Col, Select, Modal, Row, Input } from "antd";
import { requiredRule } from "../../../configs/inputRule";
import { getJuristicRoleQuery } from "../../../utils/queriesGroup/juristicQueries";
import { JuristicAddNew } from "../../../stores/interfaces/JuristicManage";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import ConfirmModal from "../../../components/common/ConfirmModal";
import SmallButton from "../../../components/common/SmallButton";
import { postCreateJuristicMutation } from "../../../utils/mutationsGroup/juristicMutations";
import { useDispatch } from "react-redux";
import { Dispatch } from "../../../stores";

type ManagementCreateModalType = {
  isCreateModalOpen: boolean;
  onCancel: () => void;
  refetch: () => void;
};
dayjs.extend(customParseFormat);

const StaffManageCreateModal = ({
  isCreateModalOpen,
  onCancel,
  refetch,
}: ManagementCreateModalType) => {
  const dispatch = useDispatch<Dispatch>();
  const [createStaffForm] = Form.useForm();
  const { data: roleData } = getJuristicRoleQuery();
  const createJuristicMutation = postCreateJuristicMutation();

  const onCancelHandler = async () => {
    createStaffForm.resetFields();
    onCancel();
  };

  const onFinish = async (values: JuristicAddNew) => {
    showAddConfirm(values);
  };

  const showAddConfirm = (value: JuristicAddNew) => {
    ConfirmModal({
      title: "You confirm the information?",
      okMessage: "Yes",
      cancelMessage: "Cancel",
      onOk: async () => {
        // console.log(value);
        await createJuristicMutation
          .mutateAsync(value)
          .then((res) => {
            console.log("RESULT DATA : ", res);
            dispatch.juristic.updateQrCodeState(res.data.data.qrCode);
            refetch();
          })
          .catch((err) => {
            console.log(err);
          })
          .finally(() => {
            onCancelHandler();
          });
      },
      onCancel: () => {
        console.log("Cancel");
      },
    });
  };

  const ModalContent = () => {
    return (
      <Form
        form={createStaffForm}
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

  return (
    <>
      <Modal
        open={isCreateModalOpen}
        title="Add staff"
        centered={true}
        width={"100%"}
        style={{ maxWidth: 1000 }}
        footer={[
          <div style={{}}>
            <SmallButton
              className="saveButton w-full"
              form={createStaffForm}
              formSubmit={createStaffForm.submit}
              message="Register"
            />
          </div>,
        ]}
        onOk={() => {}}
        onCancel={onCancelHandler}
        className="managementFormModal"
      >
        <ModalContent />
      </Modal>
    </>
  );
};
export default StaffManageCreateModal;
