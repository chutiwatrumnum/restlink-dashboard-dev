// import { useState, useEffect } from "react";
import { Form, Col, Select, Modal } from "antd";
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

const JuristicManageCreateModal = ({
  isCreateModalOpen,
  onCancel,
  refetch,
}: ManagementCreateModalType) => {
  const dispatch = useDispatch<Dispatch>();
  const [juristicForm] = Form.useForm();
  const { data: roleData } = getJuristicRoleQuery();
  const createJuristicMutation = postCreateJuristicMutation();

  const onCancelHandler = async () => {
    juristicForm.resetFields();
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
        form={juristicForm}
        name="juristicCreateModal"
        className="managementFormContainer"
        labelCol={{ span: 24 }}
        wrapperCol={{ span: 24 }}
        initialValues={{ remember: true }}
        autoComplete="off"
        layout="vertical"
        onFinish={onFinish}
        onFinishFailed={() => {
          console.log("FINISHED FAILED");
        }}
      >
        <Col span={24}>
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
        </Col>
      </Form>
    );
  };

  return (
    <>
      <Modal
        open={isCreateModalOpen}
        title="Add new juristic’s"
        centered={true}
        width={"100%"}
        style={{ maxWidth: 420 }}
        footer={[
          <div style={{}}>
            <SmallButton
              className="saveButton w-full"
              form={juristicForm}
              formSubmit={juristicForm.submit}
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
export default JuristicManageCreateModal;
