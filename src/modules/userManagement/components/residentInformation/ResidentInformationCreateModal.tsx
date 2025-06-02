// import { useState, useEffect } from "react";
import { Form, Col, Select } from "antd";
import { requiredRule } from "../../../../configs/inputRule";
import {
  getResidentRoleQuery,
  getResidentUnitQuery,
} from "../../../../utils/queriesGroup/residentQueries";
import { ResidentInformationFormDataType } from "../../../../stores/interfaces/ResidentInformation";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import ConfirmModal from "../../../../components/common/ConfirmModal";
import FormModal from "../../../../components/common/FormModal";
import SmallButton from "../../../../components/common/SmallButton";
import { postCreateResidentMutation } from "../../../../utils/mutationsGroup/residentMutations";
import { useDispatch } from "react-redux";
import { Dispatch } from "../../../../stores";

type ManagementCreateModalType = {
  isCreateModalOpen: boolean;
  onCancel: () => void;
};
dayjs.extend(customParseFormat);

const ResidentInformationCreateModal = ({
  isCreateModalOpen,
  onCancel,
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

  const onFinish = async (values: ResidentInformationFormDataType) => {
    showAddConfirm(values);
  };

  const showAddConfirm = (value: ResidentInformationFormDataType) => {
    ConfirmModal({
      title: "You confirm the information?",
      okMessage: "Yes",
      cancelMessage: "Cancel",
      onOk: async () => {
        // console.log(value);
        await createResidentMutation
          .mutateAsync(value)
          .then((res) => {
            // console.log(res.data.data.qrCode);
            dispatch.resident.updateQrCodeState(res.data.data.qrCode);
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
          <Form.Item<ResidentInformationFormDataType>
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
          <Form.Item<ResidentInformationFormDataType>
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
      <FormModal
        isOpen={isCreateModalOpen}
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
        onOk={() => {}}
        onCancel={onCancelHandler}
        className="managementFormModal"
      />
    </>
  );
};
export default ResidentInformationCreateModal;
