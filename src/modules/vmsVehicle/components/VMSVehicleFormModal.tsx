import { useState, useEffect, useCallback } from "react";
import { Form, Input, Modal, DatePicker, Select, Row, Col, Spin } from "antd";
import { useSelector, useDispatch } from "react-redux";
import { RootState, Dispatch } from "../../../stores";
import { requiredRule } from "../../../configs/inputRule";
import SmallButton from "../../../components/common/SmallButton";
import {
  VMSVehiclePayload,
  VMSVehicleEditPayload,
  useCreateVMSVehicleMutation,
  useUpdateVMSVehicleMutation,
} from "../../../utils/mutationsGroup/vmsVehicleMutations";
import {
  VehicleRecord,
  VEHICLE_TYPE_OPTIONS,
} from "../../../stores/interfaces/Vehicle";
import {
  getProvinceOptions,
  searchProvinces,
  getProvinceName,
} from "../../../utils/constants/thaiProvinces";
import {
  VEHICLE_COLOR_OPTIONS,
  VEHICLE_BRAND_OPTIONS,
  getVehicleColorOptions,
  getVehicleBrandOptions,
  searchVehicleBrands,
} from "../../../utils/constants/thaiVehicleOptions";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";

interface VMSVehicleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editData?: VehicleRecord | null;
  refetch: () => void;
}

const VMSVehicleFormModal = ({
  isOpen,
  onClose,
  editData,
  refetch,
}: VMSVehicleFormModalProps) => {
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
  const [brandOptions, setBrandOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [colorOptions, setColorOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [loadingData, setLoadingData] = useState(false);
  const [startTime, setStartTime] = useState<Dayjs | null>(null);
  const [expireTime, setExpireTime] = useState<Dayjs | null>(null);

  // Get data from state
  const { tableData: houseData, loading: houseLoading } = useSelector(
    (state: RootState) => state.house
  );
  const { tableData: areaData, loading: areaLoading } = useSelector(
    (state: RootState) => state.area
  );

  // Mutations
  const createMutation = useCreateVMSVehicleMutation();
  const updateMutation = useUpdateVMSVehicleMutation();

  const isEditing = !!editData;
  const isLoading = createMutation.isPending || updateMutation.isPending;

  // Get current date/time for restrictions
  const now = dayjs();
  const today = now.startOf("day");

  // Disable past dates for date picker
  const disabledDate = (current: Dayjs) => {
    return current && current.isBefore(today);
  };

  // Disable past hours and minutes for start time
  const disabledStartTime = (current: Dayjs | null) => {
    if (!current) return {};

    const isToday = current.isSame(today, "day");
    if (!isToday) return {};

    const currentHour = now.hour();
    const currentMinute = now.minute();

    return {
      disabledHours: () => {
        const hours = [];
        for (let i = 0; i < currentHour; i++) {
          hours.push(i);
        }
        return hours;
      },
      disabledMinutes: (selectedHour: number) => {
        if (selectedHour === currentHour) {
          const minutes = [];
          for (let i = 0; i <= currentMinute; i++) {
            minutes.push(i);
          }
          return minutes;
        }
        return [];
      },
    };
  };

  // Disable past times and ensure expire time is after start time (only on same day)
  const disabledExpireTime = (current: Dayjs | null) => {
    if (!current) return {};

    const isToday = current.isSame(today, "day");

    // Only disable hours/minutes if:
    // 1. It's today AND no start time selected (prevent selecting past time)
    // 2. It's the same day as start time (prevent selecting time before start time)

    let disabledHours: number[] = [];
    let disabledMinutes = (selectedHour: number) => [] as number[];

    // Case 1: If it's today and no start time, disable past hours/minutes
    if (isToday && !startTime) {
      const currentHour = now.hour();
      const currentMinute = now.minute();

      for (let i = 0; i < currentHour; i++) {
        disabledHours.push(i);
      }

      disabledMinutes = (selectedHour: number) => {
        if (selectedHour === currentHour) {
          const minutes = [];
          for (let i = 0; i <= currentMinute; i++) {
            minutes.push(i);
          }
          return minutes;
        }
        return [];
      };
    }
    // Case 2: If it's today and has start time on the same day
    else if (isToday && startTime && current.isSame(startTime, "day")) {
      const currentHour = now.hour();
      const currentMinute = now.minute();
      const startHour = startTime.hour();
      const startMinute = startTime.minute();

      // Disable past hours and hours up to start time
      const maxDisabledHour = Math.max(currentHour - 1, startHour);
      for (let i = 0; i <= maxDisabledHour; i++) {
        disabledHours.push(i);
      }

      disabledMinutes = (selectedHour: number) => {
        const minutes: number[] = [];

        // If selecting current hour, disable past minutes
        if (selectedHour === currentHour) {
          for (let i = 0; i <= currentMinute; i++) {
            minutes.push(i);
          }
        }

        // If selecting start hour, disable minutes up to start time
        if (selectedHour === startHour) {
          for (let i = 0; i <= startMinute; i++) {
            minutes.push(i);
          }
        }

        return [...new Set(minutes)];
      };
    }
    // Case 3: Not today but same day as start time
    else if (startTime && current.isSame(startTime, "day") && !isToday) {
      const startHour = startTime.hour();
      const startMinute = startTime.minute();

      // Only disable hours up to start time
      for (let i = 0; i <= startHour; i++) {
        disabledHours.push(i);
      }

      disabledMinutes = (selectedHour: number) => {
        if (selectedHour === startHour) {
          const minutes = [];
          for (let i = 0; i <= startMinute; i++) {
            minutes.push(i);
          }
          return minutes;
        }
        return [];
      };
    }

    return {
      disabledHours: () => disabledHours,
      disabledMinutes,
    };
  };

  // Handle start time change
  const handleStartTimeChange = (value: Dayjs | null) => {
    setStartTime(value);
    form.setFieldValue("start_time", value);

    // Trigger validation for expire_time when start_time changes
    if (expireTime) {
      form.validateFields(["expire_time"]);
    }

    // Only clear expire time if it's invalid (before or equal to start time)
    // regardless of whether it's the same day or different days
    if (value && expireTime && expireTime.isSameOrBefore(value)) {
      setExpireTime(null);
      form.setFieldValue("expire_time", null);
    }
  };

  // Handle expire time change
  const handleExpireTimeChange = (value: Dayjs | null) => {
    setExpireTime(value);
    form.setFieldValue("expire_time", value);
  };

  // Custom validation rules for times
  const startTimeRules = [
    {
      validator: (_: any, value: Dayjs | null) => {
        if (!value) return Promise.resolve();

        // Check if start time is not in the past
        if (value.isBefore(now)) {
          return Promise.reject(new Error("Start time cannot be in the past"));
        }

        return Promise.resolve();
      },
    },
  ];

  const expireTimeRules = [
    {
      validator: (_: any, value: Dayjs | null) => {
        if (!value) return Promise.resolve();

        // Check if expire time is not in the past
        if (value.isBefore(now)) {
          return Promise.reject(new Error("Expire time cannot be in the past"));
        }

        // Check if expire time is after start time (regardless of date)
        if (startTime && !value.isAfter(startTime)) {
          return Promise.reject(
            new Error("Expire time must be after start time")
          );
        }

        return Promise.resolve();
      },
    },
  ];

  // Load options
  useEffect(() => {
    console.log("📍 Loading vehicle options...");

    // Load provinces
    const provinces = getProvinceOptions();
    setProvinceOptions(provinces);

    // Load vehicle brands
    const brands = getVehicleBrandOptions();
    setBrandOptions(brands);

    // Load vehicle colors
    const colors = getVehicleColorOptions();
    setColorOptions(colors);
  }, []);

  // Load data when modal opens
  const loadData = useCallback(async () => {
    if (!isOpen) return;

    setLoadingData(true);
    try {
      console.log("📊 Loading form data for vehicle...");

      if (!houseData || houseData.length === 0) {
        await dispatch.house.getHouseList({
          page: 1,
          perPage: 1000,
          silent: true,
        });
      }

      if (!areaData || areaData.length === 0) {
        await dispatch.area.getAreaList({
          page: 1,
          perPage: 1000,
          silent: true,
        });
      }

      console.log("✅ Vehicle form data loaded");
    } catch (error) {
      console.error("❌ Error loading vehicle form data:", error);
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
      console.log("✏️ Pre-filling form for vehicle edit:", editData);

      const editStartTime = editData.start_time
        ? dayjs(editData.start_time)
        : null;
      const editExpireTime = editData.expire_time
        ? dayjs(editData.expire_time)
        : null;

      setStartTime(editStartTime);
      setExpireTime(editExpireTime);

      form.setFieldsValue({
        license_plate: editData.license_plate,
        area_code: editData.area_code || "th-11",
        vehicle_color: editData.vehicle_color || "",
        vehicle_brand: editData.vehicle_brand || "",
        vehicle_type: editData.vehicle_type || "car",
        house_id: editData.house_id,
        tier: editData.tier || "staff",
        start_time: editStartTime,
        expire_time: editExpireTime,
        authorized_area: editData.authorized_area || [],
        note: editData.note || "",
      });
    } else if (isOpen && !editData) {
      console.log("➕ Resetting form for new vehicle creation");

      form.resetFields();
      form.setFieldsValue({
        tier: "staff",
        area_code: "th-11", // default to Samut Prakan
        vehicle_type: "car", // default to car
      });
      setStartTime(null);
      setExpireTime(null);
    }
  }, [isOpen, editData, form]);

  const handleCancel = useCallback(() => {
    console.log("❌ Vehicle form cancelled");
    form.resetFields();
    setStartTime(null);
    setExpireTime(null);
    onClose();
  }, [form, onClose]);

  // Function for searching provinces
  const handleProvinceSearch = (searchText: string) => {
    if (!searchText) {
      setProvinceOptions(getProvinceOptions());
    } else {
      const filtered = searchProvinces(searchText);
      setProvinceOptions(filtered);
    }
  };

  // Function for searching brands
  const handleBrandSearch = (searchText: string) => {
    if (!searchText) {
      setBrandOptions(getVehicleBrandOptions());
    } else {
      const filtered = searchVehicleBrands(searchText);
      setBrandOptions(filtered);
    }
  };

  const handleSubmit = useCallback(
    async (values: any) => {
      if (isLoading) {
        console.warn("⚠️ Already submitting vehicle, ignoring...");
        return;
      }

      try {
        console.log("📝 Vehicle form submitted with values:", values);

        const payload: VMSVehiclePayload = {
          license_plate: values.license_plate,
          area_code: values.area_code || "th-11",
          vehicle_color: values.vehicle_color || "",
          vehicle_brand: values.vehicle_brand || "",
          vehicle_type: values.vehicle_type || "car",
          house_id: values.house_id,
          tier: values.tier || "staff",
          start_time: values.start_time
            ? dayjs(values.start_time).toISOString()
            : dayjs().toISOString(),
          expire_time: values.expire_time
            ? dayjs(values.expire_time).toISOString()
            : dayjs().add(30, "days").toISOString(),
          authorized_area: values.authorized_area || [],
          note: values.note || "",
        };

        console.log(
          "📤 Submitting vehicle payload:",
          JSON.stringify(payload, null, 2)
        );

        if (isEditing && editData) {
          const editPayload: VMSVehicleEditPayload = {
            ...payload,
            id: editData.id,
          };

          console.log("✏️ Updating vehicle...");
          await updateMutation.mutateAsync(editPayload);
        } else {
          console.log("➕ Creating new vehicle...");
          await createMutation.mutateAsync(payload);
        }

        console.log("✅ Vehicle form submission successful");
        refetch();
        handleCancel();
      } catch (error: any) {
        console.error("❌ Vehicle form submission error:", error);
      }
    },
    [
      isLoading,
      isEditing,
      editData,
      createMutation,
      updateMutation,
      refetch,
      handleCancel,
    ]
  );

  return (
    <Modal
      title={isEditing ? "Edit VMS Vehicle" : "Add VMS Vehicle"}
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
          tier: "staff",
          area_code: "th-11",
          vehicle_type: "car",
        }}>
        <Row gutter={[24, 16]}>
          {/* Left Column */}
          <Col xs={24} md={12}>
            <Form.Item
              label="License Plate"
              name="license_plate"
              rules={requiredRule}>
              <Input
                size="large"
                placeholder="Enter vehicle license plate"
                maxLength={20}
                showCount
              />
            </Form.Item>

            <Form.Item label="County" name="area_code" rules={requiredRule}>
              <Select
                size="large"
                placeholder="Select county"
                options={provinceOptions}
                showSearch
                filterOption={false}
                onSearch={handleProvinceSearch}
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
                tagRender={(props) => {
                  const { value, onClose } = props;
                  const provinceName = getProvinceName(value);

                  return (
                    <span
                      style={{
                        background: "#e6f7ff",
                        border: "1px solid #91d5ff",
                        borderRadius: "6px",
                        padding: "2px 8px",
                        margin: "2px",
                        fontSize: "12px",
                        color: "#0050b3",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                      }}>
                      {provinceName}
                      <span
                        onClick={onClose}
                        style={{
                          cursor: "pointer",
                          fontSize: "14px",
                          lineHeight: 1,
                        }}>
                        ×
                      </span>
                    </span>
                  );
                }}
                notFoundContent={
                  <div style={{ textAlign: "center", padding: "20px" }}>
                    <div style={{ marginBottom: "8px" }}>🗾</div>
                    <div>No provinces found</div>
                  </div>
                }
              />
            </Form.Item>

            <Form.Item label="Vehicle Brand" name="vehicle_brand">
              <Select
                size="large"
                placeholder="Select vehicle brand"
                options={brandOptions}
                allowClear
                showSearch
                filterOption={false}
                onSearch={handleBrandSearch}
                notFoundContent={
                  <div style={{ textAlign: "center", padding: "20px" }}>
                    <div style={{ marginBottom: "8px" }}>🚗</div>
                    <div>No brands found</div>
                  </div>
                }
              />
            </Form.Item>

            <Form.Item label="Vehicle Color" name="vehicle_color">
              <Select
                size="large"
                placeholder="Select vehicle color"
                options={colorOptions}
                allowClear
                showSearch
                filterOption={(input, option) =>
                  (option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
              />
            </Form.Item>

            <Form.Item label="Vehicle Type" name="vehicle_type">
              <Select
                size="large"
                placeholder="Select vehicle type"
                options={VEHICLE_TYPE_OPTIONS}
              />
            </Form.Item>

            <Form.Item label="House" name="house_id" rules={requiredRule}>
              <Select
                size="large"
                placeholder={
                  loadingData || houseLoading
                    ? "Loading houses..."
                    : houseOptions.length === 0
                    ? "No available houses"
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

            <Form.Item label="Type" name="tier" rules={requiredRule}>
              <Select
                size="large"
                placeholder="Select type"
                options={[
                  { label: "Staff", value: "staff" },
                  { label: "Resident", value: "resident" },
                  {
                    label: "Invited Visitor",
                    value: "invited visitor",
                  },
                ]}
              />
            </Form.Item>
          </Col>

          {/* Right Column */}
          <Col xs={24} md={12}>
            <Form.Item
              label="Start Time"
              name="start_time"
              rules={startTimeRules}>
              <DatePicker
                size="large"
                showTime
                format="DD/MM/YYYY HH:mm"
                placeholder="Select start time"
                style={{ width: "100%" }}
                disabledDate={disabledDate}
                disabledTime={disabledStartTime}
                onChange={handleStartTimeChange}
                showNow={false}
              />
            </Form.Item>

            <Form.Item
              label="Expiry Time"
              name="expire_time"
              rules={expireTimeRules}>
              <DatePicker
                size="large"
                showTime
                format="DD/MM/YYYY HH:mm"
                placeholder="Select expiry time"
                style={{ width: "100%" }}
                disabledDate={disabledDate}
                disabledTime={disabledExpireTime}
                onChange={handleExpireTimeChange}
                showNow={false}
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
                    ? "No available areas"
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

        {/* Time Selection Helper Text */}
        {/* <Row>
          <Col xs={24}>
            <div
              style={{
                fontSize: "12px",
                color: "#666",
                background: "#f6f8fa",
                padding: "12px",
                borderRadius: "6px",
                marginBottom: "16px",
                border: "1px solid #e1e8ed",
              }}>
              <div style={{ marginBottom: "4px" }}>
                <strong>📅 Time Selection Rules:</strong>
              </div>
              <div>• Start time and expire time cannot be in the past</div>
              <div>• Expire time must be after start time</div>
              <div>
                • If both times are on the same day, expire time must be later
                than start time
              </div>
              {startTime && (
                <div style={{ marginTop: "8px", color: "#1890ff" }}>
                  <strong>Selected Start:</strong>{" "}
                  {startTime.format("DD/MM/YYYY HH:mm")}
                  {expireTime && (
                    <>
                      <br />
                      <strong>Selected Expire:</strong>{" "}
                      {expireTime.format("DD/MM/YYYY HH:mm")}
                      <br />
                      <strong>Duration:</strong>{" "}
                      {expireTime.diff(startTime, "hour", true).toFixed(1)}{" "}
                      hours
                    </>
                  )}
                </div>
              )}
            </div>
          </Col>
        </Row> */}

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
              {isEditing ? "Updating vehicle..." : "Creating vehicle..."}
              Please wait...
            </span>
          </div>
        )}
      </Form>
    </Modal>
  );
};

export default VMSVehicleFormModal;
