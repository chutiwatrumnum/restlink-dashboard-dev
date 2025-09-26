// import { useState, useEffect } from "react";
import { Form, Col, Select, Modal, message } from "antd";
import { requiredRule } from "../../../../configs/inputRule";
import {
  getResidentRoleQuery,
  getResidentUnitQuery,
} from "../../../../utils/queriesGroup/residentQueries";
import { ResidentAddNew } from "../../../../stores/interfaces/ResidentInformation";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import ConfirmModal from "../../../../components/common/ConfirmModal";
import SmallButton from "../../../../components/common/SmallButton";
import { postCreateResidentMutation } from "../../../../utils/mutationsGroup/residentMutations";
import { useDispatch } from "react-redux";
import { Dispatch } from "../../../../stores";

type ManagementCreateModalType = {
  isCreateModalOpen: boolean;
  onCancel: () => void;
  refetch: () => void;
};
dayjs.extend(customParseFormat);

const ResidentInformationCreateModal = ({
  isCreateModalOpen,
  onCancel,
  refetch,
}: ManagementCreateModalType) => {
  const dispatch = useDispatch<Dispatch>();
  const [residentForm] = Form.useForm();
  const { data: roleData } = getResidentRoleQuery();
  const { data: unitData } = getResidentUnitQuery();
  const createResidentMutation = postCreateResidentMutation();

  const onCancelHandler = async () => {
    residentForm.resetFields();
    onCancel();
  };

  const onFinish = async (values: ResidentAddNew) => {
    showAddConfirm(values);
  };

  const showAddConfirm = (value: ResidentAddNew) => {
    ConfirmModal({
      title: "You confirm the information?",
      okMessage: "Yes",
      cancelMessage: "Cancel",
      onOk: async () => {
        // console.log(value);
        await createResidentMutation
          .mutateAsync(value)
          .then((res) => {
            if (res.status >= 400) {
              message.error(res.data.message, 3);
              throw new Error(res.data.message);
            }
            dispatch.resident.updateQrCodeState(res.data.data.qrCode);
            refetch();
          })
          .catch((err) => {
            console.log("CATCH : ", err);
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
        form={residentForm}
        name="residentCreateModal"
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
          <Form.Item<ResidentAddNew>
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
          <Form.Item<ResidentAddNew>
            label="Unit"
            name="unitId"
            rules={requiredRule}
          >
            <Select
              showSearch
              placeholder="Select a role"
              options={unitData}
              size="large"
              fieldNames={{ label: "roomAddress", value: "id" }}
              filterOption={(input, option) =>
                (option?.roomAddress ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
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
        title="Add new resident’s"
        centered={true}
        width={"100%"}
        style={{ maxWidth: 420 }}
        footer={[
          <div style={{}}>
            <SmallButton
              className="saveButton w-full"
              form={residentForm}
              formSubmit={residentForm.submit}
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
export default ResidentInformationCreateModal;
