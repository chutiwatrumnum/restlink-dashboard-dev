import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import SuccessModal from "../../components/common/SuccessModal";
import { message } from "antd";
import { useQueryClient } from "@tanstack/react-query";
import { PeopleCountingFormDataType } from "../../stores/interfaces/PeopleCounting";

// ===== Utilities =====
const extractApiError = (error: any) =>
  error?.response?.data?.message ||
  error?.response?.data?.data?.message ||
  (error?.response
    ? `API Error: ${error.response.status}`
    : error?.message || "Unknown error");

// PUT: edit people counting
export const putEditPeopleCountingMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    retry: 1,
    scope: { id: "editPeopleCounting" },
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: PeopleCountingFormDataType;
    }) => {
      try {
        const endpoint = `people-counting/dashboard/space/${id}`;
        const apiPayload = {
          image: payload.image,
          name: payload.name,
          description: payload.description,
          statusLow: payload.statusLow,
          statusMedium: payload.statusMedium,
          statusHigh: payload.statusHigh,
          sort: payload.sort,
          active: payload.active,
          cameraIp: payload.cameraIp,
          icon: payload.icon,
        };
        console.log("API Payload update people counting:", apiPayload);
        const response = await axios.put(endpoint, apiPayload);
        if (response.status >= 400)
          throw new Error(response.data?.message || "Update failed");
        return response.data;
      } catch (error: any) {
        throw new Error(extractApiError(error));
      }
    },
    onSuccess: (data) => {
      console.log("Edit people counting success: ", data);
      // SuccessModal("Success");
      // message.success("Project edit successfully!");
      queryClient.invalidateQueries({ queryKey: ["peopleCounting"] });
    },
    onError: (error: any) => {
      console.error("Edit people counting error:", error);
      message.error(error.message || "Failed to update people counting");
    },
  });
};
