import { useState, useEffect, useCallback } from "react";
import { Form, Input, Select, DatePicker, UploadFile } from "antd";
import { noSpacialInputRule, requiredRule } from "../../../configs/inputRule";
import dayjs from "dayjs";
import ServiceImageGallery from "./serviceCenterImage";
import FormModal from "../../../components/common/FormModal";
import SmallButton from "../../../components/common/SmallButton";
import ConfirmModal from "../../../components/common/ConfirmModal";
import {
  disableColumnServiceCenter,
  EditDataServiceCenter,
  ImageItem,
  ServiceCenterDataType,
  ServiceCenterSelectListType,
} from "../../../stores/interfaces/ServiceCenter";
import { editServiceCenterQuery } from "../hooks/serviceCenterMutation";

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
  const [imagePendingList, setImagePendingList] = useState<UploadFile[]>([]);
  const [imageRepairingList, setImageRepairingList] = useState<UploadFile[]>(
    []
  );
  const [imageSuccessList, setImageSuccessList] = useState<UploadFile[]>([]);
  const [currentStatus, setCurrentStatus] =
    useState<ServiceCenterSelectListType>({
      label: "",
      value: "",
    });
  const [disableColumn, setDisableColumn] =
    useState<disableColumnServiceCenter>({
      actionDate: true,
      cause: true,
      solution: true,
      completedDate: true,
      acknowledgeDate: false,
    });

  const mutationEditServiceCenter = editServiceCenterQuery();

  // Initialize data when component mounts or data changes
  useEffect(() => {
    if (data) {
      console.log("Data changed:", data);
      initializeFormData();
    }
  }, [data]);

  // Update modal visibility
  useEffect(() => {
    setOpen(isEditModalOpen);
    if (isEditModalOpen) {
      console.log("Modal opened with data:", data);
      console.log("Select list options:", selectList);
    }
  }, [isEditModalOpen, data, selectList]);

  // Update disabled columns based on current status
  useEffect(() => {
    updateDisabledColumns();
    console.log("Current status updated:", currentStatus);
    console.log("Disabled columns:", disableColumn);
  }, [currentStatus]);

  const initializeFormData = useCallback(() => {
    if (!data) return;

    console.log("Initializing form data with:", {
      id: data.id,
      statusId: data.statusId,
      statusName: data.statusName,
      fullname: data.fullname,
      serviceTypeName: data.serviceTypeName,
      description: data.description,
      createdAt: data.createdAt,
      acknowledgeDate: data.acknowledgeDate,
      actionDate: data.actionDate,
      completedDate: data.completedDate,
      cause: data.cause,
      solution: data.solution,
    });

    // Set current status
    setCurrentStatus({
      label: data.statusName || "",
      value: data.statusId?.toString() || "",
    });

    // Set form values
    serviceCenterForm.setFieldsValue({
      ...data,
      createdAt: data.createdAt ? dayjs(data.createdAt) : undefined,
      acknowledgeDate: data.acknowledgeDate
        ? dayjs(data.acknowledgeDate)
        : undefined,
      actionDate: data.actionDate ? dayjs(data.actionDate) : undefined,
      completedDate: data.completedDate ? dayjs(data.completedDate) : undefined,
    });

    // Initialize image lists
    initializeImageLists();
  }, [data, serviceCenterForm]);

  const initializeImageLists = useCallback(() => {
    if (!data?.imageItems) return;

    console.log("Initializing image lists with:", data.imageItems);

    // Reset all image lists
    const pending: UploadFile[] = [];
    const repairing: UploadFile[] = [];
    const success: UploadFile[] = [];

    data.imageItems.forEach((item: ImageItem) => {
      const image: UploadFile = {
        uid: item.id.toString(),
        name: "",
        url: item.imageUrl,
      };

      switch (item.imageStatus.nameEn) {
        case "Pending":
          pending.push(image);
          break;
        case "Repairing":
          repairing.push(image);
          break;
        case "Success":
          success.push(image);
          break;
      }
    });

    console.log("Processed image lists:", {
      pending,
      repairing,
      success,
    });

    setImagePendingList(pending);
    setImageRepairingList(repairing);
    setImageSuccessList(success);
  }, [data]);

  const updateDisabledColumns = useCallback(() => {
    console.log(
      "Updating disabled columns based on status:",
      currentStatus.label
    );

    switch (currentStatus.label) {
      case "Pending":
        setDisableColumn({
          actionDate: true,
          cause: true,
          solution: true,
          completedDate: true,
          acknowledgeDate: false,
        });
        break;
      case "Repairing":
        setDisableColumn({
          actionDate: false,
          cause: false,
          solution: true,
          completedDate: true,
          acknowledgeDate: false,
        });
        break;
      case "Success":
        setDisableColumn({
          actionDate: true,
          cause: false,
          solution: false,
          completedDate: false,
          acknowledgeDate: true,
        });
        break;
      default:
        setDisableColumn({
          actionDate: true,
          cause: true,
          solution: true,
          completedDate: true,
          acknowledgeDate: false,
        });
    }
  }, [currentStatus]);

  const resetForm = useCallback(() => {
    console.log("Resetting form");
    serviceCenterForm.resetFields();
    setImagePendingList([]);
    setImageRepairingList([]);
    setImageSuccessList([]);
    setCurrentStatus({
      label: "",
      value: "",
    });
  }, [serviceCenterForm]);

  const handleClose = useCallback(() => {
    console.log("Closing modal");
    resetForm();
    onCancel();
  }, [resetForm, onCancel]);

  const handleStatusChange = useCallback(
    (value: string) => {
      console.log("Status changed to:", value);
      const selectedStatus = selectList?.find(
        (item: ServiceCenterSelectListType) => item.value === value
      );
      if (selectedStatus) {
        console.log("Selected status:", selectedStatus);
        setCurrentStatus(selectedStatus);
      }
    },
    [selectList]
  );

  const handleSave = useCallback(
    async (values: any) => {
      console.log("Form values to save:", values);
      console.log("Current status:", currentStatus);

      ConfirmModal({
        title: "Are you sure you want to edit this?",
        okMessage: "Yes",
        cancelMessage: "Cancel",
        onOk: async () => {
          try {
            const payload: EditDataServiceCenter = {
              currentStatus: currentStatus.label,
              id: data?.id!,
              statusId: Number(currentStatus.value),
              acknowledgeDate: values.acknowledgeDate,
              actionDate: values.actionDate,
              cause: values.cause,
              completedDate: values.completedDate,
              solution: values.solution,
            };

            console.log("Sending payload:", payload);
            await mutationEditServiceCenter.mutateAsync(payload);
            console.log("Edit successful");
            resetForm();
            onOk();
            onRefresh();
            mutationEditServiceCenter.reset();
          } catch (error) {
            console.error("Failed to save:", error);
          }
        },
        onCancel: () => console.log("Cancel"),
      });
    },
    [currentStatus, data, mutationEditServiceCenter, resetForm, onOk, onRefresh]
  );

  const ModalContent = () => {
    // Extract statusId as a number for image galleries
    const statusId = Number(currentStatus.value) || 0;
    const serviceId = data?.id || 0;

    return (
      <Form
        form={serviceCenterForm}
        name="serviceCenterEditModal"
        initialValues={{ remember: true }}
        autoComplete="off"
        layout="vertical"
        onFinish={handleSave}
        onFinishFailed={(error) => {
          console.log("FORM VALIDATION FAILED:", error);
        }}>
        <div className="announceModalColumn">
          <div className="announceModalContainer">
            <div className="announceModalColumn">
              <Form.Item<ServiceCenterDataType>
                label="Owner"
                name="fullname"
                rules={noSpacialInputRule}>
                <Input
                  size="large"
                  disabled={true}
                  placeholder="Please input fullname"
                />
              </Form.Item>

              <Form.Item<ServiceCenterDataType>
                label="Submission Date"
                name="createdAt"
                rules={requiredRule}>
                <DatePicker
                  disabled={true}
                  style={{ width: "100%" }}
                  size="large"
                />
              </Form.Item>

              <Form.Item<ServiceCenterDataType>
                label="Action Date"
                name="actionDate"
                rules={!disableColumn.actionDate ? requiredRule : undefined}>
                <DatePicker
                  disabled={disableColumn.actionDate}
                  style={{ width: "100%" }}
                  size="large"
                />
              </Form.Item>

              <ServiceImageGallery
                title="Pending"
                maximum={1}
                disabledUpload={true}
                oldFileList={imagePendingList}
                imageStatusId={statusId}
                serviceId={serviceId}
              />

              <ServiceImageGallery
                title="Repairing"
                maximum={3}
                disabledUpload={currentStatus.label !== "Repairing"}
                oldFileList={imageRepairingList}
                imageStatusId={statusId}
                serviceId={serviceId}
              />

              <ServiceImageGallery
                title="Success"
                maximum={3}
                disabledUpload={currentStatus.label !== "Success"}
                oldFileList={imageSuccessList}
                imageStatusId={statusId}
                serviceId={serviceId}
              />
            </div>

            <div className="announceModalColumn">
              <Form.Item<ServiceCenterDataType>
                label="Status"
                name="statusName"
                rules={requiredRule}>
                <Select
                  onChange={handleStatusChange}
                  size="large"
                  placeholder="Please select service type"
                  options={selectList?.length > 0 ? selectList : []}
                />
              </Form.Item>

              <Form.Item<ServiceCenterDataType>
                label="Problem"
                name="serviceTypeName">
                <Input
                  size="large"
                  disabled={true}
                  placeholder="Please input Problem"
                />
              </Form.Item>

              <Form.Item<ServiceCenterDataType>
                label="Acknowledge Date"
                name="acknowledgeDate"
                rules={
                  !disableColumn.acknowledgeDate ? requiredRule : undefined
                }>
                <DatePicker
                  disabled={disableColumn.acknowledgeDate}
                  style={{ width: "100%" }}
                  size="large"
                />
              </Form.Item>

              <Form.Item<ServiceCenterDataType>
                label="Completed Date"
                name="completedDate"
                rules={!disableColumn.completedDate ? requiredRule : undefined}>
                <DatePicker
                  disabled={disableColumn.completedDate}
                  style={{ width: "100%" }}
                  size="large"
                />
              </Form.Item>

              <Form.Item<ServiceCenterDataType>
                label="Description"
                name="description">
                <Input.TextArea
                  disabled={true}
                  rows={7}
                  placeholder="Please input description"
                />
              </Form.Item>
            </div>

            <div className="announceModalColumn">
              <Form.Item<ServiceCenterDataType>
                label="Cause"
                name="cause"
                rules={!disableColumn.cause ? requiredRule : undefined}>
                <Input.TextArea
                  disabled={disableColumn.cause}
                  rows={7}
                  placeholder="Please input cause"
                />
              </Form.Item>

              <Form.Item<ServiceCenterDataType>
                label="Solution"
                name="solution"
                rules={!disableColumn.solution ? requiredRule : undefined}>
                <Input.TextArea
                  disabled={disableColumn.solution}
                  rows={7}
                  placeholder="Please input solution"
                />
              </Form.Item>
            </div>
          </div>
          <SmallButton
            className="saveButton"
            message="Save"
            form={serviceCenterForm}
          />
        </div>
      </Form>
    );
  };

  return (
    <FormModal
      isOpen={open}
      title="Manage Report"
      content={<ModalContent />}
      onOk={onOk}
      onCancel={handleClose}
      className="announceFormModal"
    />
  );
};

export default ServiceCenterEditModal;
