// src/modules/setting/components/ChangePasswordModal.tsx

import { useState } from "react";
import { Form, Input } from "antd";
import { resetPasswordRule } from "../../../configs/inputRule";
import FormModal from "../../../components/common/FormModal";
import MediumButton from "../../../components/common/MediumButton";
import { callConfirmModal } from "../../../components/common/Modal";
import { LockIcon } from "../../../assets/icons/Icons";
import { changePassword } from "../service/api/profile_api";
import SuccessModal from "../../../components/common/SuccessModal";
import FailedModal from "../../../components/common/FailedModal";

import "../styles/setting.css";

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ChangePasswordFormData {
  oldPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

const ChangePasswordModal = ({ isOpen, onClose }: ChangePasswordModalProps) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: ChangePasswordFormData) => {
    // แสดง Confirmation Modal
    callConfirmModal({
      title: "Confirm password change",
      message: "Do you want to change your password?",
      okMessage: "Confirm",
      cancelMessage: "Cancel",
      onOk: async () => {
        await performPasswordChange(values);
      },
      onCancel: () => {
        // ไม่ต้องทำอะไร จะปิด modal confirmation อัตโนมัติ
      },
    });
  };

  const performPasswordChange = async (values: ChangePasswordFormData) => {
    setLoading(true);
    try {
      const result = await changePassword({
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
        confirmNewPassword: values.confirmNewPassword,
      });

      if (result.status) {
        SuccessModal("Password changed successfully");
        form.resetFields();
        onClose();
      } else {
        FailedModal(result.error || "Failed to change password");
      }
    } catch (error) {
      FailedModal("An error occurred while changing password");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  const ModalContent = () => {
    return (
      <Form
        form={form}
        name="changePasswordModal"
        layout="vertical"
        onFinish={handleSubmit}
        autoComplete="off"
        className="changePasswordModalForm">
        <Form.Item
          label="New password"
          name="newPassword"
          rules={resetPasswordRule}>
          <Input.Password
            prefix={<LockIcon />}
            size="large"
            placeholder="Enter new password"
          />
        </Form.Item>

        <Form.Item
          label="Re-enter new password"
          name="confirmNewPassword"
          rules={[
            ...resetPasswordRule,
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("newPassword") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(
                  new Error("Password confirmation doesn't match")
                );
              },
            }),
          ]}>
          <Input.Password
            prefix={<LockIcon />}
            size="large"
            placeholder="Re-enter new password"
          />
        </Form.Item>

        <Form.Item
          label="Current password"
          name="oldPassword"
          rules={[
            { required: true, message: "Please enter your current password" },
          ]}>
          <Input.Password
            prefix={<LockIcon />}
            size="large"
            placeholder="Enter current password"
          />
        </Form.Item>

        <div className="changePasswordModalFooter">
          <MediumButton
            className="resetPasswordBtn"
            message="Reset Password"
            form={form}
          />
        </div>
      </Form>
    );
  };

  return (
    <FormModal
      isOpen={isOpen}
      title="Change password"
      content={<ModalContent />}
      onOk={() => {}} // ไม่ใช้ onOk ของ Modal แต่ใช้ form submit แทน
      onCancel={handleCancel}
      footer={null} // ไม่ใช้ footer ของ Modal เพราะใช้ footer ของ Form แทน
      width="500px"
      className="changePasswordModal"
      destroyOnClose={true}
    />
  );
};

export default ChangePasswordModal;
