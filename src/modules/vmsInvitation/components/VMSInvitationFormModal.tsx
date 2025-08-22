// ไฟล์: src/modules/vmsInvitation/components/VMSInvitationFormModal.tsx - Updated Version with License Plate Input

import { useState, useEffect, useCallback } from "react";
import {
  Form,
  Input,
  Modal,
  DatePicker,
  Select,
  Row,
  Col,
  Tag,
  Spin,
  Button,
  Space,
} from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
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
import {
  getProvinceOptions,
  searchProvinces,
  getProvinceName,
} from "../../../utils/constants/thaiProvinces";
import dayjs from "dayjs";

interface VMSInvitationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editData?: InvitationRecord | null;
  refetch: () => void;
}

interface VehicleInput {
  license_plate: string;
  area_code: string;
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
  const [provinceOptions, setProvinceOptions] = useState<
    { label: string; value: string; name: string; code: string }[]
  >([]);
  const [loadingData, setLoadingData] = useState(false);

  // State สำหรับ vehicles input
  const [vehicles, setVehicles] = useState<VehicleInput[]>([]);

  // Get data from state
  const { tableData: houseData, loading: houseLoading } = useSelector(
    (state: RootState) => state.house
  );
  const { tableData: areaData, loading: areaLoading } = useSelector(
    (state: RootState) => state.area
  );

  // Mutations
  const createMutation = useCreateVMSInvitationMutation();
  const updateMutation = useUpdateVMSInvitationMutation();

  const isEditing = !!editData;
  const isLoading = createMutation.isPending || updateMutation.isPending;

  // Load province options
  useEffect(() => {
    console.log("📍 Loading Thai provinces...");
    const provinces = getProvinceOptions();
    setProvinceOptions(provinces);
  }, []);

  // Load data when modal opens
  const loadData = useCallback(async () => {
    if (!isOpen) return;

    setLoadingData(true);
    try {
      console.log("📊 Loading form data...");

      if (!houseData || houseData.length === 0) {
        await dispatch.house.getHouseList({
          page: 1,
          perPage: 500,
          silent: true,
        });
      }

      if (!areaData || areaData.length === 0) {
        await dispatch.area.getAreaList({
          page: 1,
          perPage: 500,
          silent: true,
        });
      }

      console.log("✅ Form data loaded");
    } catch (error) {
      console.error("❌ Error loading form data:", error);
    } finally {
      setLoadingData(false);
    }
  }, [isOpen, dispatch, houseData, areaData]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Convert house data to options
  useEffect(() => {
    if (houseData && houseData.length > 0) {
      const houses = houseData.map((house) => ({
        label: `${house.address} (${house.id.substring(0, 8)}...)`,
        value: house.id,
      }));
      setHouseOptions(houses);
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
    }
  }, [areaData]);

  // Pre-fill form for editing
  useEffect(() => {
    if (isOpen && editData) {
      console.log("✏️ Pre-filling form for edit:", editData);

      form.setFieldsValue({
        guest_name: editData.guest_name,
        house_id: editData.house_id,
        type: editData.type || "invitation",
        start_time: editData.start_time ? dayjs(editData.start_time) : null,
        expire_time: editData.expire_time ? dayjs(editData.expire_time) : null,
        authorized_area: editData.authorized_area || [],
        note: editData.note || "",
      });

      // แปลง vehicle_id เป็น vehicles array (ถ้ามี)
      if (editData.vehicle_id && editData.vehicle_id.length > 0) {
        // สำหรับการแก้ไข ถ้า vehicle_id เป็น license plates แล้วให้ใช้ตรงๆ
        // ถ้าเป็น vehicle IDs ให้ต้องแปลงเป็น license plates
        const vehicleInputs = editData.vehicle_id.map((licensePlateOrId) => ({
          license_plate: licensePlateOrId, // สมมติว่าเป็น license plate
          area_code: "th-11", // default value
        }));
        setVehicles(vehicleInputs);
        console.log("✏️ Pre-filled vehicles:", vehicleInputs);
      } else {
        setVehicles([]);
      }
    } else if (isOpen && !editData) {
      console.log("➕ Resetting form for new creation");

      form.resetFields();
      form.setFieldsValue({
        type: "invitation",
      });
      setVehicles([]);
    }
  }, [isOpen, editData, form]);

  const handleCancel = useCallback(() => {
    console.log("❌ Form cancelled");
    form.resetFields();
    setVehicles([]);
    onClose();
  }, [form, onClose]);

  // Vehicle management functions
  const addVehicle = () => {
    if (vehicles.length < 5) {
      setVehicles([...vehicles, { license_plate: "", area_code: "th-11" }]);
    }
  };

  const removeVehicle = (index: number) => {
    const newVehicles = vehicles.filter((_, i) => i !== index);
    setVehicles(newVehicles);
  };

  const updateVehicle = (
    index: number,
    field: keyof VehicleInput,
    value: string
  ) => {
    const newVehicles = [...vehicles];
    newVehicles[index] = { ...newVehicles[index], [field]: value };
    setVehicles(newVehicles);
  };

  const handleProvinceSearch = (searchText: string, index: number) => {
    if (!searchText) {
      setProvinceOptions(getProvinceOptions());
    } else {
      const filtered = searchProvinces(searchText);
      setProvinceOptions(filtered);
    }
  };

  const handleSubmit = useCallback(
    async (values: any) => {
      if (isLoading) {
        console.warn("⚠️ Already submitting, ignoring...");
        return;
      }

      try {
        console.log("📝 Form submitted with values:", values);
        console.log("🚗 Vehicles:", vehicles);

        // กรอง vehicles ที่มี license_plate และสร้าง vehicles array ตาม API spec
        const validVehicles = vehicles
          .filter((v) => v.license_plate && v.license_plate.trim())
          .map((v) => ({
            license_plate: v.license_plate.trim(),
            area_code: v.area_code || "th-11",
          }));

        console.log("✅ Valid vehicles for API:", validVehicles);

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
          note: values.note || "",
        };

        // เพิ่ม vehicles เฉพาะเมื่อมีข้อมูล
        if (validVehicles.length > 0) {
          payload.vehicles = validVehicles;
        }

        console.log(
          "📤 Final payload for API:",
          JSON.stringify(payload, null, 2)
        );

        if (isEditing && editData) {
          const editPayload: VMSInvitationEditPayload = {
            ...payload,
            id: editData.id,
          };

          console.log("✏️ Updating invitation...");
          await updateMutation.mutateAsync(editPayload);
        } else {
          console.log("➕ Creating new invitation...");
          await createMutation.mutateAsync(payload);
        }

        console.log("✅ Form submission successful");
        refetch();
        handleCancel();
      } catch (error: any) {
        console.error("❌ Form submission error:", error);
      }
    },
    [
      isLoading,
      isEditing,
      editData,
      vehicles,
      createMutation,
      updateMutation,
      refetch,
      handleCancel,
    ]
  );

  return (
    <Modal
      title={isEditing ? "Edit VMS Invitation" : "Create VMS Invitation"}
      open={isOpen}
      onCancel={handleCancel}
      centered
      width="90%"
      style={{ maxWidth: 900 }}
      footer={[
        <div key="footer" style={{ textAlign: "right" }}>
          <SmallButton
            className="saveButton"
            form={form}
            formSubmit={() => form.submit()}
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
      confirmLoading={isLoading}
      maskClosable={!isLoading}
      closable={!isLoading}
      destroyOnClose={true}>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        disabled={isLoading}
        initialValues={{
          type: "invitation",
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
                  loadingData || houseLoading
                    ? "Loading houses..."
                    : houseOptions.length === 0
                    ? "No houses available"
                    : "Select house"
                }
                options={houseOptions}
                loading={loadingData || houseLoading}
                showSearch
                filterOption={(input, option) =>
                  (option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                notFoundContent={
                  loadingData || houseLoading ? (
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
                  { label: "Vehicle", value: "vehicle" },
                ]}
              />
            </Form.Item>

            <Form.Item label="Authorized Areas" name="authorized_area">
              <Select
                mode="multiple"
                size="large"
                placeholder={
                  loadingData || areaLoading
                    ? "Loading areas..."
                    : areaOptions.length === 0
                    ? "No areas available"
                    : "Select authorized areas"
                }
                options={areaOptions}
                loading={loadingData || areaLoading}
                showSearch
                filterOption={(input, option) =>
                  (option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                notFoundContent={
                  loadingData || areaLoading ? (
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

            <Form.Item label="Note" name="note">
              <Input.TextArea
                rows={3}
                placeholder="Enter note (optional)"
                maxLength={500}
                showCount
              />
            </Form.Item>
          </Col>
        </Row>

        {/* Vehicle License Plates Section */}
        <Row>
          <Col xs={24}>
            <div style={{ marginBottom: 16 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 12,
                }}>
                <label style={{ fontWeight: 500, color: "#262626" }}>
                  Vehicle License Plates
                </label>
                <Button
                  type="dashed"
                  icon={<PlusOutlined />}
                  onClick={addVehicle}
                  size="small"
                  disabled={isLoading || vehicles.length >= 5}>
                  Add Vehicle {vehicles.length > 0 && `(${vehicles.length}/5)`}
                </Button>
              </div>

              {vehicles.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "20px",
                    border: "1px dashed #d9d9d9",
                    borderRadius: "6px",
                    color: "#999",
                    background: "#fafafa",
                  }}>
                  <div style={{ marginBottom: "8px" }}>🚗</div>
                  <div>No vehicles added</div>
                  <div style={{ fontSize: "12px", marginTop: "4px" }}>
                    Click "Add Vehicle" to add license plates
                  </div>
                </div>
              ) : (
                <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                  {vehicles.map((vehicle, index) => (
                    <div
                      key={index}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 8,
                        padding: "12px",
                        border: "1px solid #f0f0f0",
                        borderRadius: "6px",
                        background: "#fafafa",
                      }}>
                      {/* License Plate Input */}
                      <div style={{ flex: 2 }}>
                        <Input
                          placeholder="ป้ายทะเบียน"
                          value={vehicle.license_plate}
                          onChange={(e) =>
                            updateVehicle(
                              index,
                              "license_plate",
                              e.target.value
                            )
                          }
                          maxLength={20}
                          disabled={isLoading}
                        />
                      </div>

                      {/* Province Select */}
                      <div style={{ flex: 3 }}>
                        <Select
                          placeholder="เลือกจังหวัด"
                          value={vehicle.area_code}
                          onChange={(value) =>
                            updateVehicle(index, "area_code", value)
                          }
                          options={provinceOptions}
                          showSearch
                          filterOption={false}
                          onSearch={(text) => handleProvinceSearch(text, index)}
                          optionRender={(option) => (
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                              }}>
                              <span>{option.data.name}</span>
                              <span style={{ color: "#999", fontSize: "12px" }}>
                                {option.data.code}
                              </span>
                            </div>
                          )}
                          disabled={isLoading}
                          style={{ width: "100%" }}
                        />
                      </div>

                      {/* Delete Button */}
                      <Button
                        type="text"
                        icon={<DeleteOutlined />}
                        onClick={() => removeVehicle(index)}
                        disabled={isLoading}
                        style={{ color: "#ff4d4f" }}
                        title="Remove vehicle"
                      />
                    </div>
                  ))}
                </div>
              )}

              {vehicles.length > 0 && (
                <div
                  style={{
                    fontSize: "12px",
                    color: "#666",
                    marginTop: "8px",
                    padding: "8px 12px",
                    background: "#f0f9ff",
                    border: "1px solid #bae6fd",
                    borderRadius: "4px",
                  }}>
                  <strong>ข้อมูลรถยนต์:</strong> {vehicles.length}/5 คัน •{" "}
                  <strong>ป้ายทะเบียนที่กรอก:</strong>{" "}
                  {
                    vehicles.filter(
                      (v) => v.license_plate && v.license_plate.trim()
                    ).length
                  }{" "}
                  ป้าย
                  {vehicles.length >= 5 && (
                    <span style={{ color: "#faad14", marginLeft: "8px" }}>
                      • ถึงจำนวนสูงสุดแล้ว
                    </span>
                  )}
                  <div
                    style={{
                      marginTop: "4px",
                      fontSize: "11px",
                      color: "#0369a1",
                    }}>
                    📋 ข้อมูลที่จะส่งไป API:{" "}
                    {JSON.stringify(
                      vehicles
                        .filter(
                          (v) => v.license_plate && v.license_plate.trim()
                        )
                        .map((v) => ({
                          license_plate: v.license_plate.trim(),
                          area_code: v.area_code,
                        })),
                      null,
                      1
                    )}
                  </div>
                </div>
              )}
            </div>
          </Col>
        </Row>

        {/* Loading indicator */}
        {isLoading && (
          <div
            style={{
              textAlign: "center",
              padding: "16px",
              background: "#f0f9ff",
              border: "1px solid #bae6fd",
              borderRadius: "6px",
              marginTop: "16px",
            }}>
            <Spin size="small" style={{ marginRight: "8px" }} />
            <span style={{ color: "#0369a1" }}>
              {isEditing ? "Updating invitation..." : "Creating invitation..."}
              Please wait...
            </span>
          </div>
        )}
      </Form>
    </Modal>
  );
};

export default VMSInvitationFormModal;
