import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { DeleteImage, EditDataServiceCenter, UploadImage } from "../../../stores/interfaces/ServiceCenter";
import FailedModal from "../../../components/common/FailedModal";
import SuccessModal from "../../../components/common/SuccessModal";

export const editServiceCenterQuery = () => {
    const queryClient = useQueryClient();
    const editServiceCenter = async (payload: EditDataServiceCenter) => {
        switch (payload.currentStatus) {
            case "Pending":
                await axios.put("/service-center/pending", payload);
                break;
            case "Repairing":
                await axios.put("/service-center/repairing", payload);
                break;
            case "Success":
                await axios.put("/service-center/success", payload);
                break;
        }
    };
    const mutation = useMutation({
        mutationFn: (payloadQuery: EditDataServiceCenter) => editServiceCenter(payloadQuery),
        onSuccess: () => {
            SuccessModal("Successfully upload");
            queryClient.invalidateQueries({ queryKey: ["serviceCenterList"] });
            queryClient.invalidateQueries({ queryKey: ["serviceCenterByServiceID"] });
        },
        onError(error: any) {
            if (error?.response?.data?.message) {
                FailedModal(error.response.data.message);
            }
        },
    });
    return mutation;
};
export const deleteImageServiceCenterQuery = () => {
    const deleteImageServiceCenter = async (payload: DeleteImage) => {
        const { data } = await axios.delete("/service-center/delete-image", { data: payload });
        console.log("resp data:", data);
    };
    const mutation = useMutation({
        mutationFn: (payloadQuery: DeleteImage) => deleteImageServiceCenter(payloadQuery),
        onSuccess: () => {
            SuccessModal("Delete Successfully");
        },
        onError(error: any) {
            if (error?.response?.data?.message) {
                FailedModal(error.response.data.message);
            }
        },
    });
    return mutation;
};
export const uploadImageServiceCenterQuery = () => {
    const uploadImageServiceCenter = async (payload: UploadImage) => {
        const { data } = await axios.post("/service-center/upload-image", payload);
        console.log("resp data:", data);

        return data.imageBucket;
    };
    const mutation = useMutation({
        mutationFn: (payloadQuery: UploadImage) => uploadImageServiceCenter(payloadQuery),
        onSuccess: (data) => {
            SuccessModal("Successfully upload");
            return data;
        },
        onError(error: any) {
            if (error?.response?.data?.message) {
                FailedModal(error.response.data.message);
            }
        },
    });
    return mutation;
};
