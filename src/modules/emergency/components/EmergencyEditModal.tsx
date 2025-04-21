import { useState, useEffect } from "react";
import { Form, Input } from "antd";
import { requiredRule, telRule } from "../../../configs/inputRule";
import { useDispatch } from "react-redux";
import { Dispatch } from "../../../stores";
import UploadImageGroup from "../../../components/group/UploadImageGroup";
import FormModal from "../../../components/common/FormModal";
import SmallButton from "../../../components/common/SmallButton";
import ConfirmModal from "../../../components/common/ConfirmModal";
import SuccessModal from "../../../components/common/SuccessModal";
import {
  DataEmergencyCreateByType,
  DataEmergencyTableDataType,
} from "../../../stores/interfaces/Emergency";

type EmergencyEditModalType = {
  isEditModalOpen: boolean;
  onOk: () => void;
  onCancel: () => void;
  data: DataEmergencyTableDataType | null;
  onRefresh: () => void;
};

const EmergencyEditModal = ({
  isEditModalOpen,
  onOk,
  onCancel,
  data,
  onRefresh,
}: EmergencyEditModalType) => {
  const dispatch = useDispatch<Dispatch>();
  const id = data?.id;
  const [emergencyForm] = Form.useForm();
  const [open, setOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");

  const onClose = () => {
    emergencyForm.resetFields();
    onCancel();
  };

  useEffect(() => {
    setOpen(isEditModalOpen);
  }, [isEditModalOpen]);

  useEffect(() => {
    if (data) {
      setPreviewImage(data.image ?? "");
      emergencyForm.setFieldsValue(data);
    }
  }, [data]);

  const ModalContent = () => {
    return (
      <Form
        form={emergencyForm}
        name="EmergencyEditModal"
        initialValues={{ remember: true }}
        autoComplete="off"
        layout="vertical"
        onFinish={async (value) => {
          ConfirmModal({
            title: "Are you sure you want to edit this?",
            okMessage: "Yes",
            cancelMessage: "Cancel",
            onOk: async () => {
              const payload: DataEmergencyCreateByType = {
                ...value,
                id: id,
                image: null,
              };
              if (value.image !== data?.image) {
                payload.image = value.image;
              }
              const result = await dispatch.emergency.editEmergencyService(
                payload
              );
              if (result) {
                emergencyForm.resetFields();
                onOk();
                onRefresh();
                SuccessModal("Successfully Upload");
              }
            },
            onCancel: () => console.log("Cancel"),
          });
        }}
        onFinishFailed={() => {
          console.log("FINISHED FAILED");
        }}>
        <div className="announceModalColumn">
          <div className="announceModalContainer">
            <div className="announceModalColumn">
              <Form.Item<DataEmergencyCreateByType> label="Image" name="image">
                <UploadImageGroup
                  onChange={(url) => {
                    setPreviewImage(url);
                  }}
                  image={previewImage}
                  ratio="1920x1080 px"
                />
              </Form.Item>
              <Form.Item<DataEmergencyCreateByType>
                label="Name"
                name="name"
                rules={requiredRule}>
                <Input
                  size="large"
                  placeholder="Please input name"
                  maxLength={120}
                  showCount
                />
              </Form.Item>
              <Form.Item<DataEmergencyCreateByType>
                label="Tel."
                name="tel"
                rules={telRule}>
                <Input
                  size="large"
                  placeholder="Please input tel"
                  maxLength={10}
                  showCount
                />
              </Form.Item>
            </div>
          </div>
          <SmallButton
            className="saveButton"
            message="Save"
            form={emergencyForm}
          />
        </div>
      </Form>
    );
  };

  return (
    <>
      <FormModal
        isOpen={open}
        title="Edit emergency call"
        content={<ModalContent />}
        onOk={onOk}
        onCancel={onClose}
        className="emergencyFormModal"
      />
    </>
  );
};

export default EmergencyEditModal;
