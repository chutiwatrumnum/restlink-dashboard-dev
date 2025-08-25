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
import { VehicleRecord } from "../../../stores/interfaces/Vehicle";
import {
  getProvinceOptions,
  searchProvinces,
  getProvinceName,
} from "../../../utils/constants/thaiProvinces";
import dayjs from "dayjs";

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
  const [loadingData, setLoadingData] = useState(false);

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
      console.log("📊 Loading form data for vehicle...");

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

      form.setFieldsValue({
        license_plate: editData.license_plate,
        area_code: editData.area_code || "th-11",
        house_id: editData.house_id,
        tier: editData.tier || "staff",
        start_time: editData.start_time ? dayjs(editData.start_time) : null,
        expire_time: editData.expire_time ? dayjs(editData.expire_time) : null,
        authorized_area: editData.authorized_area || [],
        note: editData.note || "",
      });
    } else if (isOpen && !editData) {
      console.log("➕ Resetting form for new vehicle creation");

      form.resetFields();
      form.setFieldsValue({
        tier: "staff",
        area_code: "th-11", // default to Samut Prakan
      });
    }
  }, [isOpen, editData, form]);

  const handleCancel = useCallback(() => {
    console.log("❌ Vehicle form cancelled");
    form.resetFields();
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
      style={{ maxWidth: 800 }}
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

            <Form.Item label="Province" name="area_code" rules={requiredRule}>
              <Select
                size="large"
                placeholder="Select province"
                options={provinceOptions}
                showSearch
                filterOption={false} // Use custom search
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
                // Display province name in selected tag
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
            <Form.Item label="Start Time" name="start_time">
              <DatePicker
                size="large"
                showTime
                format="DD/MM/YYYY HH:mm"
                placeholder="Select start time"
                style={{ width: "100%" }}
              />
            </Form.Item>

            <Form.Item label="Expiry Time" name="expire_time">
              <DatePicker
                size="large"
                showTime
                format="DD/MM/YYYY HH:mm"
                placeholder="Select expiry time"
                style={{ width: "100%" }}
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
