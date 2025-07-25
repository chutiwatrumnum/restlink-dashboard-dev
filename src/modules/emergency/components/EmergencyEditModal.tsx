import { useState, useEffect, useRef } from "react";
import { Form, Input, Modal } from "antd";
import { requiredRule, telRule } from "../../../configs/inputRule";
import { useDispatch } from "react-redux";
import { Dispatch } from "../../../stores";
import UploadImageGroup from "../../../components/group/UploadImageGroup";
import SmallButton from "../../../components/common/SmallButton";
import ConfirmModal from "../../../components/common/ConfirmModal";
import SuccessModal from "../../../components/common/SuccessModal";
import {
  DataEmergencyCreateByType,
  DataEmergencyTableDataType,
} from "../../../stores/interfaces/Emergency";
import {
  Map,
  FullscreenControl,
  NavigationControl,
  Marker,
} from "react-map-gl/maplibre";
import GeoCoderControl from "./GeoCoderControl";
import maplibregl from "maplibre-gl";

import type { MapLayerMouseEvent } from "maplibre-gl";

import "@maplibre/maplibre-gl-geocoder/dist/maplibre-gl-geocoder.css";
import "maplibre-gl/dist/maplibre-gl.css";

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
  const mapRef = useRef<any>();
  const markerRef = useRef<maplibregl.Marker | null>(null);
  const previousDataRef = useRef<DataEmergencyTableDataType | null>(null);
  const currentLocation = useRef<{
    lng: number;
    lat: number;
  }>();

  const id = data?.id;
  // States
  const [emergencyForm] = Form.useForm();
  const [open, setOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");

  const onClose = () => {
    emergencyForm.resetFields();
    onCancel();
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

  const clearData = () => {
    markerRef.current = null;
    previousDataRef.current = null;
    currentLocation.current = undefined;
  };

  useEffect(() => {
    setOpen(isEditModalOpen);
    clearData();
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
                long: currentLocation.current?.lng ?? 999,
                lat: currentLocation.current?.lat ?? 999,
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
        }}
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
                  onLoad={() => {
                    if (
                      data &&
                      JSON.stringify(previousDataRef.current) !==
                        JSON.stringify(data)
                    ) {
                      previousDataRef.current = data;
                      mapRef.current.flyTo({
                        center: [data?.long, data?.lat],
                        zoom: 12,
                      });
                      setMarker(data?.long, data?.lat);
                    }
                  }}
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
    <>
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
    </>
  );
};

export default EmergencyEditModal;
