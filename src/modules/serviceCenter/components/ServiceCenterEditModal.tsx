import { useState, useEffect } from "react";
import { Form, Input, Select, DatePicker, UploadFile } from "antd";
import { noSpacialInputRule, requiredRule } from "../../../configs/inputRule";
import dayjs from "dayjs";
import ServiceImageGallery from "./serviceCenterImage";
import FormModal from "../../../components/common/FormModal";
import SmallButton from "../../../components/common/SmallButton";
import ConfirmModal from "../../../components/common/ConfirmModal";
import { disableColumnServiceCenter, EditDataServiceCenter, ImageItem, ServiceCenterDataType, ServiceCenterSelectListType } from "../../../stores/interfaces/ServiceCenter";
import { editServiceCenterQuery } from "../hooks/serviceCenterMutation";
type ServiceCenterEditModalType = {
    isEditModalOpen: boolean;
    onOk: () => void;
    onCancel: () => void;
    data: ServiceCenterDataType | null;
    onRefresh: () => void;
    selectList: ServiceCenterSelectListType[];
};

const ServiceCenterEditModal = ({ isEditModalOpen, onOk, onCancel, data, onRefresh, selectList }: ServiceCenterEditModalType) => {
    const [serviceCenterForm] = Form.useForm();
    const [open, setOpen] = useState(false);
    const [imagePendingList, setImagePendingList] = useState<UploadFile[]>([]);
    const [imageRepairingList, setImageRepairingList] = useState<UploadFile[]>([]);
    const [imageSuccessList, setImageSuccessList] = useState<UploadFile[]>([]);
    const [currentStatus, setCurrentStatus] = useState<ServiceCenterSelectListType>({
        label: data?.statusName!,
        value: data ? data.statusId!.toString() : "",
    });
    const [disableColumn, setDisableColumn] = useState<disableColumnServiceCenter>({
        actionDate: true,
        cause: true,
        solution: true,
        completedDate: true,
        acknowledgeDate: false,
    });
    const mutationEditServiceCenter = editServiceCenterQuery();
    const onClose = () => {
        serviceCenterForm.resetFields();
        onCancel();
        setImagePendingList([]);
        setImageRepairingList([]);
        setImageSuccessList([]);
        setCurrentStatus({
            label: data?.statusName!,
            value: data ? data.statusId!.toString() : "",
        });
    };

    useEffect(() => {
        setOpen(isEditModalOpen);
    }, [isEditModalOpen]);

    useEffect(() => {
        if (data) {
            setCurrentStatus({
                label: data?.statusName!,
                value: data ? data.statusId!.toString() : "",
            });
            serviceCenterForm.setFieldsValue(data);
            if (data.createdAt) {
                serviceCenterForm.setFieldValue("createdAt", dayjs(data.createdAt));
            }
            if (data.acknowledgeDate) {
                serviceCenterForm.setFieldValue("acknowledgeDate", dayjs(data.acknowledgeDate));
            }
            if (data.actionDate) {
                serviceCenterForm.setFieldValue("actionDate", dayjs(data.actionDate));
            }
            if (data.completedDate) {
                serviceCenterForm.setFieldValue("completedDate", dayjs(data.completedDate));
            }
            data.imageItems.map((item: ImageItem) => {
                const image: UploadFile = {
                    uid: item.id.toString(),
                    name: "",
                    url: item.imageUrl,
                };
                switch (item.imageStatus.nameEn) {
                    case "Pending":
                        setImagePendingList((prev) => [...prev, image]);
                        break;
                    case "Repairing":
                        setImageRepairingList((prev) => [...prev, image]);
                        break;
                    case "Success":
                        setImageSuccessList((prev) => [...prev, image]);
                        break;
                    default:
                        break;
                }
            });
        }
    }, [data]);

    useEffect(() => {
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
        }
    }, [currentStatus]);

    const ModalContent = () => {
        return (
            <Form
                form={serviceCenterForm}
                name="serviceCenterEditModal"
                initialValues={{ remember: true }}
                autoComplete="off"
                layout="vertical"
                onFinish={async (value) => {
                    ConfirmModal({
                        title: "Are you sure you want to edit this?",
                        okMessage: "Yes",
                        cancelMessage: "Cancel",
                        onOk: async () => {
                            const payload: EditDataServiceCenter = {
                                currentStatus: currentStatus.label,
                                id: data?.id!,
                                statusId: Number(currentStatus.value),
                                acknowledgeDate: value.acknowledgeDate,
                                actionDate: value.actionDate,
                                cause: value.cause,
                                completedDate: value.completedDate,
                                solution: value.solution,
                            };
                            await mutationEditServiceCenter.mutateAsync(payload);
                            setImagePendingList([]);
                            setImageRepairingList([]);
                            setImageSuccessList([]);
                            setCurrentStatus({
                                label: data?.statusName!,
                                value: data ? data.statusId!.toString() : "",
                            });
                            serviceCenterForm.resetFields();
                            onOk();
                            onRefresh();
                            mutationEditServiceCenter.reset();
                        },
                        onCancel: () => console.log("Cancel"),
                    });
                }}
                onFinishFailed={() => {
                    console.log("FINISHED FAILED");
                }}
            >
                <div className="announceModalColumn">
                    <div className="announceModalContainer">
                        <div className="announceModalColumn">
                            <Form.Item<ServiceCenterDataType> label="Owner" name="fullname" rules={noSpacialInputRule}>
                                <Input size="large" disabled={true} placeholder="Please input fullname" />
                            </Form.Item>
                            <Form.Item<ServiceCenterDataType> label="Submission Date" name="createdAt" rules={requiredRule}>
                                <DatePicker disabled={true} style={{ width: "100%" }} size="large" />
                            </Form.Item>
                            <Form.Item<ServiceCenterDataType> label="Action Date" name="actionDate" rules={!disableColumn.actionDate ? requiredRule : undefined}>
                                <DatePicker disabled={disableColumn.actionDate} style={{ width: "100%" }} size="large" />
                            </Form.Item>
                            <ServiceImageGallery title="Pending" maximum={1} disabledUpload={true} oldFileList={imagePendingList} imageStatusId={Number(currentStatus.value!)} serviceId={data?.id!!} />

                            <ServiceImageGallery title="Repairing" maximum={3} disabledUpload={currentStatus.label === "Repairing" ? false : true} oldFileList={imageRepairingList} imageStatusId={Number(currentStatus.value!)} serviceId={data?.id!!} />

                            <ServiceImageGallery title="Success" maximum={3} disabledUpload={currentStatus.label === "Success" ? false : true} oldFileList={imageSuccessList} imageStatusId={Number(currentStatus.value!)} serviceId={data?.id!!} />
                        </div>
                        <div className="announceModalColumn">
                            <Form.Item<ServiceCenterDataType> label="Status" name="statusName" rules={requiredRule}>
                                <Select
                                    onChange={(value: string) => {
                                        const data = selectList?.find((item: ServiceCenterSelectListType) => item.value === value);
                                        setCurrentStatus(data!!);
                                    }}
                                    size="large"
                                    placeholder="Please select service type"
                                    options={selectList?.length > 0 ? selectList : undefined}
                                />
                            </Form.Item>
                            <Form.Item<ServiceCenterDataType> label="Problem" name="serviceTypeName">
                                <Input size="large" disabled={true} placeholder="Please input Problem" />
                            </Form.Item>
                            <Form.Item<ServiceCenterDataType> label="Acknowledge Date" name="acknowledgeDate" rules={!disableColumn.acknowledgeDate ? requiredRule : undefined}>
                                <DatePicker disabled={disableColumn.acknowledgeDate} style={{ width: "100%" }} size="large" />
                            </Form.Item>
                            <Form.Item<ServiceCenterDataType> label="Completed Date" name="completedDate" rules={!disableColumn.completedDate ? requiredRule : undefined}>
                                <DatePicker disabled={disableColumn.completedDate} style={{ width: "100%" }} size="large" />
                            </Form.Item>
                            <Form.Item<ServiceCenterDataType>
                                label="Description"
                                name="description"
                                // rules={requiredRule}
                            >
                                <Input.TextArea disabled={true} rows={7} placeholder="Please input description" />
                            </Form.Item>
                        </div>
                        <div className="announceModalColumn">
                            <Form.Item<ServiceCenterDataType> label="cause" name="cause" rules={!disableColumn.cause ? requiredRule : undefined}>
                                <Input.TextArea disabled={disableColumn.cause} rows={7} placeholder="Please input description" />
                            </Form.Item>
                            <Form.Item<ServiceCenterDataType> label="Solution" name="solution" rules={!disableColumn.solution ? requiredRule : undefined}>
                                <Input.TextArea disabled={disableColumn.solution} rows={7} placeholder="Please input description" />
                            </Form.Item>
                        </div>
                    </div>
                    <SmallButton className="saveButton" message="Save" form={serviceCenterForm} />
                </div>
            </Form>
        );
    };

    return (
        <>
            <FormModal isOpen={open} title="Manage Report" content={<ModalContent />} onOk={onOk} onCancel={onClose} className="announceFormModal" />
        </>
    );
};

export default ServiceCenterEditModal;
