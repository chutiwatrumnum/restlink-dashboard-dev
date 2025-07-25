import { useState, useEffect, useRef } from "react";
import { Form, Input, Modal } from "antd";
import { requiredRule, telRule } from "../../../configs/inputRule";
import { useDispatch } from "react-redux";
import { Dispatch } from "../../../stores";

import UploadImageGroup from "../../../components/group/UploadImageGroup";
import SmallButton from "../../../components/common/SmallButton";
import ConfirmModal from "../../../components/common/ConfirmModal";
import { DataEmergencyCreateByType } from "../../../stores/interfaces/Emergency";
import {
  Map,
  FullscreenControl,
  NavigationControl,
} from "react-map-gl/maplibre";
import GeoCoderControl from "./GeoCoderControl";
import maplibregl from "maplibre-gl";

import type { MapLayerMouseEvent } from "maplibre-gl";

import "@maplibre/maplibre-gl-geocoder/dist/maplibre-gl-geocoder.css";
import "maplibre-gl/dist/maplibre-gl.css";

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
  const mapRef = useRef<any>();
  const markerRef = useRef<maplibregl.Marker | null>(null);
  const currentLocation = useRef<{
    lng: number;
    lat: number;
  }>();

  // States
  const [open, setOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");

  const onModalClose = () => {
    form.resetFields();
    setPreviewImage("");
    onCancel();
  };

  const handleFormSubmit = async (value: DataEmergencyCreateByType) => {
    ConfirmModal({
      title: "You confirm the information?",
      okMessage: "Yes",
      cancelMessage: "Cancel",
      onOk: async () => {
        const payload: DataEmergencyCreateByType = {
          ...value,
          lat: currentLocation.current?.lat ?? 999,
          long: currentLocation.current?.lng ?? 999,
        };

        payload.image = value.image || null;

        const result = await dispatch.emergency.addNewEmergencyService(payload);

        if (result) {
          form.resetFields();
          setPreviewImage("");
          onOk();
          onRefresh();
        }
      },
    });
  };

  const handleFormFailed = () => {
    console.log("FINISHED FAILED");
  };

  const onMapClick = (e: MapLayerMouseEvent) => {
    // console.log(e);
    const { lng, lat } = e.lngLat;
    setMarker(lng, lat);
  };

  const setMarker = (lng: number, lat: number) => {
    if (!markerRef.current) {
      currentLocation.current = { lng: lng, lat: lat };
      markerRef.current = new maplibregl.Marker({
        anchor: "bottom",
        color: "red",
        draggable: true,
      })
        .setLngLat([lng, lat])
        .addTo(mapRef.current?.getMap());

      // Add dragend handler
      markerRef.current.on("dragend", (e) => {
        const { lng, lat } = e.target.getLngLat();
        currentLocation.current = { lng: lng, lat: lat };
      });
    } else {
      markerRef.current.setLngLat([lng, lat]);
      currentLocation.current = { lng: lng, lat: lat };
    }
  };

  useEffect(() => {
    setOpen(isCreateModalOpen);
    markerRef.current = null;
    currentLocation.current = undefined;
  }, [isCreateModalOpen]);

  const ModalContent = () => {
    return (
      <Form
        form={form}
        name="emergencyCreateModal"
        initialValues={{ remember: true }}
        autoComplete="off"
        layout="vertical"
        onFinish={handleFormSubmit}
        onFinishFailed={handleFormFailed}
      >
        <div>
          <div className="flex flex-row justify-between items-center w-full gap-4">
            <div className="flex flex-col justify-center items-center w-full">
              <Form.Item<DataEmergencyCreateByType>
                label="Image"
                name="image"
                className="w-full"
              >
                <UploadImageGroup
                  onChange={(url) => setPreviewImage(url)}
                  image={previewImage}
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
            <div className="flex flex-col justify-center items-center w-full">
              <Form.Item<DataEmergencyCreateByType>
                label="Map"
                rules={requiredRule}
                className="w-full"
              >
                <Map
                  initialViewState={{
                    longitude: 100.523186,
                    latitude: 13.736717,
                    zoom: 12,
                  }}
                  mapStyle="https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json"
                  style={{ width: "100%", height: 360 }}
                  onClick={onMapClick}
                  ref={mapRef}
                >
                  <GeoCoderControl position="top-left" />
                  <FullscreenControl />
                  <NavigationControl />
                </Map>
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
