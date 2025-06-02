import { createModel } from "@rematch/core";
import { message } from "antd";
import {
  UserType,
  LoginPayloadType,
  ResetPasswordPayloadType,
} from "../interfaces/User";
import { RootModel } from "./index";
import { encryptStorage } from "../../utils/encryptStorage";
import FailedModal from "../../components/common/FailedModal";
import axios from "axios";

export const userAuth = createModel<RootModel>()({
  state: {
    userId: null,
    userFirstName: "Den",
    userLastName: "Tao",
    isAuth: false,
    userToken: null,
  } as UserType,
  reducers: {
    updateUserIdState: (state, payload) => ({
      ...state,
      userId: payload,
    }),
    updateUserFirstNameState: (state, payload) => ({
      ...state,
      userFirstName: payload,
    }),
    updateUserLastNameState: (state, payload) => ({
      ...state,
      userLastName: payload,
    }),
    updateAuthState: (state, payload) => ({
      ...state,
      isAuth: payload,
    }),
  },
  effects: (dispatch) => ({
    async loginEffects(payload: LoginPayloadType) {
      try {
        const data = { username: payload.username, password: payload.password };
        const userToken = await axios.post("/auth/dashboard/login", data);
        if (userToken.status >= 400) {
          FailedModal(userToken.data.message);
          return;
        }

        encryptStorage.setItem("access_token", userToken.data.access_token);
        encryptStorage.setItem("refreshToken", userToken.data.refreshToken);
        const userData = await axios.get("/mcst/profile");
        encryptStorage.setItem("userData", userData.data.result);
        dispatch.userAuth.updateAuthState(true);
      } catch (error) {
        console.error("ERROR", error);
      }
    },
    async recoveryByEmail(payload: { email: string }) {
      try {
        const result = await axios.post("/users/forgot-password", payload);
        if (result.status >= 400) {
          console.error(result.data.message);
          FailedModal(result.data.message);
          return;
        }
        return true;
      } catch (error) {
        console.error("ERROR", error);
      }
    },
    async resetPassword(payload: ResetPasswordPayloadType) {
      try {
        const result = await axios.put("/users/forgot-password", payload);
        if (result.status >= 400) {
          message.error(result.data.message);
          return false;
        }
        return true;
      } catch (error) {
        console.error("ERROR", error);
      }
    },

    async refreshTokenNew() {
      try {
        const refreshToken = await encryptStorage.getItem("refreshToken");
        // console.log("REFRESH : ", refreshToken);
        const res = await axios.post("/auth/dashboard/refresh-token", {
          refreshToken: refreshToken,
        });

        if (res.status >= 400) {
          console.error(">400 : ", res.data.message);
          throw "refresh token expired";
        }
        if (!res.data.hasOwnProperty("access_token")) {
          console.error("No props : ", res.data.message);
          throw "access_token not found";
        }

        const projectId = await encryptStorage.getItem("projectId");
        // console.log({ token: res.data.access_token, projId: projectId });
        encryptStorage.setItem("access_token", res.data.access_token);
        dispatch.userAuth.updateAuthState(true);
        return true;
      } catch (error) {
        console.warn("FAILED");
        dispatch.userAuth.updateAuthState(false);
        await axios.post("/users/logout");
        encryptStorage.removeItem("access_token");
        encryptStorage.removeItem("refreshToken");
        return false;
      }
    },

    async onLogout() {
      try {
        await axios.post("/users/logout");
        encryptStorage.removeItem("projectId");
        encryptStorage.removeItem("access_token");
        encryptStorage.removeItem("refreshToken");
        dispatch.userAuth.updateAuthState(false);
        return true;
      } catch (error) {
        dispatch.userAuth.updateAuthState(false);
        encryptStorage.removeItem("projectId");
        encryptStorage.removeItem("access_token");
        encryptStorage.removeItem("refreshToken");
        return false;
      }
    },
    async logoutEffects() {
      try {
        // const logout = await axios.post("/users/logout");
        // if (logout.status >= 400) {
        //   console.log("FAILED ", logout.statusText);
        //   return;
        // }
        dispatch.userAuth.updateAuthState(false);
        encryptStorage.removeItem("projectId");
        encryptStorage.removeItem("access_token");
        encryptStorage.removeItem("refreshToken");
      } catch (error) {
        console.error("ERROR", error);
      }
    },
  }),
});
