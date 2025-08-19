// ไฟล์: src/modules/vmsInvitation/components/VMSInvitationFormModal.tsx - Debug Version

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
import { vmsMappingService } from "../../../utils/services/vmsMappingService";
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
  const [loadingHouses, setLoadingHouses] = useState(false);
  const [loadingAreas, setLoadingAreas] = useState(false);

  // Get house and area data from state
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

  // Debug effect for house data
  useEffect(() => {
    console.log("🔍 Form Modal Debug Info:", {
      isOpen,
      houseData: {
        exists: !!houseData,
        length: houseData?.length || 0,
        sample: houseData?.[0] || "No data",
        loading: houseLoading,
      },
      areaData: {
        exists: !!areaData,
        length: areaData?.length || 0,
        sample: areaData?.[0] || "No data",
        loading: areaLoading,
      },
      houseOptions: {
        length: houseOptions.length,
        sample: houseOptions[0] || "No options",
      },
      areaOptions: {
        length: areaOptions.length,
        sample: areaOptions[0] || "No options",
      },
    });
  }, [
    isOpen,
    houseData,
    areaData,
    houseOptions,
    areaOptions,
    houseLoading,
    areaLoading,
  ]);

  // Load house and area data when modal opens
  useEffect(() => {
    const loadData = async () => {
      if (!isOpen) return;

      console.log("🔄 Modal opened, loading data...");

      try {
        // Load house data
        setLoadingHouses(true);
        console.log("📍 Current house data:", {
          length: houseData?.length || 0,
          sample: houseData?.[0],
        });

        if (!houseData || houseData.length === 0) {
          console.log("🏠 Loading house data...");
          await dispatch.house.getHouseList({ page: 1, perPage: 500 });
        }

        // Load area data
        setLoadingAreas(true);
        console.log("📍 Current area data:", {
          length: areaData?.length || 0,
          sample: areaData?.[0],
        });

        if (!areaData || areaData.length === 0) {
          console.log("🗺️ Loading area data...");
          await dispatch.area.getAreaList({ page: 1, perPage: 500 });
        }
      } catch (error) {
        console.error("❌ Error loading data:", error);
      } finally {
        setLoadingHouses(false);
        setLoadingAreas(false);
      }
    };

    loadData();
  }, [isOpen, dispatch, houseData, areaData]);

  // Convert data to options when data changes
  useEffect(() => {
    console.log("🔄 Converting house data to options...");

    if (houseData && houseData.length > 0) {
      const houses = houseData.map((house) => ({
        label: `${house.address} (${house.id.substring(0, 8)}...)`,
        value: house.id,
      }));

      console.log("🏠 House options created:", {
        count: houses.length,
        sample: houses[0],
      });

      setHouseOptions(houses);
    } else {
      console.log("⚠️ No house data available");
      setHouseOptions([]);
    }
  }, [houseData]);

  useEffect(() => {
    console.log("🔄 Converting area data to options...");

    if (areaData && areaData.length > 0) {
      const areas = areaData.map((area) => ({
        label: area.name,
        value: area.id,
      }));

      console.log("🗺️ Area options created:", {
        count: areas.length,
        sample: areas[0],
      });

      setAreaOptions(areas);
    } else {
      console.log("⚠️ No area data available");
      setAreaOptions([]);
    }
  }, [areaData]);

  // Pre-fill form for editing
  useEffect(() => {
    if (isOpen && editData) {
      console.log("✏️ Pre-filling form for editing:", editData);

      form.setFieldsValue({
        guest_name: editData.guest_name,
        house_id: editData.house_id,
        type: editData.type || "invitation",
        start_time: editData.start_time ? dayjs(editData.start_time) : null,
        expire_time: editData.expire_time ? dayjs(editData.expire_time) : null,
        authorized_area: editData.authorized_area || [],
        vehicle_id: editData.vehicle_id || [],
        note: editData.note || "",
        active: editData.active,
      });
    } else if (isOpen && !editData) {
      console.log("🆕 Resetting form for new entry");
      // Reset form for creating
      form.resetFields();
      form.setFieldsValue({
        type: "invitation",
        active: true,
      });
    }
  }, [isOpen, editData, form]);

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  const handleSubmit = async (values: any) => {
    try {
      console.log("📤 Submitting form values:", values);

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
        vehicle_id: values.vehicle_id || [],
        note: values.note || "",
        active: values.active !== undefined ? values.active : true,
      };

      console.log("🔄 Final payload:", payload);

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
      console.error("❌ Form submission error:", error);
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
                      <div
                        style={{
                          fontSize: "12px",
                          color: "#999",
                          marginTop: "4px",
                        }}>
                        Try refreshing or check VMS connection
                      </div>
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

            <Form.Item label="Vehicle IDs" name="vehicle_id">
              <Select
                mode="tags"
                size="large"
                placeholder="Enter vehicle IDs"
                tokenSeparators={[","]}
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

        {/* Debug Info (only in development) */}
        {process.env.NODE_ENV === "development" && (
          <div
            style={{
              background: "#f5f5f5",
              padding: "10px",
              borderRadius: "4px",
              fontSize: "12px",
              marginTop: "16px",
            }}>
            <strong>Debug Info:</strong>
            <br />
            Houses: {houseOptions.length} options | Loading:{" "}
            {loadingHouses || houseLoading ? "Yes" : "No"}
            <br />
            Areas: {areaOptions.length} options | Loading:{" "}
            {loadingAreas || areaLoading ? "Yes" : "No"}
          </div>
        )}
      </Form>
    </Modal>
  );
};

export default VMSInvitationFormModal;
