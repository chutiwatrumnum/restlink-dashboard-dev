"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Form,
  Input,
  DatePicker,
  type UploadFile,
  Steps,
  Collapse,
  Button,
  Alert,
  Tooltip,
  Image,
} from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";
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
} from "../../../stores/interfaces/ServiceCenter";
import { editServiceCenterQuery } from "../hooks/serviceCenterMutation";
import "../styles/serviceCenterEditModal.css";
import NoImage from "../../../assets/images/noImg.jpeg";
import { useServiceCenterStatusTypeQuery } from "../hooks";

const { Step } = Steps;
const { Panel } = Collapse;

type ServiceCenterEditModalType = {
  isEditModalOpen: boolean;
  onOk: () => void; // Prop from FormModal, not directly used for submit logic here
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
  const [statusIdSuccess, setstatusIdSuccess] = useState<number>(30)
  // State for current visual step and actual status ID
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [currentStatusId, setCurrentStatusId] = useState<string | undefined>(
    statusList?.data[0].value
  );

  // State for managing collapse panel visibility
  const [activeCollapseKeys, setActiveCollapseKeys] = useState<string[]>([
    "pending",
  ]);

  // State for images at different stages
  const [pendingImages, setPendingImages] = useState<UploadFile[]>([]);
  const [repairingImages, setRepairingImages] = useState<UploadFile[]>([]);
  const [successImages, setSuccessImages] = useState<UploadFile[]>([]);

  const mutationEditServiceCenter = editServiceCenterQuery();

  // Helper function to get status title by its ID
  const getStatusNameById = useCallback(
    (id: string | undefined): string | undefined => {
      if (!id) return undefined;
      const foundStep = statusList?.data.find((step) => step.value === id);
      if (foundStep) return foundStep.label;
      // Fallback to selectList if not in predefined steps (should ideally align)
      const foundInSelectList = selectList.find((s) => s.value === id);
      return foundInSelectList?.label;
    },
    [selectList]
  );

  // Effect to initialize modal state when it opens or when 'data' (the service record) changes
  useEffect(() => {
    setOpen(isEditModalOpen);

    if (isEditModalOpen && data) {
      const initialStatusId = data.statusId?.toString();
      setCurrentStatusId(initialStatusId);
      
      const stepIndex = statusList?.data.findIndex(
        (step) => step.value === initialStatusId
      );
      const newCurrentStepIndex = stepIndex ? stepIndex : 0;
      setCurrentStepIndex(newCurrentStepIndex);

      // Populate form fields with existing data
      serviceCenterForm.setFieldsValue({
        ...data,
        appointmentDate: data.appointmentDate
          ? dayjs(data.appointmentDate)
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
      });
      if (data.status.nameCode=='"repairing"') {
      //  const statusId= statusList?.data.find((item)=>item.label==='Success')?.value
        // setstatusIdSuccess(statusId? statusId as Number:-1)
      }
      // console.log("status:",data.status);
      

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
      // If modal is closing, reset all form fields and local state
      resetFormAndState();
    }
  }, [isEditModalOpen, data, serviceCenterForm, selectList]); // Dependencies for this effect

  // Effect to manage which collapse panels are open based on the current status and data
  useEffect(() => {
    if (isEditModalOpen && data && currentStatusId) {
      const newActiveKeys = new Set<string>();
      newActiveKeys.add("pending"); // "Pending" summary is always relevant initially

      const currentActualStepDefinition = statusList?.data.find(
        (step) => step.value === currentStatusId
      );
      const currentOrder = currentActualStepDefinition
        ? statusList?.data.indexOf(currentActualStepDefinition)
        : -1;

      const repairingStepDefinition = statusList?.data.find(
        (s) => s.label === "Repairing"
      );
      const repairingOrder = repairingStepDefinition
        ? statusList?.data.indexOf(repairingStepDefinition)
        : -1;

      const successStepDefinition = statusList?.data.find(
        (s) => s.label === "Success"
      );
      const successOrder = successStepDefinition
        ? statusList?.data.indexOf(successStepDefinition)
        : -1;

      const closedStepId = statusList?.data.find((s) => s.label === "Closed")?.value;

      // Show "Repairing" summary if current status is "Repairing" or beyond, or if there are repairing images
      if (
        repairingOrder !== -1 &&
        (currentOrder >= repairingOrder ||
          data.imageItems?.some((img) => img.imageStatusId === 2))
      ) {
        newActiveKeys.add("repairing");
      }

      // Show "Success" summary if current status is "Success" or "Closed", or if there are success images
      if (
        successOrder !== -1 &&
        (currentOrder >= successOrder ||
          currentStatusId === closedStepId ||
          data.imageItems?.some((img) => img.imageStatusId === 3))
      ) {
        newActiveKeys.add("success");
      }
      setActiveCollapseKeys(Array.from(newActiveKeys));
    } else if (isEditModalOpen) {
      setActiveCollapseKeys(["pending"]); // Default if no data or statusId yet
    }
  }, [currentStatusId, isEditModalOpen, data]);

  // Resets form fields and local component state
  const resetFormAndState = useCallback(() => {
    serviceCenterForm.resetFields();
    setCurrentStepIndex(0);
    setCurrentStatusId(statusList?.data.find((step) => step.label === "Pending")?.value);
    setPendingImages([]);
    setRepairingImages([]);
    setSuccessImages([]);
    setActiveCollapseKeys(["pending"]);
  }, [serviceCenterForm]);

  // Handles closing of the modal
  const handleClose = useCallback(() => {
    resetFormAndState();
    onCancel();
  }, [resetFormAndState, onCancel]);

  // Handles form submission for status updates
  const handleFormSubmit = async (formValues: any) => {
    if (!data || !currentStatusId) {
      console.error(
        "[FormSubmit] Critical data missing (data or currentStatusId). Aborting."
      );
      return;
    }

    // Determine the next status ID based on the current visual step index (currentStepIndex)
    // This logic is preserved from v30/v32 as per user preference.
    let nextStatusId = currentStatusId;
    if (currentStepIndex === 0 && statusList?.data[1]) {
      // Pending -> Waiting for confirmation
      nextStatusId = statusList?.data[1].value;
    } else if (currentStepIndex === 1 && statusList?.data[2]) {
      // Waiting for confirmation -> Confirm appointment
      nextStatusId = statusList?.data[2].value;
    } else if (currentStepIndex === 2 && statusList?.data[3]) {
      // Confirm appointment -> Repairing
      nextStatusId = statusList?.data[3].value;
    } else if (currentStepIndex === 3 && statusList?.data[4]) {
      // Repairing -> Success
      nextStatusId = statusList?.data[4].value;
    }
    // No automatic progression from Success or Closed via this main submit logic.

    ConfirmModal({
      title: `Confirm Action`,
      content: `Are you sure you want to proceed? This may update the status to "${
        getStatusNameById(nextStatusId) || "next step"
      }".`,
      okMessage: "Yes, Proceed",
      cancelMessage: "Cancel",
      onOk: async () => {
        console.log("Form values:", formValues);
        
        try {
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
            appointmentDate: formValues.appointmentDate
              ? [dayjs(formValues.appointmentDate).format("YYYY-MM-DD")]
              : data.appointmentDate,
          };
          await mutationEditServiceCenter.mutateAsync(payload);
          onRefresh(); // Refresh data in the parent component.

          // The following direct state updates are preserved from v30/v32.
          // Ideally, these would be solely managed by the useEffect hook reacting to `data` prop changes.    
          const nextVisualStepIndex = statusList?.data.findIndex(
            (step) => step.value === nextStatusId
          );
          if (nextVisualStepIndex !== -1) {
            setCurrentStepIndex(nextVisualStepIndex?nextVisualStepIndex:currentStepIndex);
            setCurrentStatusId(nextStatusId);
          } else {
            // If nextStatusId is not in STATUS_STEPS (e.g., an invalid transition),
            // or if it's "Closed" and we want to close modal.
            // For v30 behavior, if it's not found, it might imply closing.
            handleClose();
          }
        } catch (error) {
          console.error(
            "[ConfirmModal OK] Failed to update service center:",
            error
          );
        }
      },
    });
  };

  // Handles the action of closing a ticket
  const handleCloseTicket = () => {
    if (!data) return;

    ConfirmModal({
      title: "Close ticket?",
      content: "Are you sure you want to close this ticket?",
      okMessage: "Confirm",
      cancelMessage: "Cancel",
      onOk: async () => {
        try {
          const closedStatus = statusList?.data.find((s) => s.label === "Closed");
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
          handleClose(); // Close modal after successfully closing ticket (as per v30)
        } catch (error) {
          console.error("Failed to close ticket:", error);
        }
      },
    });
  };

  // Renders a summary panel for a specific stage (Pending, Repairing, Success)
  const renderReportSummaryPanel = (
    title: string,
    imageCategory?: "Pending" | "Repairing" | "Success" // Used to pick correct image state
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
            imageCategory && ( // Only show placeholder if it's a defined image category
              <div className="summary-image-container">
                <Image
                  width={150}
                  src={NoImage || "/placeholder.svg"}
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
            {/* Details from the main 'data' prop, relevant if available */}
            {data?.cause && (
              <>
                {" "}
                <dt>Cause</dt> <dd>{data.cause}</dd>{" "}
              </>
            )}
            {data?.solution && (
              <>
                {" "}
                <dt>Solution</dt> <dd>{data.solution}</dd>{" "}
              </>
            )}
            {data?.actionDate && (
              <>
                {" "}
                <dt>Action Date</dt>{" "}
                <dd>{dayjs(data.actionDate).format("YYYY-MM-DD")}</dd>{" "}
              </>
            )}
            {data?.completedDate && (
              <>
                {" "}
                <dt>Completed Date</dt>{" "}
                <dd>{dayjs(data.completedDate).format("YYYY-MM-DD")}</dd>{" "}
              </>
            )}
          </dl>
        </div>
      </Panel>
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
            <div className="pending-appointment-action-group">
              <Form.Item
                label={
                  <span>
                    {" "}
                    Appointment date{" "}
                    <Tooltip title="Select a date for the appointment.">
                      {" "}
                      <InfoCircleOutlined />{" "}
                    </Tooltip>{" "}
                  </span>
                }
                name="appointmentDate"
                rules={requiredRule}>
                <DatePicker
                  size="large"
                  placeholder="Select date"
                  style={{ width: "100%" }}
                />
              </Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                className="send-button-teal">
                {" "}
                Send{" "}
              </Button>
            </div>
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
                onClick={() => {
                  // This logic is preserved from v30.
                  // It sets a form field and then calls the generic submit handler.
                  const confirmAppointmentStatus =statusList?.data.find(
                    (s) => s.label === "Confirm appointment"
                  );
                  if (confirmAppointmentStatus) {
                    serviceCenterForm.setFieldValue(
                      "statusId",
                      Number(confirmAppointmentStatus.value)
                    ); // This field isn't directly used by payload but was in v30
                    handleFormSubmit({}); // Submit with current form values (if any)
                  }
                }}
                size="large">
                User Confirmed (Proceed)
              </Button>
            </div>
          </>
        );

      case "Confirm appointment":
        return (
          <>
            <Form.Item
              label={
                <span>
                  {" "}
                  Action date{" "}
                  <Tooltip title="Date the service action is scheduled.">
                    {" "}
                    <InfoCircleOutlined />{" "}
                  </Tooltip>{" "}
                </span>
              }
              name="actionDate"
              rules={requiredRule}>
              <DatePicker size="large" style={{ width: "100%" }} />
            </Form.Item>
            <div className="action-buttons">
              <a onClick={handleCloseTicket} className="close-ticket-link">
                {" "}
                Close ticket{" "}
              </a>
              <Button
                onClick={() => {
                  const pendingStatus = statusList?.data.find(
                    (s) => s.label === "Pending"
                  );
                  if (pendingStatus) {
                    setCurrentStatusId(pendingStatus.value);
                    const visualStepIndex = statusList?.data.findIndex(
                      (s) => s.value === pendingStatus.value
                    );
                    setCurrentStepIndex(
                      visualStepIndex >= 0 ? visualStepIndex : 0
                    );
                    serviceCenterForm.resetFields([
                      "appointmentDate",
                      "actionDate",
                    ]);
                  }
                }}
                size="large">
                Reschedule
              </Button>
              <Button type="primary" htmlType="submit" size="large">
                {" "}
                Send{" "}
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
                  {" "}
                  Action date{" "}
                  <Tooltip title="Date the service action was performed.">
                    {" "}
                    <InfoCircleOutlined />{" "}
                  </Tooltip>{" "}
                </span>
              }
              name="actionDate" // Often pre-filled or disabled at this stage
            >
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
                    imageStatusId={data.statusId!!}
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
                type="primary"
                htmlType="submit"
                size="large"
                className="send-button-dark-blue">
                {" "}
                Send{" "}
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
          onChange={(keys) => setActiveCollapseKeys(keys as string[])}>
          {renderReportSummaryPanel("Pending", "Pending")}
          {/* Conditionally render Repairing and Success panels based on activeCollapseKeys state */}
          {activeCollapseKeys.includes("repairing") &&
            renderReportSummaryPanel("Repairing", "Repairing")}
          {activeCollapseKeys.includes("success") &&
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
      width={1200}
      footer={null} // Custom footer is handled within ModalContent's action buttons
    />
  );
};

export default ServiceCenterEditModal;
