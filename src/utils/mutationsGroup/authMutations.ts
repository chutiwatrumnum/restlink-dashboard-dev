import { useMutation } from "@tanstack/react-query";
import { AccessTokenType } from "../../stores/interfaces/Auth";
import { useDispatch } from "react-redux";
import { Dispatch } from "../../stores";
import axios from "axios";
import { encryptStorage } from "../../utils/encryptStorage";
import { callFailedModal } from "../../components/common/Modal";
import { JoinPayloadType } from "../../stores/interfaces/JuristicManage";

export const postAuthMutation = (onSuccessCallback?: () => Promise<boolean>) => {
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
      // console.log("Success:", data);
      if (data.status >= 400) {
        const cleanUrl = window.location.origin + "/auth";
        window.history.replaceState({}, "", cleanUrl);
      }
      encryptStorage.setItem("access_token", data.data.access_token);
      encryptStorage.setItem("refreshToken", data.data.refresh_token);

      const projectId = await axios.get("/my-project");
      const access_token = encryptStorage.getItem("access_token");

      if (projectId.data.data) {
        // console.log("success : ", projectId);
        encryptStorage.setItem("projectId", projectId.data.data.myProjectId);
        dispatch.userAuth.updateAuthState(true);
        
        // ใช้ callback สำหรับ custom redirect logic
        if (onSuccessCallback) {
          const hasRedirected = await onSuccessCallback();
          if (hasRedirected) {
            return; // ถ้า redirect แล้วไม่ต้องทำอะไรเพิ่ม
          }
        }
      } else {
        if (access_token !== "undefined") {
          dispatch.userAuth.updateIsSignUpModalOpenState(true);
        }
      }
    },
  });
};

export const postValidateCodeMutation = () => {
  const dispatch = useDispatch<Dispatch>();
  const access_token = encryptStorage.getItem("access_token");
  return useMutation({
    retry: 2,
    scope: {
      id: "validateCode",
    },
    mutationFn: (payload: { code: string }) => {
      console.log("Access token : ", access_token);

      return axios.post(`/my-project/validate-code`, payload);
    },
    onError: (error) => {
      console.warn("Error:", error);
    },
    onSuccess: async (data) => {
      console.log(data);

      if (data.status >= 400) {
        callFailedModal(data.data.message);
        console.log("Success", data);
        throw "Something went wrong!";
      }
      dispatch.userAuth.updateIsConfirmDetailModalOpenState(true);
    },
  });
};

export const postJoinMutation = () => {
  const dispatch = useDispatch<Dispatch>();
  return useMutation({
    retry: 2,
    scope: {
      id: "joinJuristic",
    },
    mutationFn: (payload: JoinPayloadType) => {
      return axios.post(`/my-project/join`, payload);
    },
    onError: (error) => {
      console.warn("Error:", error);
    },
    onSuccess: async () => {
      // console.log(data);
      dispatch.userAuth.updateIsConfirmDetailModalOpenState(false);
    },
  });
};
