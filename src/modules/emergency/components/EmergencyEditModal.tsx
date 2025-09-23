import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Form, Input, Modal, Typography } from "antd";
import { requiredRule, telRule } from "../../../configs/inputRule";
import { useDispatch } from "react-redux";
import { Dispatch } from "../../../stores";

import UploadImageGroup from "../../../components/group/UploadImageGroup";
import SmallButton from "../../../components/common/SmallButton";
import {
  DataEmergencyCreateByType,
  DataEmergencyTableDataType,
} from "../../../stores/interfaces/Emergency";

// ⛳️ ใช้ Google Map
import GoogleMapComponent from "../components/GoogleMapComponent";

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
  const [emergencyForm] = Form.useForm();

  const [open, setOpen] = useState(false);
  const previewImageRef = useRef<string>("");

  // ==== Map states ====
  const currentLocation = useRef<{ lat: number; lng: number }>();

  const handleLocationChange = useCallback((lat: number, lng: number) => {
    currentLocation.current = { lat, lng };
  }, []);

  // เตรียม Map element ให้ re-mount เมื่อ key เปลี่ยน (เช่น เปิด modal ใหม่/เปลี่ยน data)
  const MapElement = useMemo(
    () => (
      <GoogleMapComponent
        onLocationChange={handleLocationChange}
        initialLat={data?.lat ?? 0}
        initialLng={data?.long ?? 0}
        height={360}
        width="100%"
        zoom={18}
        draggableMarker
      />
    ),
    [handleLocationChange, data]
  );

  const onClose = () => {
    emergencyForm.resetFields();
    currentLocation.current = undefined;
    onCancel();
  };

  // เปิด/ปิด modal
  useEffect(() => {
    setOpen(isEditModalOpen);
    if (isEditModalOpen) {
      // ตั้งค่าเริ่มต้นแผนที่จาก data (ถ้ามี), ไม่งั้นใช้ DEFAULT_CENTER
      const initLat = data?.lat ?? 0;
      const initLng = data?.long ?? 0;
      currentLocation.current = { lat: initLat, lng: initLng };
    }
  }, [isEditModalOpen, data]);

  // เติมฟอร์มจาก data
  useEffect(() => {
    if (data) {
      previewImageRef.current = data.image ?? "";
      emergencyForm.setFieldsValue(data);
    }
  }, [data, emergencyForm]);

  const ModalContent = () => {
    return (
      <Form
        form={emergencyForm}
        name="EmergencyEditModal"
        initialValues={{ remember: true }}
        autoComplete="off"
        layout="vertical"
        onFinish={async (value) => {
          const payload: DataEmergencyCreateByType = {
            ...value,
            id: data?.id,
            image: null,
            long: currentLocation.current?.lng ?? 0,
            lat: currentLocation.current?.lat ?? 0,
          };
          if (value.image !== data?.image) {
            payload.image = value.image;
          }
          const result = await dispatch.emergency.editEmergencyService(payload);
          if (result) {
            emergencyForm.resetFields();
            onOk();
            onRefresh();
          }
        }}
        onFinishFailed={() => {
          console.log("FINISHED FAILED");
        }}
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

            {/* ขวา: แผนที่ */}
            <div className="flex flex-col justify-center items-center w-full">
              <Form.Item<DataEmergencyCreateByType>
                label="Map"
                className="w-full"
                rules={[
                  {
                    validator: () => {
                      const { lat, lng } = currentLocation.current || {};
                      if (lat === undefined || lng === undefined) {
                        return Promise.reject(
                          "Please select a location on the map"
                        );
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
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
            <SmallButton
              className="saveButton"
              message="Save"
              form={emergencyForm}
            />
          </div>
        </div>
      </Form>
    );
  };

  return (
    <Modal
      open={open}
      title="Edit contact lists"
      onOk={onOk}
      onCancel={onClose}
      width={"90%"}
      style={{ maxWidth: 1000 }}
      footer={null}
      centered
    >
      <ModalContent />
    </Modal>
  );
};

export default EmergencyEditModal;
