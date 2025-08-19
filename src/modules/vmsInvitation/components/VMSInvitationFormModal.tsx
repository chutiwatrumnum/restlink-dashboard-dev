// ไฟล์: src/modules/vmsInvitation/components/VMSInvitationFormModal.tsx - Clean Version

import { useState, useEffect } from "react";
import {
  Form,
  Input,
  Modal,
  DatePicker,
  Select,
  Switch,
  Row,
  Col,
  Tag,
  Spin,
} from "antd";
import { useSelector, useDispatch } from "react-redux";
import { RootState, Dispatch } from "../../../stores";
import { requiredRule } from "../../../configs/inputRule";
import SmallButton from "../../../components/common/SmallButton";
import {
  VMSInvitationPayload,
  VMSInvitationEditPayload,
  useCreateVMSInvitationMutation,
  useUpdateVMSInvitationMutation,
} from "../../../utils/mutationsGroup/vmsInvitationMutations";
import { InvitationRecord } from "../../../stores/interfaces/Invitation";
import dayjs from "dayjs";

interface VMSInvitationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editData?: InvitationRecord | null;
  refetch: () => void;
}

const VMSInvitationFormModal = ({
  isOpen,
  onClose,
  editData,
  refetch,
}: VMSInvitationFormModalProps) => {
  const [form] = Form.useForm();
  const dispatch = useDispatch<Dispatch>();

  // States
  const [houseOptions, setHouseOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [areaOptions, setAreaOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [vehicleOptions, setVehicleOptions] = useState<
    { label: string; value: string; licensePlate: string }[]
  >([]);
  const [loadingHouses, setLoadingHouses] = useState(false);
  const [loadingAreas, setLoadingAreas] = useState(false);
  const [loadingVehicles, setLoadingVehicles] = useState(false);

  // Get data from state
  const { tableData: houseData, loading: houseLoading } = useSelector(
    (state: RootState) => state.house
  );
  const { tableData: areaData, loading: areaLoading } = useSelector(
    (state: RootState) => state.area
  );
  const { tableData: vehicleData, loading: vehicleLoading } = useSelector(
    (state: RootState) => state.vehicle
  );

  // Mutations
  const createMutation = useCreateVMSInvitationMutation();
  const updateMutation = useUpdateVMSInvitationMutation();

  const isEditing = !!editData;
  const isLoading = createMutation.isPending || updateMutation.isPending;

  // Load data when modal opens
  useEffect(() => {
    const loadData = async () => {
      if (!isOpen) return;

      try {
        setLoadingHouses(true);
        if (!houseData || houseData.length === 0) {
          await dispatch.house.getHouseList({ page: 1, perPage: 500 });
        }

        setLoadingAreas(true);
        if (!areaData || areaData.length === 0) {
          await dispatch.area.getAreaList({ page: 1, perPage: 500 });
        }

        setLoadingVehicles(true);
        if (!vehicleData || vehicleData.length === 0) {
          await dispatch.vehicle.getVehicleList({ page: 1, perPage: 500 });
        }
      } catch (error) {
        // Error handled by individual dispatches
      } finally {
        setLoadingHouses(false);
        setLoadingAreas(false);
        setLoadingVehicles(false);
      }
    };

    loadData();
  }, [isOpen, dispatch, houseData, areaData, vehicleData]);

  // Convert house data to options
  useEffect(() => {
    if (houseData && houseData.length > 0) {
      const houses = houseData.map((house) => ({
        label: `${house.address} (${house.id.substring(0, 8)}...)`,
        value: house.id,
      }));
      setHouseOptions(houses);
    } else {
      setHouseOptions([]);
    }
  }, [houseData]);

  // Convert area data to options
  useEffect(() => {
    if (areaData && areaData.length > 0) {
      const areas = areaData.map((area) => ({
        label: area.name,
        value: area.id,
      }));
      setAreaOptions(areas);
    } else {
      setAreaOptions([]);
    }
  }, [areaData]);

  // Convert vehicle data to options
  useEffect(() => {
    if (vehicleData && vehicleData.length > 0) {
      const vehicles = vehicleData
        .filter((vehicle) => {
          const expireTime = new Date(vehicle.expire_time);
          const now = new Date();
          const isActive = expireTime > now;
          const isInEditData = editData?.vehicle_id?.includes(vehicle.id);
          return isActive || isInEditData;
        })
        .map((vehicle) => ({
          label: `${vehicle.license_plate} (${vehicle.tier})`,
          value: vehicle.id,
          licensePlate: vehicle.license_plate,
        }));

      setVehicleOptions(vehicles);
    } else {
      setVehicleOptions([]);
    }
  }, [vehicleData, editData]);

  // Pre-fill form for editing
  useEffect(() => {
    if (isOpen && editData) {
      const vehicleIds = editData.vehicle_id || [];

      form.setFieldsValue({
        guest_name: editData.guest_name,
        house_id: editData.house_id,
        type: editData.type || "invitation",
        start_time: editData.start_time ? dayjs(editData.start_time) : null,
        expire_time: editData.expire_time ? dayjs(editData.expire_time) : null,
        authorized_area: editData.authorized_area || [],
        vehicle_id: vehicleIds,
        note: editData.note || "",
        active: editData.active,
      });
    } else if (isOpen && !editData) {
      form.resetFields();
      form.setFieldsValue({
        type: "invitation",
        active: true,
      });
    }
  }, [isOpen, editData, form, vehicleOptions]);

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  const handleSubmit = async (values: any) => {
    try {
      const payload: VMSInvitationPayload = {
        guest_name: values.guest_name,
        house_id: values.house_id,
        type: values.type || "invitation",
        start_time: values.start_time
          ? dayjs(values.start_time).toISOString()
          : dayjs().toISOString(),
        expire_time: values.expire_time
          ? dayjs(values.expire_time).toISOString()
          : dayjs().add(30, "days").toISOString(),
        authorized_area: values.authorized_area || [],
        vehicle_id: values.vehicle_id || [], // จะถูกแปลงใน mutation
        note: values.note || "",
        active: values.active !== undefined ? values.active : true,
      };

      if (isEditing && editData) {
        const editPayload: VMSInvitationEditPayload = {
          ...payload,
          id: editData.id,
        };
        await updateMutation.mutateAsync(editPayload);
      } else {
        await createMutation.mutateAsync(payload);
      }

      refetch();
      handleCancel();
    } catch (error) {
      // Error handled by mutations
    }
  };

  return (
    <Modal
      title={isEditing ? "Edit VMS Invitation" : "Create VMS Invitation"}
      open={isOpen}
      onCancel={handleCancel}
      centered
      width="90%"
      style={{ maxWidth: 800 }}
      footer={[
        <div key="footer" style={{ textAlign: "right" }}>
          <SmallButton
            className="saveButton"
            form={form}
            formSubmit={form.submit}
            message={
              isLoading
                ? isEditing
                  ? "Updating..."
                  : "Creating..."
                : isEditing
                ? "Update"
                : "Create"
            }
            disabled={isLoading}
          />
        </div>,
      ]}
      confirmLoading={isLoading}>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          type: "invitation",
          active: true,
        }}>
        <Row gutter={[24, 16]}>
          {/* Left Column */}
          <Col xs={24} md={12}>
            <Form.Item
              label="Guest Name"
              name="guest_name"
              rules={requiredRule}>
              <Input
                size="large"
                placeholder="Enter guest name"
                maxLength={100}
                showCount
              />
            </Form.Item>

            <Form.Item label="House" name="house_id" rules={requiredRule}>
              <Select
                size="large"
                placeholder={
                  loadingHouses || houseLoading
                    ? "Loading houses..."
                    : houseOptions.length === 0
                    ? "No houses available"
                    : "Select house"
                }
                options={houseOptions}
                loading={loadingHouses || houseLoading}
                showSearch
                filterOption={(input, option) =>
                  (option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                notFoundContent={
                  loadingHouses || houseLoading ? (
                    <div style={{ textAlign: "center", padding: "20px" }}>
                      <Spin size="small" />
                      <div style={{ marginTop: "8px" }}>Loading houses...</div>
                    </div>
                  ) : (
                    <div style={{ textAlign: "center", padding: "20px" }}>
                      <div style={{ marginBottom: "8px" }}>🏠</div>
                      <div>No houses found</div>
                    </div>
                  )
                }
              />
            </Form.Item>

            <Form.Item label="Type" name="type">
              <Select
                size="large"
                placeholder="Select type"
                options={[
                  { label: "Invitation", value: "invitation" },
                  { label: "Guest", value: "guest" },
                  { label: "Visitor", value: "visitor" },
                ]}
              />
            </Form.Item>

            <Form.Item label="Authorized Areas" name="authorized_area">
              <Select
                mode="multiple"
                size="large"
                placeholder={
                  loadingAreas || areaLoading
                    ? "Loading areas..."
                    : areaOptions.length === 0
                    ? "No areas available"
                    : "Select authorized areas"
                }
                options={areaOptions}
                loading={loadingAreas || areaLoading}
                showSearch
                filterOption={(input, option) =>
                  (option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                notFoundContent={
                  loadingAreas || areaLoading ? (
                    <div style={{ textAlign: "center", padding: "20px" }}>
                      <Spin size="small" />
                      <div style={{ marginTop: "8px" }}>Loading areas...</div>
                    </div>
                  ) : (
                    <div style={{ textAlign: "center", padding: "20px" }}>
                      <div style={{ marginBottom: "8px" }}>🗺️</div>
                      <div>No areas found</div>
                    </div>
                  )
                }
              />
            </Form.Item>
          </Col>

          {/* Right Column */}
          <Col xs={24} md={12}>
            <Form.Item label="Start Time" name="start_time">
              <DatePicker
                size="large"
                showTime
                format="DD/MM/YYYY HH:mm"
                placeholder="Select start time"
                style={{ width: "100%" }}
              />
            </Form.Item>

            <Form.Item label="Expire Time" name="expire_time">
              <DatePicker
                size="large"
                showTime
                format="DD/MM/YYYY HH:mm"
                placeholder="Select expire time"
                style={{ width: "100%" }}
              />
            </Form.Item>

            <Form.Item label="Vehicle License Plates" name="vehicle_id">
              <Select
                mode="multiple"
                size="large"
                placeholder={
                  loadingVehicles || vehicleLoading
                    ? "Loading vehicles..."
                    : vehicleOptions.length === 0
                    ? "No vehicles available"
                    : "Select vehicle license plates"
                }
                options={vehicleOptions}
                loading={loadingVehicles || vehicleLoading}
                showSearch
                filterOption={(input, option) =>
                  (option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                optionRender={(option) => (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}>
                    <span>{option.data.licensePlate}</span>
                    <Tag size="small" color="blue">
                      {option.data.label.split("(")[1]?.replace(")", "")}
                    </Tag>
                  </div>
                )}
                tagRender={(props) => {
                  const { label, value, closable, onClose } = props;
                  const vehicleInfo = vehicleOptions.find(
                    (v) => v.value === value
                  );
                  const displayLabel = vehicleInfo?.licensePlate || value;

                  return (
                    <Tag
                      color="processing"
                      closable={closable}
                      onClose={onClose}
                      style={{ marginRight: 3 }}>
                      🚗 {displayLabel}
                    </Tag>
                  );
                }}
                notFoundContent={
                  loadingVehicles || vehicleLoading ? (
                    <div style={{ textAlign: "center", padding: "20px" }}>
                      <Spin size="small" />
                      <div style={{ marginTop: "8px" }}>
                        Loading vehicles...
                      </div>
                    </div>
                  ) : (
                    <div style={{ textAlign: "center", padding: "20px" }}>
                      <div style={{ marginBottom: "8px" }}>🚗</div>
                      <div>No vehicles found</div>
                      <div
                        style={{
                          fontSize: "12px",
                          color: "#999",
                          marginTop: "4px",
                        }}>
                        {isEditing
                          ? "Active vehicles + current selection shown"
                          : "Only active vehicles are shown"}
                      </div>
                    </div>
                  )
                }
              />
            </Form.Item>

            <Form.Item label="Note" name="note">
              <Input.TextArea
                rows={3}
                placeholder="Enter note (optional)"
                maxLength={500}
                showCount
              />
            </Form.Item>

            <Form.Item label="Active" name="active" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default VMSInvitationFormModal;
