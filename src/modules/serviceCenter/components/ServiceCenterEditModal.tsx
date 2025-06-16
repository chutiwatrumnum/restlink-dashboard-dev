"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Form,
  Input,
  DatePicker,
  TimePicker,
  type UploadFile,
  Steps,
  Collapse,
  Button,
  Alert,
  Tooltip,
  Image,
  message,
  Card,
  Space,
  Row,
  Col,
} from "antd";
import {
  InfoCircleOutlined,
  DeleteOutlined,
  PlusOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { requiredRule } from "../../../configs/inputRule";
import dayjs from "dayjs";
import ServiceImageGallery from "./serviceCenterImage";
import FormModal from "../../../components/common/FormModal";
import ConfirmModal from "../../../components/common/ConfirmModal";
import type {
  EditDataServiceCenter,
  ImageItem,
  ServiceCenterDataType,
  ServiceCenterSelectListType,
  AppointmentSlotState,
  FormattedAppointmentData,
} from "../../../stores/interfaces/ServiceCenter";
import {
  editServiceCenterQuery,
  reshuduleServiceCenterQuery,
} from "../hooks/serviceCenterMutation";
import "../styles/serviceCenterEditModal.css";
import NoImage from "../../../assets/images/noImg.jpeg";
import {
  useServiceCenterByServiceIDQuery,
  useServiceCenterStatusTypeQuery,
} from "../hooks";
import {
  convertBackendToSlotState,
  convertSlotStateToBackend,
  validateAppointmentSlots as validateSlots,
  isSlotComplete,
} from "../../../utils/appointmentHelper";

const { Step } = Steps;
const { Panel } = Collapse;
const { RangePicker } = TimePicker;

type ServiceCenterEditModalType = {
  isEditModalOpen: boolean;
  onOk: () => void;
  onCancel: () => void;
  data: ServiceCenterDataType | null;
  onRefresh: () => void;
  selectList: ServiceCenterSelectListType[];
};

const ServiceCenterEditModal = ({
  isEditModalOpen,
  onOk,
  onCancel,
  data,
  onRefresh,
  selectList,
}: ServiceCenterEditModalType) => {
  const [serviceCenterForm] = Form.useForm();
  const [open, setOpen] = useState(false);
  const { data: statusList, isSuccess } = useServiceCenterStatusTypeQuery();
  const [statusIdSuccess, setstatusIdSuccess] = useState<number>(-1);

  // State for current visual step and actual status ID
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [currentStatusId, setCurrentStatusId] = useState<string | undefined>(
    statusList?.data[0].value
  );

  // State for managing collapse panel visibility
  const [activeCollapseKeys, setActiveCollapseKeys] = useState<string[]>([
    "pending",
  ]);

  // State for appointment slots (รองรับ startTime และ endTime)
  const [appointmentSlots, setAppointmentSlots] = useState<
    AppointmentSlotState[]
  >([{ id: "1", date: null, timeRange: null }]);

  // State for images at different stages
  const [pendingImages, setPendingImages] = useState<UploadFile[]>([]);
  const [repairingImages, setRepairingImages] = useState<UploadFile[]>([]);
  const [successImages, setSuccessImages] = useState<UploadFile[]>([]);

  const mutationEditServiceCenter = editServiceCenterQuery();
  const mutationreshuduleServiceCenter = reshuduleServiceCenterQuery();

  // Helper function to get status title by its ID
  const getStatusNameById = useCallback(
    (id: string | undefined): string | undefined => {
      if (!id) return undefined;
      const foundStep = statusList?.data.find((step) => step.value === id);
      if (foundStep) return foundStep.label;
      const foundInSelectList = selectList.find((s) => s.value === id);
      return foundInSelectList?.label;
    },
    [selectList, statusList?.data]
  );

  // Function to add new appointment slot
  const addAppointmentSlot = () => {
    if (appointmentSlots.length < 3) {
      const newSlot: AppointmentSlotState = {
        id: Date.now().toString(),
        date: null,
        timeRange: null,
      };
      setAppointmentSlots([...appointmentSlots, newSlot]);
    }
  };

  // Function to remove appointment slot
  const removeAppointmentSlot = (id: string) => {
    if (appointmentSlots.length > 1) {
      setAppointmentSlots(appointmentSlots.filter((slot) => slot.id !== id));
    }
  };

  // Function to update appointment slot
  const updateAppointmentSlot = (
    id: string,
    field: "date" | "timeRange",
    value: any
  ) => {
    setAppointmentSlots((slots) =>
      slots.map((slot) => (slot.id === id ? { ...slot, [field]: value } : slot))
    );
  };

  // Function to validate appointment slots (ใช้ utility function)
  const validateAppointmentSlots = () => {
    console.log("🔍 Validating appointment slots...");
    console.log("📅 Slots to validate:", appointmentSlots);

    const validationResult = validateSlots(appointmentSlots);
    console.log("📊 Validation result:", validationResult);

    if (!validationResult.isValid) {
      console.log("❌ Validation failed:", validationResult.message);
      return Promise.reject(new Error(validationResult.message));
    }

    console.log("✅ Validation passed");
    return Promise.resolve();
  };

  // Function to format appointment data for submission (ใช้ utility function)
  const formatAppointmentData = (): FormattedAppointmentData[] => {
    console.log("🔄 Formatting appointment data...");
    console.log("📅 Current appointment slots:", appointmentSlots);

    const result = convertSlotStateToBackend(appointmentSlots);
    console.log("📋 Converted appointment data:", result);

    return result;
  };

  // Effect to initialize modal state when it opens or when 'data' changes
  useEffect(() => {
    setOpen(isEditModalOpen);
    if (isEditModalOpen && data) {
      console.log("🔍 [Modal] Data received:", {
        requestCloseCase: data.requestCloseCase,
        requestNewAppointment: data.requestNewAppointment,
        requestReschedule: data.requestReschedule, // ✅ เพิ่มบรรทัดนี้
        status: data.status?.nameCode,
      });

      const initialStatusId = data.statusId?.toString();
      setCurrentStatusId(initialStatusId);

      const stepIndex = statusList?.data.findIndex(
        (step) => step.value === initialStatusId
      );
      const newCurrentStepIndex = stepIndex !== -1 ? stepIndex : 0;
      setCurrentStepIndex(newCurrentStepIndex);

      // Initialize appointment slots from existing data (ใช้ utility function)
      if (data.appointmentDate) {
        const slots = convertBackendToSlotState(data.appointmentDate as any[]);
        setAppointmentSlots(slots);
      } else {
        setAppointmentSlots([{ id: "1", date: null, timeRange: null }]);
      }

      // Populate form fields with existing data
      serviceCenterForm.setFieldsValue({
        ...data,
        appointmentDateConfirmAppointment:
          data.appointmentDateConfirmAppointment
            ? dayjs(data.appointmentDateConfirmAppointment)
            : undefined,
        acknowledgeDate: data.acknowledgeDate
          ? dayjs(data.acknowledgeDate)
          : undefined,
        actionDate: data.actionDate ? dayjs(data.actionDate) : undefined,
        completedDate: data.completedDate
          ? dayjs(data.completedDate)
          : undefined,
        cause: data.cause,
        solution: data.solution,
        requestReschedule: data.requestReschedule, // ✅ เพิ่มบรรทัดนี้
      });

      if (data.status.nameCode === "repairing") {
        const statusId = statusList?.data.find(
          (item) => item.label === "Success"
        )?.value;
        setstatusIdSuccess(statusId ? Number(statusId) : -1);
      }

      // Organize existing images into their respective status categories
      const pImages: UploadFile[] = [];
      const rImages: UploadFile[] = [];
      const sImages: UploadFile[] = [];
      data.imageItems?.forEach((item: ImageItem) => {
        const imgFile: UploadFile = {
          uid: item.id.toString(),
          name: item.imageUrl || "image.png",
          status: "done",
          url: item.imageUrl,
        };
        if (item.imageStatus?.nameEn === "Pending" || item.imageStatusId === 1)
          pImages.push(imgFile);
        if (
          item.imageStatus?.nameEn === "Repairing" ||
          item.imageStatusId === 2
        )
          rImages.push(imgFile);
        if (item.imageStatus?.nameEn === "Success" || item.imageStatusId === 3)
          sImages.push(imgFile);
      });
      setPendingImages(pImages);
      setRepairingImages(rImages);
      setSuccessImages(sImages);
    } else if (!isEditModalOpen) {
      resetFormAndState();
    }
  }, [isEditModalOpen, data, serviceCenterForm, selectList, statusList?.data]);

  // ✅ เพิ่มฟังก์ชันสำหรับจัดการ collapse change
  const handleCollapseChange = (keys: string | string[]) => {
    const keyArray = Array.isArray(keys) ? keys : [keys];
    console.log("🔄 Collapse keys changed:", keyArray);
    setActiveCollapseKeys(keyArray);
  };

  // Effect to manage which collapse panels are open based on the current status and data
  useEffect(() => {
    if (isEditModalOpen && data && currentStatusId && statusList?.data) {
      const newActiveKeys = new Set<string>();
      newActiveKeys.add("pending"); // Pending จะเปิดเสมอ

      const currentActualStepDefinition = statusList.data.find(
        (step) => step.value === currentStatusId
      );
      const currentOrder = currentActualStepDefinition
        ? statusList.data.indexOf(currentActualStepDefinition)
        : -1;

      const repairingStepDefinition = statusList.data.find(
        (s) => s.label === "Repairing"
      );
      const repairingOrder = repairingStepDefinition
        ? statusList.data.indexOf(repairingStepDefinition)
        : -1;

      const successStepDefinition = statusList.data.find(
        (s) => s.label === "Success"
      );
      const successOrder = successStepDefinition
        ? statusList.data.indexOf(successStepDefinition)
        : -1;

      const closedStepId = statusList.data.find(
        (s) => s.label === "Closed"
      )?.value;

      // ✅ เมื่อเปิด Modal ครั้งแรก ให้เปิด panel ที่เกี่ยวข้องตามสถานะ
      if (
        repairingOrder !== -1 &&
        (currentOrder >= repairingOrder ||
          data.imageItems?.some((img) => img.imageStatusId === 2))
      ) {
        newActiveKeys.add("repairing");
      }

      if (
        successOrder !== -1 &&
        (currentOrder >= successOrder ||
          currentStatusId === closedStepId ||
          data.imageItems?.some((img) => img.imageStatusId === 3))
      ) {
        newActiveKeys.add("success");
      }

      // ✅ ตั้งค่าเฉพาะครั้งแรกที่เปิด Modal เท่านั้น
      console.log(
        "🔧 Setting initial collapse keys:",
        Array.from(newActiveKeys)
      );
      setActiveCollapseKeys(Array.from(newActiveKeys));
    } else if (isEditModalOpen) {
      setActiveCollapseKeys(["pending"]);
    }
  }, [currentStatusId, isEditModalOpen, data, statusList?.data]);

  // Resets form fields and local component state
  const resetFormAndState = useCallback(() => {
    serviceCenterForm.resetFields();
    setCurrentStepIndex(0);
    setCurrentStatusId(
      statusList?.data.find((step) => step.label === "Pending")?.value
    );
    setPendingImages([]);
    setRepairingImages([]);
    setSuccessImages([]);
    setActiveCollapseKeys(["pending"]);
    setAppointmentSlots([{ id: "1", date: null, timeRange: null }]);
  }, [serviceCenterForm, statusList?.data]);

  // Handles closing of the modal
  const handleClose = useCallback(() => {
    resetFormAndState();
    onCancel();
  }, [resetFormAndState, onCancel]);

  // Handles form submission for status updates
  const handleFormSubmit = async (formValues: any) => {
    console.log("🚀 [ServiceCenter] Form submission started");
    console.log("📋 Form values received:", formValues);
    console.log("📊 Current data:", data);
    console.log("🔍 Current status ID:", currentStatusId);
    console.log("📍 Current step index:", currentStepIndex);
    console.log("🎯 Current status name:", getStatusNameById(currentStatusId));

    if (!data || !currentStatusId) {
      console.error(
        "❌ [FormSubmit] Critical data missing (data or currentStatusId). Aborting."
      );
      return;
    }

    // Validate appointment slots for pending status
    if (getStatusNameById(currentStatusId) === "Pending") {
      console.log("⏰ Validating appointment slots for Pending status...");
      console.log("📅 Current appointment slots:", appointmentSlots);

      try {
        await validateAppointmentSlots();
        console.log("✅ Appointment slots validation passed");
      } catch (error: any) {
        console.error("❌ Appointment slots validation failed:", error.message);
        message.error(error.message);
        return;
      }
    }

    let nextStatusId = currentStatusId;
    if (currentStepIndex === 0 && statusList?.data[1]) {
      nextStatusId = statusList.data[1].value;
    } else if (currentStepIndex === 1 && statusList?.data[2]) {
      nextStatusId = statusList.data[2].value;
    } else if (currentStepIndex === 2 && statusList?.data[3]) {
      nextStatusId = statusList.data[3].value;
    } else if (currentStepIndex === 3 && statusList?.data[4]) {
      nextStatusId = statusList.data[4].value;
    }

    console.log("⏭️ Next status ID:", nextStatusId);
    console.log("⏭️ Next status name:", getStatusNameById(nextStatusId));

    ConfirmModal({
      title: `Confirm Action`,
      message: `Are you sure you want to proceed? This may update the status to "${
        getStatusNameById(nextStatusId) || "next step"
      }".`,
      okMessage: "Yes, Proceed",
      cancelMessage: "Cancel",
      onOk: async () => {
        try {
          console.log("🔄 Processing form submission...");

          // Format appointment data for submission (ปรับให้รองรับ API ใหม่)
          let formattedAppointmentData = null;
          if (getStatusNameById(currentStatusId) === "Pending") {
            console.log("📅 Formatting appointment data for Pending status...");
            formattedAppointmentData = formatAppointmentData();
            console.log(
              "📋 Formatted appointment data:",
              formattedAppointmentData
            );
          } else if (
            getStatusNameById(currentStatusId) === "Confirm appointment"
          ) {
            console.log("📅 Processing Confirm appointment data...");
            // For confirm appointment, send the selected appointment ID
            const selectedAppointment = data.appointmentDate?.find(
              (appointment: any) => appointment.selected === true
            );
            formattedAppointmentData = {
              selectedAppointmentId:
                selectedAppointment?.id ||
                data.appointmentDateConfirmAppointmentID,
              confirmedDate: selectedAppointment?.date || null,
            };
            console.log(
              "📋 Confirm appointment data:",
              formattedAppointmentData
            );
            console.log(
              "📋 Selected appointment details:",
              selectedAppointment
            );
          } else if (formValues.appointmentDate) {
            console.log("📅 Processing existing appointment date...");
            formattedAppointmentData = Array.isArray(formValues.appointmentDate)
              ? formValues.appointmentDate.map((date: any) =>
                  dayjs(date).format("YYYY-MM-DD")
                )
              : null;
            console.log(
              "📋 Processed appointment data:",
              formattedAppointmentData
            );
          }

          const payload: EditDataServiceCenter = {
            id: data.id,
            statusId: Number(currentStatusId),
            currentStatus: getStatusNameById(currentStatusId) || "",
            acknowledgeDate: formValues.acknowledgeDate
              ? dayjs(formValues.acknowledgeDate).toISOString()
              : data.acknowledgeDate,
            actionDate: formValues.actionDate
              ? dayjs(formValues.actionDate).toISOString()
              : data.actionDate,
            completedDate: formValues.completedDate
              ? dayjs(formValues.completedDate).toISOString()
              : data.completedDate,
            cause:
              formValues.cause !== undefined ? formValues.cause : data.cause,
            solution:
              formValues.solution !== undefined
                ? formValues.solution
                : data.solution,
            appointmentDate: formattedAppointmentData || data.appointmentDate,
            appointmentDateConfirmAppointmentID:
              data.appointmentDateConfirmAppointmentID
                ? data.appointmentDateConfirmAppointmentID
                : undefined,
          };

          console.log(
            "📦 Final payload to be sent:",
            JSON.stringify(payload, null, 2)
          );
          console.log(
            "🎯 API endpoint will be determined by currentStatus:",
            payload.currentStatus
          );

          await mutationEditServiceCenter.mutateAsync(payload);
          console.log("✅ API call successful");

          onRefresh();

          const nextVisualStepIndex = statusList?.data.findIndex(
            (step) => step.value === nextStatusId
          );
          if (nextVisualStepIndex !== -1 && nextVisualStepIndex !== undefined) {
            console.log("🔄 Moving to next step:", nextVisualStepIndex);
            setCurrentStepIndex(nextVisualStepIndex);
            setCurrentStatusId(nextStatusId);
          } else {
            console.log("🏁 Closing modal");
            handleClose();
          }
        } catch (error) {
          console.error(
            "❌ [ConfirmModal OK] Failed to update service center:",
            error
          );
          console.error("Error details:", error);
        }
      },
    });
  };

  // Handles the action of closing a ticket
  const handleCloseTicket = () => {
    if (!data) return;
    ConfirmModal({
      title: "Close ticket?",
      message: "Are you sure you want to close this ticket?",
      okMessage: "Confirm",
      cancelMessage: "Cancel",
      onOk: async () => {
        try {
          const closedStatus = statusList?.data.find(
            (s) => s.label === "Closed"
          );
          if (!closedStatus) {
            console.error("Configuration error: 'Closed' status ID not found.");
            return;
          }
          const payload: EditDataServiceCenter = {
            id: data.id,
            statusId: Number(closedStatus.value),
            currentStatus: closedStatus.label,
          };
          await mutationEditServiceCenter.mutateAsync(payload);
          onRefresh();
          handleClose();
        } catch (error) {
          console.error("Failed to close ticket:", error);
        }
      },
    });
  };

  // Renders a summary panel for a specific stage
  const renderReportSummaryPanel = (
    title: string,
    imageCategory?: "Pending" | "Repairing" | "Success"
  ) => {
    const panelKey = title.toLowerCase().replace(/\s+/g, "-");
    const relevantImages =
      imageCategory === "Pending"
        ? pendingImages
        : imageCategory === "Repairing"
        ? repairingImages
        : imageCategory === "Success"
        ? successImages
        : [];

    return (
      <Panel header={title} key={panelKey}>
        <div className="summary-content">
          {relevantImages.length > 0 ? (
            <div className="summary-image-container">
              <Image.PreviewGroup>
                {relevantImages.map((img, idx) => (
                  <Image
                    key={idx}
                    width={150}
                    src={img.url || NoImage}
                    alt={`${imageCategory || title} image ${idx + 1}`}
                  />
                ))}
              </Image.PreviewGroup>
            </div>
          ) : (
            imageCategory && (
              <div className="summary-image-container">
                <Image
                  width={150}
                  src={NoImage}
                  alt={`No ${imageCategory} image`}
                />
              </div>
            )
          )}
          <dl className="summary-details">
            <dt>Owner</dt>
            <dd>{data?.fullname || "N/A"}</dd>
            <dt>Submission date</dt>
            <dd>
              {data?.createdAt
                ? dayjs(data.createdAt).format("YYYY-MM-DD")
                : "N/A"}
            </dd>
            <dt>Problem</dt>
            <dd>{data?.serviceTypeName || "N/A"}</dd>
            <dt>Description</dt>
            <dd>{data?.description || "N/A"}</dd>
            {data?.cause && (
              <>
                <dt>Cause</dt>
                <dd>{data.cause}</dd>
              </>
            )}
            {data?.solution && (
              <>
                <dt>Solution</dt>
                <dd>{data.solution}</dd>
              </>
            )}
            {data?.actionDate && (
              <>
                <dt>Action Date</dt>
                <dd>{dayjs(data.actionDate).format("YYYY-MM-DD")}</dd>
              </>
            )}
            {data?.completedDate && (
              <>
                <dt>Completed Date</dt>
                <dd>{dayjs(data.completedDate).format("YYYY-MM-DD")}</dd>
              </>
            )}
          </dl>
        </div>
      </Panel>
    );
  };

  // Renders the appointment slots UI (ปรับใหม่ให้รองรับ startTime และ endTime)
  const renderAppointmentSlots = () => {
    const validSlots = appointmentSlots.filter((slot) => isSlotComplete(slot));
    const isDisabled = validSlots.length === 0;

    return (
      <div className="appointment-slots-container">
        <div className="appointment-slots-header">
          <span>
            Appointment Slots
            <Tooltip title="Select up to 3 dates with time slots for technician appointment">
              <InfoCircleOutlined style={{ marginLeft: 8 }} />
            </Tooltip>
          </span>
          {appointmentSlots.length < 3 && (
            <Button
              type="dashed"
              icon={<PlusOutlined />}
              onClick={addAppointmentSlot}
              size="small">
              Add Slot
            </Button>
          )}
        </div>

        <Space direction="vertical" style={{ width: "100%" }} size="middle">
          {appointmentSlots.map((slot, index) => {
            const slotComplete = isSlotComplete(slot);
            const slotClass = slotComplete ? "is-complete" : "";

            return (
              <Card
                key={slot.id}
                size="small"
                title={`Slot ${index + 1}`}
                className={slotClass}
                extra={
                  appointmentSlots.length > 1 && (
                    <Button
                      type="text"
                      icon={<DeleteOutlined />}
                      onClick={() => removeAppointmentSlot(slot.id)}
                      size="small"
                      danger
                    />
                  )
                }>
                <Row gutter={16}>
                  <Col span={12}>
                    <div className={`slot-field ${slotClass}`}>
                      <label>
                        <CalendarOutlined
                          style={{ marginRight: 4, color: "#d46b08" }}
                        />
                        Date
                      </label>
                      <DatePicker
                        value={slot.date}
                        onChange={(date) =>
                          updateAppointmentSlot(slot.id, "date", date)
                        }
                        format="YYYY-MM-DD"
                        style={{ width: "100%" }}
                        placeholder="Select date"
                        disabledDate={(current) =>
                          current && current < dayjs().startOf("day")
                        }
                      />
                    </div>
                  </Col>
                  <Col span={12}>
                    <div className={`slot-field ${slotClass}`}>
                      <label>
                        <ClockCircleOutlined
                          style={{ marginRight: 4, color: "#cf1322" }}
                        />
                        Time Range
                      </label>
                      <RangePicker
                        value={slot.timeRange}
                        onChange={(timeRange) =>
                          updateAppointmentSlot(slot.id, "timeRange", timeRange)
                        }
                        format="HH:mm"
                        style={{ width: "100%" }}
                        placeholder={["Start time", "End time"]}
                        minuteStep={30}
                        disabled={!slot.date}
                      />
                    </div>
                  </Col>
                </Row>
              </Card>
            );
          })}
        </Space>

        <div className="appointment-submit-section">
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            className="send-button-teal"
            disabled={isDisabled}>
            Send ({validSlots.length} slot{validSlots.length !== 1 ? "s" : ""})
          </Button>
        </div>
      </div>
    );
  };

  // Renders the appropriate form fields and actions based on the current status
  const renderStatusUpdateSection = () => {
    if (!data) return null;
    const currentStatusName = getStatusNameById(currentStatusId);

    switch (currentStatusName) {
      case "Pending":
        return (
          <>
            {renderAppointmentSlots()}
            {data.appointmentDeclined && (
              <Alert
                message="The user has declined your appointment date. Please select a new date and send it to the user for confirmation."
                type="info"
                showIcon
                className="info-alert"
              />
            )}
          </>
        );

      case "Waiting for confirmation":
        return (
          <>
            <Alert
              message="Waiting for the user to confirm the appointment date."
              type="info"
              showIcon
              className="info-alert"
            />
            <div className="action-buttons">
              <Button
                disabled={!data.requestCloseCase}
                onClick={handleCloseTicket}
                size="large"
                danger
                style={{
                  backgroundColor: !data.requestCloseCase
                    ? undefined
                    : "#ff4d4f",
                  borderColor: !data.requestCloseCase ? undefined : "#ff4d4f",
                  color: !data.requestCloseCase ? undefined : "#fff",
                }}>
                Close ticket
              </Button>
            </div>
          </>
        );

      case "Confirm appointment":
        return (
          <>
            {/* แสดงเฉพาะ appointment ที่ selected จาก API */}
            {data.appointmentDate &&
              Array.isArray(data.appointmentDate) &&
              data.appointmentDate.length > 0 && (
                <div className="appointment-confirmation-container">
                  <div className="appointment-slots-header">
                    <span>
                      Selected Appointment
                      <Tooltip title="This is the appointment slot selected by the user">
                        <InfoCircleOutlined style={{ marginLeft: 8 }} />
                      </Tooltip>
                    </span>
                  </div>

                  <Space
                    direction="vertical"
                    style={{ width: "100%" }}
                    size="middle">
                    {data.appointmentDate
                      .filter(
                        (appointment: any) => appointment.selected === true
                      ) // แสดงเฉพาะที่ selected
                      .map((appointment: any, index: number) => {
                        const appointmentDisplay =
                          typeof appointment === "object" && appointment.date
                            ? {
                                date: dayjs(appointment.date).format(
                                  "DD/MM/YYYY"
                                ),
                                time:
                                  appointment.startTime && appointment.endTime
                                    ? `${appointment.startTime} - ${appointment.endTime}`
                                    : "All day",
                              }
                            : {
                                date: dayjs(appointment).format("DD/MM/YYYY"),
                                time: "All day",
                              };

                        return (
                          <Card
                            key={appointment.id || index}
                            size="small"
                            title="Confirmed Appointment"
                            className="appointment-selected"
                            style={{
                              border: "2px solid #52c41a",
                              backgroundColor: "#f6ffed",
                            }}>
                            <Row gutter={16}>
                              <Col span={12}>
                                <div className="appointment-info">
                                  <label>
                                    <CalendarOutlined
                                      style={{
                                        marginRight: 4,
                                        color: "#d46b08",
                                      }}
                                    />
                                    Date
                                  </label>
                                  <div className="appointment-value">
                                    {appointmentDisplay.date}
                                  </div>
                                </div>
                              </Col>
                              <Col span={12}>
                                <div className="appointment-info">
                                  <label>
                                    <ClockCircleOutlined
                                      style={{
                                        marginRight: 4,
                                        color: "#cf1322",
                                      }}
                                    />
                                    Time
                                  </label>
                                  <div className="appointment-value">
                                    {appointmentDisplay.time}
                                  </div>
                                </div>
                              </Col>
                            </Row>
                            <div className="selected-indicator">
                              <CheckCircleOutlined style={{ marginRight: 4 }} />
                              User Selected
                            </div>
                          </Card>
                        );
                      })}
                  </Space>

                  {/* แสดงข้อความถ้าไม่มี appointment ที่ selected */}
                  {!data.appointmentDate.some(
                    (appointment: any) => appointment.selected === true
                  ) && (
                    <Alert
                      message="No appointment has been selected by the user yet."
                      type="info"
                      showIcon
                      className="info-alert"
                    />
                  )}
                </div>
              )}

            {/* Remark สำหรับ requestReschedule */}
            {data.requestReschedule && (
              <Alert
                message="กรุณารอการยืนยันจากลูกบ้าน"
                description="ขณะนี้มีการร้องขอการเปลี่ยนแปลงนัดหมายจากลูกบ้าน กรุณารอการยืนยันก่อนดำเนินการต่อ"
                type="warning"
                showIcon
                className="info-alert"
                style={{ marginTop: 16 }}
              />
            )}

            {/* Remark สำหรับ requestCloseCase */}
            {data.requestCloseCase && !data.requestReschedule && (
              <Alert
                message="ลูกบ้านร้องขอปิดเคส"
                description="ลูกบ้านได้ส่งคำขอปิดเคสแล้ว ทางนิติบุคคลสามารถกดปุ่ม Close ticket เพื่อปิดเคสได้"
                type="info"
                showIcon
                className="info-alert"
                style={{ marginTop: 16 }}
              />
            )}

            <div className="action-buttons">
              <Button
                disabled={!data.requestCloseCase || data.requestReschedule}
                onClick={handleCloseTicket}
                size="large"
                danger
                style={{
                  backgroundColor:
                    !data.requestCloseCase || data.requestReschedule
                      ? undefined
                      : "#ff4d4f",
                  borderColor:
                    !data.requestCloseCase || data.requestReschedule
                      ? undefined
                      : "#ff4d4f",
                  color:
                    !data.requestCloseCase || data.requestReschedule
                      ? undefined
                      : "#fff",
                }}>
                Close ticket
              </Button>
              <Button
                disabled={
                  data.requestNewAppointment ||
                  data.requestCloseCase ||
                  data.requestReschedule
                }
                onClick={async () => {
                  try {
                    console.log("🔄 Starting reschedule process...");
                    console.log("📋 Service ID:", data.id);

                    await mutationreshuduleServiceCenter.mutateAsync(data.id);
                    console.log("✅ Reschedule API call successful");

                    // ✅ Refresh parent component data
                    onRefresh();

                    // ✅ ปิด Modal และให้ parent component refresh ข้อมูลใหม่
                    handleClose();

                    console.log(
                      "✅ Reschedule completed - Modal closed, data will refresh"
                    );
                  } catch (error) {
                    console.error("❌ Reschedule failed:", error);
                  }
                }}
                size="large">
                Reschedule
              </Button>
              <Button
                disabled={
                  data.requestCloseCase ||
                  data.requestNewAppointment ||
                  data.requestReschedule ||
                  !data.appointmentDate?.some(
                    (appointment: any) => appointment.selected === true
                  )
                }
                type="primary"
                htmlType="submit"
                size="large">
                Confirm Appointment
              </Button>
            </div>
          </>
        );

      case "Repairing":
        return (
          <>
            <Form.Item
              label={
                <span>
                  Action date
                  <Tooltip title="Date the service action was performed.">
                    <InfoCircleOutlined style={{ marginLeft: 8 }} />
                  </Tooltip>
                </span>
              }
              name="actionDate">
              <DatePicker size="large" disabled style={{ width: "100%" }} />
            </Form.Item>
            <div className="repairing-step-layout">
              <div className="repairing-step-left-column">
                <Form.Item label="Cause" name="cause" rules={requiredRule}>
                  <Input.TextArea
                    rows={5}
                    placeholder="Describe the cause of the issue"
                  />
                </Form.Item>
                <Form.Item
                  label="Solution"
                  name="solution"
                  rules={requiredRule}>
                  <Input.TextArea
                    rows={5}
                    placeholder="Describe the solution applied"
                  />
                </Form.Item>
              </div>
              <div className="repairing-step-right-column">
                <div className="image-gallery-container">
                  <h5>Repairing image : {repairingImages.length} of 3</h5>
                  <ServiceImageGallery
                    title=""
                    maximum={3}
                    oldFileList={repairingImages}
                    setOldFileList={setRepairingImages}
                    imageStatusId={data.statusId!}
                    serviceId={data.id}
                    disabledUpload={repairingImages.length >= 3}
                  />
                </div>
                <div className="image-gallery-container">
                  <h5>Success image : {successImages.length} of 3</h5>
                  <ServiceImageGallery
                    title=""
                    maximum={3}
                    oldFileList={successImages}
                    setOldFileList={setSuccessImages}
                    imageStatusId={statusIdSuccess}
                    serviceId={data.id}
                    disabledUpload={successImages.length >= 3}
                  />
                </div>
              </div>
            </div>
            <div className="action-buttons">
              <Button
                disabled={!data.requestCloseCase}
                onClick={handleCloseTicket}
                size="large"
                danger
                style={{
                  backgroundColor: !data.requestCloseCase
                    ? undefined
                    : "#ff4d4f",
                  borderColor: !data.requestCloseCase ? undefined : "#ff4d4f",
                  color: !data.requestCloseCase ? undefined : "#fff",
                }}>
                Close ticket
              </Button>
            </div>
            <div className="action-buttons">
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                className="send-button-dark-blue">
                Send
              </Button>
            </div>
          </>
        );

      case "Success":
        return (
          <Alert
            message="The fixing process is now complete. We're currently waiting for the user to confirm the case before we can officially close it."
            type="info"
            showIcon
            className="info-alert"
          />
        );

      case "Closed":
        return (
          <Alert
            message="This ticket has been closed."
            type="success"
            showIcon
            className="info-alert"
          />
        );

      default:
        return (
          <p>
            Status: {currentStatusName || "Unknown"}. Status information will
            appear here.
          </p>
        );
    }
  };

  // Main content of the modal
  const ModalContent = () => {
    if (!data) return null;

    return (
      <Form
        form={serviceCenterForm}
        layout="vertical"
        onFinish={handleFormSubmit}
        className="service-center-edit-modal-form">
        <Steps
          current={currentStepIndex}
          size="small"
          labelPlacement="vertical">
          {statusList?.data.map((step) => (
            <Step key={step.value} title={step.label} />
          ))}
        </Steps>

        <h4>Report summary</h4>
        <Collapse
          className="report-summary-collapse"
          activeKey={activeCollapseKeys}
          onChange={handleCollapseChange}>
          {renderReportSummaryPanel("Pending", "Pending")}
          {/* ✅ แสดง repairing panel เสมอถ้าควรแสดง */}
          {(statusList?.data.findIndex((s) => s.value === currentStatusId) ??
            -1) >=
            (statusList?.data.findIndex((s) => s.label === "Repairing") ??
              -1) &&
            statusList?.data.findIndex((s) => s.label === "Repairing") !== -1 &&
            renderReportSummaryPanel("Repairing", "Repairing")}
          {/* ✅ แสดง success panel เสมอถ้าควรแสดง */}
          {(statusList?.data.findIndex((s) => s.value === currentStatusId) ??
            -1) >=
            (statusList?.data.findIndex((s) => s.label === "Success") ?? -1) &&
            statusList?.data.findIndex((s) => s.label === "Success") !== -1 &&
            renderReportSummaryPanel("Success", "Success")}
        </Collapse>

        <div className="status-update-section">
          <h4>Status update</h4>
          {renderStatusUpdateSection()}
        </div>
      </Form>
    );
  };

  return (
    <FormModal
      isOpen={open}
      title="Manage Report"
      content={<ModalContent />}
      onCancel={handleClose}
      className="service-center-edit-modal"
      footer={null}
    />
  );
};

export default ServiceCenterEditModal;
