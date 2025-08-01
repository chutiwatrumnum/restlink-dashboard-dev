import { useMutation } from "@tanstack/react-query";
import { ResidentAddNew } from "../../stores/interfaces/ResidentInformation";
import axios from "axios";

export const postCreateResidentMutation = () => {
  return useMutation({
    retry: 2,
    scope: {
      id: "createResident",
    },
    mutationFn: (payload: ResidentAddNew) => {
      return axios.post(`/users/invitation/resident/create`, payload);
    },
  });
};
