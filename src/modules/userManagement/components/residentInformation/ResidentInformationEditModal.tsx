import { useEffect } from "react";
import { Form, Input, Col, Row, Modal } from "antd";
import { requiredRule } from "../../../../configs/inputRule";
import SmallButton from "../../../../components/common/SmallButton";
import {
  ResidentEdit,
  ResidentInformationFormDataType,
} from "../../../../stores/interfaces/ResidentInformation";
import dayjs from "dayjs";
import { editdataresident } from "../../service/api/ResidentServiceAPI";
import SuccessModal from "../../../../components/common/SuccessModal";
import FailedModal from "../../../../components/common/FailedModal";
import ConfirmModal from "../../../../components/common/ConfirmModal";

type ManagementEditModalType = {
  isEditModalOpen: boolean;
  callBack: (isOpen: boolean, saved: boolean) => void;
  data: any;
};

const ResidentInformationEditModal = ({
  isEditModalOpen,
  callBack,
  data,
}: ManagementEditModalType) => {
  const [residentInformationForm] = Form.useForm();

  const onClose = async () => {
    residentInformationForm.resetFields();
    callBack(!open, false);
  };

  const onFinish = async (values: any) => {
    const payload: ResidentEdit = {
      givenName: values.givenName,
      middleName: values.middleName,
      familyName: values.familyName,
    };
    showEditConfirm(data.userId, payload);
  };

  const showEditConfirm = (userId: string, payload: ResidentEdit) => {
    ConfirmModal({
      title: "You confirm the information?",
      okMessage: "Yes",
      cancelMessage: "Cancel",
      onOk: async () => {
        const resultedit = await editdataresident(userId, payload);
        if (resultedit) {
          SuccessModal("Successfully upload");
          residentInformationForm.resetFields();
          callBack(!open, true);
        } else {
          FailedModal("failed upload");
        }
      },
      onCancel: () => {
        console.log("Cancel");
      },
    });
  };

  useEffect(() => {
    residentInformationForm.setFieldsValue({
      givenName: data?.givenName,
      middleName: data?.middleName ?? "",
      familyName: data?.familyName,
      nickName: data?.nickName,
      contact: data?.contact,
      email: data?.email,
    });
    return () => {
      residentInformationForm.resetFields();
    };
  }, [isEditModalOpen]);

  const ModalContent = () => {
    return (
      <Form
        form={residentInformationForm}
        name="residentEditModal"
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
            <Form.Item<ResidentInformationFormDataType>
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
            <Form.Item<ResidentInformationFormDataType>
              label="Middle name"
              name="middleName"
            >
              <Input
                size="large"
                placeholder="Please input middle name"
                maxLength={120}
                showCount
              />
            </Form.Item>
            <Form.Item<ResidentInformationFormDataType>
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
            <Form.Item<ResidentInformationFormDataType>
              label="Nickname"
              name="nickName"
            >
              <Input
                size="large"
                placeholder="Please input nickname"
                maxLength={120}
                showCount
                disabled
              />
            </Form.Item>
            <Form.Item<ResidentInformationFormDataType>
              label="Phone number"
              name="contact"
            >
              <Input
                size="large"
                placeholder="Please input last name"
                maxLength={120}
                showCount
                disabled
              />
            </Form.Item>
            <Form.Item<ResidentInformationFormDataType>
              label="Email"
              name="email"
            >
              <Input
                size="large"
                placeholder="Please input nickname"
                maxLength={120}
                showCount
                disabled
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
        title="Edit user"
        centered={true}
        width={"100%"}
        style={{ minWidth: 400, maxWidth: 900 }}
        footer={[
          <SmallButton
            className="saveButton"
            form={residentInformationForm}
            formSubmit={residentInformationForm.submit}
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

export default ResidentInformationEditModal;
