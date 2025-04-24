import { useMutation } from "@tanstack/react-query";
import { AccessTokenType } from "../../stores/interfaces/Auth";
import { useDispatch } from "react-redux";
import { Dispatch } from "../../stores";
import axios from "axios";
import { encryptStorage } from "../../utils/encryptStorage";

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
    onSuccess: (data) => {
      //   console.log("Success:", data);
      encryptStorage.setItem("access_token", data.data.access_token);
      encryptStorage.setItem("refreshToken", data.data.refresh_token);
      dispatch.userAuth.updateAuthState(true);
    },
  });
};
