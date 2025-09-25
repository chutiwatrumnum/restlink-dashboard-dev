"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Form,
  Input,
  DatePicker,
  TimePicker,
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
import { useServiceCenterStatusTypeQuery } from "../hooks";
import {
  convertBackendToSlotState,
  convertSlotStateToBackend,
  validateAppointmentSlots as validateSlots,
  isSlotComplete,
} from "../../../utils/appointmentHelper";

const { Step } = Steps;
const { Panel } = Collapse;
const { RangePicker } = TimePicker;

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

type ServiceCenterEditModalProps = {
  isEditModalOpen: boolean;
  onOk: () => void;
  onCancel: () => void;
  data: ServiceCenterDataType | null;
  onRefresh: () => void;
  selectList: ServiceCenterSelectListType[];
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const ServiceCenterEditModal = ({
  isEditModalOpen,
  onOk,
  onCancel,
  data,
  onRefresh,
  selectList,
}: ServiceCenterEditModalProps) => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  const [serviceCenterForm] = Form.useForm();
  const [open, setOpen] = useState(false);
  const { data: statusList } = useServiceCenterStatusTypeQuery();
  const [statusIdSuccess, setStatusIdSuccess] = useState<number>(-1);

  // Current status tracking
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [currentStatusId, setCurrentStatusId] = useState<string | undefined>(
    statusList?.data[0].value
  );

  // UI state
  const [activeCollapseKeys, setActiveCollapseKeys] = useState<string[]>([
    "pending",
  ]);

  // Appointment slots
  const [appointmentSlots, setAppointmentSlots] = useState<
    AppointmentSlotState[]
  >([{ id: "1", date: null, timeRange: null }]);

  // Images for different stages
  const [pendingImages, setPendingImages] = useState<any[]>([]);
  const [repairingImages, setRepairingImages] = useState<any[]>([]);
  const [successImages, setSuccessImages] = useState<any[]>([]);

  // Mutations
  const mutationEditServiceCenter = editServiceCenterQuery();
  const mutationRescheduleServiceCenter = reshuduleServiceCenterQuery();

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

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

  const handleClose = useCallback(() => {
    resetFormAndState();
    onCancel();
  }, [resetFormAndState, onCancel]);

  // ============================================================================
  // APPOINTMENT SLOT MANAGEMENT
  // ============================================================================

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

  const removeAppointmentSlot = (id: string) => {
    if (appointmentSlots.length > 1) {
      setAppointmentSlots(appointmentSlots.filter((slot) => slot.id !== id));
    }
  };

  const updateAppointmentSlot = (
    id: string,
    field: "date" | "timeRange",
    value: any
  ) => {
    setAppointmentSlots((slots) =>
      slots.map((slot) => (slot.id === id ? { ...slot, [field]: value } : slot))
    );
  };

  const validateAppointmentSlots = () => {
    console.log("🔍 Validating appointment slots...");
    const validationResult = validateSlots(appointmentSlots);

    if (!validationResult.isValid) {
      console.log("❌ Validation failed:", validationResult.message);
      return Promise.reject(new Error(validationResult.message));
    }

    console.log("✅ Validation passed");
    return Promise.resolve();
  };

  const formatAppointmentData = (): FormattedAppointmentData[] => {
    console.log("🔄 Formatting appointment data...");
    const result = convertSlotStateToBackend(appointmentSlots);
    console.log("📋 Converted appointment data:", result);
    return result;
  };

  // ============================================================================
  // INITIALIZATION & EFFECTS
  // ============================================================================

  useEffect(() => {
    setOpen(isEditModalOpen);

    if (isEditModalOpen && data) {
      console.log("🔍 [Modal] Initializing with data:", data.id);

      const initialStatusId = data.statusId?.toString();
      setCurrentStatusId(initialStatusId);

      const stepIndex = statusList?.data.findIndex(
        (step) => step.value === initialStatusId
      );
      const newCurrentStepIndex = stepIndex !== -1 ? stepIndex : 0;
      setCurrentStepIndex(newCurrentStepIndex);

      // Initialize appointment slots
      if (data.appointmentDate) {
        const slots = convertBackendToSlotState(data.appointmentDate as any[]);
        setAppointmentSlots(slots);
      } else {
        setAppointmentSlots([{ id: "1", date: null, timeRange: null }]);
      }

      // Populate form fields
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
        requestReSchedule: data.requestReSchedule,
      });

      // Set success status ID for repairing status
      if (data.status.nameCode === "repairing") {
        const statusId = statusList?.data.find(
          (item) => item.label === "Success"
        )?.value;
        setStatusIdSuccess(statusId ? Number(statusId) : -1);
      }

      // Organize images by status
      organizeImages(data.imageItems);
    } else if (!isEditModalOpen) {
      resetFormAndState();
    }
  }, [isEditModalOpen, data, serviceCenterForm, selectList, statusList?.data]);

  // Manage collapse panels based on current status
  useEffect(() => {
    if (isEditModalOpen && data && currentStatusId && statusList?.data) {
      const newActiveKeys = new Set<string>();
      newActiveKeys.add("pending");

      const currentOrder = statusList.data.findIndex(
        (step) => step.value === currentStatusId
      );

      const repairingOrder = statusList.data.findIndex(
        (s) => s.label === "Repairing"
      );

      const successOrder = statusList.data.findIndex(
        (s) => s.label === "Success"
      );

      const closedStepId = statusList.data.find(
        (s) => s.label === "Closed"
      )?.value;

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

      console.log(
        "🔧 Setting initial collapse keys:",
        Array.from(newActiveKeys)
      );
      setActiveCollapseKeys(Array.from(newActiveKeys));
    } else if (isEditModalOpen) {
      setActiveCollapseKeys(["pending"]);
    }
  }, [currentStatusId, isEditModalOpen, data, statusList?.data]);

  // ============================================================================
  // IMAGE MANAGEMENT
  // ============================================================================

  const organizeImages = (imageItems?: ImageItem[]) => {
    const pImages: any[] = [];
    const rImages: any[] = [];
    const sImages: any[] = [];

    imageItems?.forEach((item: ImageItem) => {
      const imgFile = {
        uid: item.id.toString(),
        name: item.imageUrl || "image.png",
        status: "done",
        url: item.imageUrl,
      };

      if (item.imageStatus?.nameEn === "Pending" || item.imageStatusId === 1) {
        pImages.push(imgFile);
      }
      if (
        item.imageStatus?.nameEn === "Repairing" ||
        item.imageStatusId === 2
      ) {
        rImages.push(imgFile);
      }
      if (item.imageStatus?.nameEn === "Success" || item.imageStatusId === 3) {
        sImages.push(imgFile);
      }
    });

    setPendingImages(pImages);
    setRepairingImages(rImages);
    setSuccessImages(sImages);
  };

  // ============================================================================
  // FORM SUBMISSION
  // ============================================================================

  const handleFormSubmit = async (formValues: any) => {
    console.log("🚀 [ServiceCenter] Form submission started");

    if (!data || !currentStatusId) {
      console.error("❌ Critical data missing. Aborting.");
      return;
    }

    // Validate appointment slots for pending status
    if (getStatusNameById(currentStatusId) === "Pending") {
      try {
        await validateAppointmentSlots();
      } catch (error: any) {
        message.error(error.message);
        return;
      }
    }

    // Determine next status
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

    ConfirmModal({
      title: `Confirm Action`,
      message: `Are you sure you want to proceed? This may update the status to "${
        getStatusNameById(nextStatusId) || "next step"
      }".`,
      okMessage: "Yes, Proceed",
      cancelMessage: "Cancel",
      onOk: async () => {
        try {
          // Format appointment data
          let formattedAppointmentData = null;
          const currentStatusName = getStatusNameById(currentStatusId);

          if (currentStatusName === "Pending") {
            formattedAppointmentData = formatAppointmentData();
          } else if (currentStatusName === "Confirm appointment") {
            const selectedAppointment = data.appointmentDate?.find(
              (appointment: any) => appointment.selected === true
            );
            formattedAppointmentData = {
              selectedAppointmentId:
                selectedAppointment?.id ||
                data.appointmentDateConfirmAppointmentID,
              confirmedDate: selectedAppointment?.date || null,
            };
          } else if (formValues.appointmentDate) {
            formattedAppointmentData = Array.isArray(formValues.appointmentDate)
              ? formValues.appointmentDate.map((date: any) =>
                  dayjs(date).format("YYYY-MM-DD")
                )
              : null;
          }

          const payload: EditDataServiceCenter = {
            id: data.id,
            statusId: Number(currentStatusId),
            currentStatus: currentStatusName || "",
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
              data.appointmentDateConfirmAppointmentID || undefined,
          };

          console.log("📦 Final payload:", payload);

          await mutationEditServiceCenter.mutateAsync(payload);
          onRefresh();

          const nextVisualStepIndex = statusList?.data.findIndex(
            (step) => step.value === nextStatusId
          );

          if (nextVisualStepIndex !== -1 && nextVisualStepIndex !== undefined) {
            setCurrentStepIndex(nextVisualStepIndex);
            setCurrentStatusId(nextStatusId);
          } else {
            handleClose();
          }
        } catch (error) {
          console.error("❌ Failed to update service center:", error);
        }
      },
    });
  };

  // ============================================================================
  // ACTION HANDLERS
  // ============================================================================

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

  const handleReschedule = async () => {
    try {
      console.log("🔄 Starting reschedule process...");
      await mutationRescheduleServiceCenter.mutateAsync(data!.id);
      onRefresh();
      handleClose();
      console.log("✅ Reschedule completed");
    } catch (error) {
      console.error("❌ Reschedule failed:", error);
    }
  };

  const handleCollapseChange = (keys: string | string[]) => {
    const keyArray = Array.isArray(keys) ? keys : [keys];
    setActiveCollapseKeys(keyArray);
  };

  // ============================================================================
  // RENDER FUNCTIONS
  // ============================================================================

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
                disabled={!data.requestCloseCase || data.requestReSchedule}
                onClick={handleCloseTicket}
                size="large"
                danger>
                Close ticket
              </Button>
            </div>
          </>
        );

        case "Confirm appointment":
          return (
            <>
              {/* Show selected appointment */}
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
                        )
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
                                border: "1px solid #52c41a",
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
                                <CheckCircleOutlined
                                  style={{ marginRight: 4 }}
                                />
                                User Selected
                              </div>
                            </Card>
                          );
                        })}
                    </Space>

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

              {/* Request status alerts - เช็คเงื่อนไขตามที่ต้องการ */}
              {data.requestReSchedule && (
                <Alert
                  message="Please wait for the resident's confirmation."
                  description="A request to reschedule has been made by the resident. Please wait for their confirmation before proceeding."
                  type="warning"
                  showIcon
                  className="info-alert"
                  style={{ marginTop: 16 }}
                />
              )}

              {data.requestCloseCase && !data.requestReSchedule && (
                <Alert
                  message="The resident has requested to close the case."
                  description="The resident has submitted a request to close the case. The juristic person can click the Close ticket button to close the case."
                  type="info"
                  showIcon
                  className="info-alert"
                  style={{ marginTop: 16 }}
                />
              )}

              {data.requestNewAppointment && !data.requestReSchedule && (
                <Alert
                  message="The resident has requested a new appointment."
                  description="Please proceed to schedule the new appointment."
                  type="info"
                  showIcon
                  className="info-alert"
                  style={{ marginTop: 16 }}
                />
              )}

              <div className="action-buttons">
                <Button
                  disabled={
                    // ปิดปุ่ม Close ticket เมื่อ requestReSchedule เป็น true
                    // หรือเมื่อ requestCloseCase เป็น false
                    data.requestReSchedule || !data.requestCloseCase
                  }
                  onClick={handleCloseTicket}
                  size="large"
                  danger>
                  Close ticket
                </Button>

                <Button
                  disabled={
                    // ปิดปุ่ม Reschedule เมื่อ requestReSchedule เป็น true
                    // หรือเมื่อมีการร้องขออื่นๆ
                    data.requestReSchedule ||
                    data.requestNewAppointment ||
                    data.requestCloseCase
                  }
                  onClick={handleReschedule}
                  size="large">
                  Reschedule
                </Button>

                <Button
                  disabled={
                    // ปิดปุ่ม Confirm Appointment เมื่อ requestReSchedule เป็น true
                    // หรือเมื่อมีการร้องขออื่นๆ
                    // หรือเมื่อยังไม่มีการเลือกนัดหมาย
                    data.requestReSchedule ||
                    data.requestCloseCase ||
                    data.requestNewAppointment ||
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
            {/* Show selected appointment for Repairing status */}
            {data.appointmentDate &&
              Array.isArray(data.appointmentDate) &&
              data.appointmentDate.length > 0 && (
                <div className="appointment-confirmation-container">
                  <div className="appointment-slots-header">
                    <span>
                      Date Appointment
                      <Tooltip title="This is the confirmed appointment slot">
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
                      )
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

                  {!data.appointmentDate.some(
                    (appointment: any) => appointment.selected === true
                  ) && (
                    <Alert
                      message="No appointment has been confirmed yet."
                      type="info"
                      showIcon
                      className="info-alert"
                      style={{ marginTop: 16 }}
                    />
                  )}
                </div>
              )}

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
                disabled={!data.requestCloseCase || data.requestReSchedule}
                onClick={handleCloseTicket}
                size="large"
                danger>
                Close ticket
              </Button>

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
            message="The issue has been fully repaired and is now awaiting user confirmation before it can be officially closed."
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

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

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
          {/* Show repairing panel if status reached repairing */}
          {(statusList?.data.findIndex((s) => s.value === currentStatusId) ??
            -1) >=
            (statusList?.data.findIndex((s) => s.label === "Repairing") ??
              -1) &&
            statusList?.data.findIndex((s) => s.label === "Repairing") !== -1 &&
            renderReportSummaryPanel("Repairing", "Repairing")}
          {/* Show success panel if status reached success */}
          {(statusList?.data.findIndex((s) => s.value === currentStatusId) ??
            -1) >=
            (statusList?.data.findIndex((s) => s.label === "Success") ?? -1) &&
            statusList?.data.findIndex((s) => s.label === "Success") !== -1 &&
            renderReportSummaryPanel("Success", "Success")}
        </Collapse>

        <div className="status-update-section">
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
