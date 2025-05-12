import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AccessTokenType } from "../../stores/interfaces/Auth";
import { useDispatch } from "react-redux";
import { Dispatch } from "../../stores";
import axios from "axios";
import { encryptStorage } from "../../utils/encryptStorage";
import FailedModal from "../../components/common/FailedModal";

export const postAuthMutation = () => {
  const dispatch = useDispatch<Dispatch>();

  return useMutation({
    retry: 2,
    scope: {
      id: "access_token",
    },
    mutationFn: (payload: AccessTokenType) => {
      return axios.post(`/auth/dashboard/google`, payload);
    },
    onError: (error) => {
      console.warn("Error:", error);
    },
    onSuccess: async (data) => {
      //   console.log("Success:", data);
      encryptStorage.setItem("access_token", data.data.access_token);
      encryptStorage.setItem("refreshToken", data.data.refresh_token);

      const projectId = await axios.get("/my-project");

      if (projectId.data.data) {
        // console.log("success : ", projectId);
        encryptStorage.setItem("projectId", projectId.data.data.myProjectId);
        dispatch.userAuth.updateAuthState(true);
      } else {
        // console.log("err", projectId);
        FailedModal(
          "This user has not been registered. Please contact the appropriate authority."
        );
        encryptStorage.removeItem("access_token");
        encryptStorage.removeItem("refreshToken");
        dispatch.userAuth.updateAuthState(false);
      }
    },
  });
};
