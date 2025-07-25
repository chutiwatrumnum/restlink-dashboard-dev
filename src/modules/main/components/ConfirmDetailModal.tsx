import { useDispatch, useSelector } from "react-redux";
import { Dispatch, RootState } from "../../../stores";
import { JoinPayloadType } from "../../../stores/interfaces/JuristicManage";

// Components
import { Modal, Input, Form, Button } from "antd";

// Types
import type { FormProps } from "antd";

interface ConfirmDetailModalProps {
  onOk: (code: JoinPayloadType) => void;
  onClose: () => void;
}

const ConfirmDetailModal = (props: ConfirmDetailModalProps) => {
  const [form] = Form.useForm();
  const { onOk, onClose } = props;
  const dispatch = useDispatch<Dispatch>();
  const { isConfirmDetailModalOpen } = useSelector(
    (state: RootState) => state.userAuth
  );

  // Functions
  const onFinish: FormProps<JoinPayloadType>["onFinish"] = (values) => {
    // console.log("Success:", values);
    onOk(values);
  };

  const onFinishFailed: FormProps<JoinPayloadType>["onFinishFailed"] = (
    errorInfo
  ) => {
    console.log("Failed:", errorInfo);
  };

  const onCancel = () => {
    onClose();
    dispatch.userAuth.updateIsConfirmDetailModalOpenState(false);
  };

  return (
    <Modal
      width={400}
      open={isConfirmDetailModalOpen}
      title={
        <span style={{ fontWeight: "var(--font-bold)" }}>
          Please confirm your information
        </span>
      }
      onCancel={onCancel}
      centered={true}
      footer={null}
      closable
    >
      <Form
        form={form}
        name="joinForm"
        style={{ maxWidth: 600 }}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        layout="vertical"
      >
        <Form.Item<JoinPayloadType>
          label="First name"
          name="firstName"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
        <Form.Item<JoinPayloadType> label="Middle name" name="middleName">
          <Input />
        </Form.Item>
        <Form.Item<JoinPayloadType>
          label="Last name"
          name="lastName"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
        <Form.Item<JoinPayloadType>
          label="Contact"
          name="contact"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>

        <Form.Item label={null}>
          <Button size="large" type="primary" htmlType="submit" block>
            Submit
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ConfirmDetailModal;
