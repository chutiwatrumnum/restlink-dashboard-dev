import { useMutation } from "@tanstack/react-query";
import { JuristicAddNew } from "../../stores/interfaces/JuristicManage";
import axios from "axios";

export const postCreateJuristicMutation = () => {
  return useMutation({
    retry: 2,
    scope: {
      id: "createJuristic",
    },
    mutationFn: (payload: JuristicAddNew) => {
      return axios.post(`/team-management/invitation/juristic/create`, payload);
    },
  });
};
