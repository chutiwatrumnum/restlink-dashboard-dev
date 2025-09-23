import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Form, Input, Modal, Typography } from "antd";
import { requiredRule, telRule } from "../../../configs/inputRule";
import { useDispatch } from "react-redux";
import { Dispatch } from "../../../stores";

import UploadImageGroup from "../../../components/group/UploadImageGroup";
import SmallButton from "../../../components/common/SmallButton";
import ConfirmModal from "../../../components/common/ConfirmModal";
import { DataEmergencyCreateByType } from "../../../stores/interfaces/Emergency";

// ⛳️ ใช้ Google Map
import GoogleMapComponent from "../components/GoogleMapComponent";

type EmergencyCreateModalType = {
  isCreateModalOpen: boolean;
  onOk: () => void;
  onCancel: () => void;
  onRefresh: () => void;
};

const EmergencyCreateModal = ({
  isCreateModalOpen,
  onOk,
  onCancel,
  onRefresh,
}: EmergencyCreateModalType) => {
  const dispatch = useDispatch<Dispatch>();
  const [form] = Form.useForm();

  // ====== Map states ======
  const currentLocation = useRef<{ lng: number; lat: number }>();
  const hasPickedLocationRef = useRef<boolean>(false);

  const handleLocationChange = useCallback((lat: number, lng: number) => {
    currentLocation.current = { lat, lng };
    if (!hasPickedLocationRef.current) {
      hasPickedLocationRef.current = true;
    }
  }, []);

  // สร้าง MapElement แค่ครั้งเดียว ป้องกันรี-mount ตอน state อื่นเปลี่ยน
  const MapElement = useMemo(
    () => (
      <GoogleMapComponent
        onLocationChange={handleLocationChange}
        height={360}
        width="100%"
        zoom={12}
        draggableMarker
      />
    ),
    [handleLocationChange]
  );

  // ===== UI states =====
  const [open, setOpen] = useState(false);
  const previewImageRef = useRef<string>("");

  const onModalClose = () => {
    form.resetFields();
    previewImageRef.current = "";
    // reset map state ให้เหมือนตอนเปิดใหม่
    currentLocation.current = undefined;
    hasPickedLocationRef.current = false;
    onCancel();
  };

  const handleFormSubmit = async (value: DataEmergencyCreateByType) => {
    ConfirmModal({
      title: "You confirm the information?",
      okMessage: "Yes",
      cancelMessage: "Cancel",
      onOk: async () => {
        const { lat, lng } = currentLocation.current ?? {};

        const payload: DataEmergencyCreateByType = {
          ...value,
          lat: lat ?? 0,
          long: lng ?? 0,
          image: value.image || null,
        };

        const result = await dispatch.emergency.addNewEmergencyService(payload);

        if (result) {
          form.resetFields();
          previewImageRef.current = "";
          // reset map state
          currentLocation.current = undefined;
          hasPickedLocationRef.current = false;

          onOk();
          onRefresh();
        }
      },
    });
  };

  const handleFormFailed = () => {
    console.log("FINISHED FAILED");
  };

  useEffect(() => {
    setOpen(isCreateModalOpen);
    if (isCreateModalOpen) {
      // เปิด modal ใหม่ -> รีเซ็ตสถานะแผนที่ให้เป็นค่าเริ่มต้น
      currentLocation.current = undefined;
    }
  }, [isCreateModalOpen]);

  const ModalContent = () => {
    const { Text } = Typography;

    return (
      <Form
        form={form}
        name="emergencyCreateModal"
        initialValues={{ remember: true }}
        autoComplete="off"
        layout="vertical"
        onFinish={handleFormSubmit}
        onFinishFailed={handleFormFailed}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.preventDefault();
        }}
      >
        <div>
          <div className="flex flex-row justify-between items-center w-full gap-4">
            {/* ซ้าย */}
            <div className="flex flex-col justify-center items-center w-full">
              <Form.Item<DataEmergencyCreateByType>
                label="Image"
                name="image"
                className="w-full"
              >
                <UploadImageGroup
                  onChange={(url) => (previewImageRef.current = url)}
                  image={previewImageRef.current}
                  ratio="1920x1080 px"
                />
              </Form.Item>

              <Form.Item<DataEmergencyCreateByType>
                label="Name"
                name="name"
                rules={requiredRule}
                className="w-full"
              >
                <Input
                  size="large"
                  placeholder="Please input name"
                  maxLength={120}
                  showCount
                />
              </Form.Item>
            </div>

            {/* ขวา */}
            <div className="flex flex-col justify-center items-center w-full">
              <Form.Item
                label="Map"
                rules={[
                  {
                    validator: () => {
                      const { lat, lng } = currentLocation.current ?? {};
                      if (
                        !hasPickedLocationRef ||
                        lat === undefined ||
                        lng === undefined
                      ) {
                        return Promise.reject(
                          "Please select a location on the map"
                        );
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
                className="w-full"
              >
                {MapElement}
              </Form.Item>

              <Form.Item<DataEmergencyCreateByType>
                label="Tel."
                name="tel"
                rules={telRule}
                className="w-full"
              >
                <Input
                  size="large"
                  placeholder="Please input tel"
                  maxLength={10}
                  showCount
                />
              </Form.Item>
            </div>
          </div>

          <div className="flex flex-row justify-end items-center w-full">
            <SmallButton className="saveButton" message="Add" form={form} />
          </div>
        </div>
      </Form>
    );
  };

  return (
    <Modal
      open={open}
      title="Add contact lists"
      onOk={onOk}
      onCancel={onModalClose}
      width={"90%"}
      style={{ maxWidth: 1000 }}
      footer={null}
      centered
    >
      <ModalContent />
    </Modal>
  );
};

export default EmergencyCreateModal;
