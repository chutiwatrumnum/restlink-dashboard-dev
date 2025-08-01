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
import { callSuccessModal } from "../../components/common/Modal";
import axios from "axios";

export const userAuth = createModel<RootModel>()({
  state: {
    userId: null,
    userFirstName: "Den",
    userLastName: "Tao",
    isAuth: false, // เปลี่ยนจาก true เป็น false
    userToken: null,
    isSignUpModalOpen: false,
    isConfirmDetailModalOpen: false,
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
    updateIsSignUpModalOpenState: (state, payload) => ({
      ...state,
      isSignUpModalOpen: payload,
    }),
    updateIsConfirmDetailModalOpenState: (state, payload) => ({
      ...state,
      isConfirmDetailModalOpen: payload,
    }),
  },
  effects: (dispatch) => ({
    async loginEffects(payload: LoginPayloadType) {
      try {
        const data = { username: payload.username, password: payload.password };
        const userToken = await axios.post("/auth/dashboard/login", data);

        if (userToken.status >= 400) {
          FailedModal(userToken.data.message || "Login failed");
          return false;
        }

        // เก็บ tokens
        encryptStorage.setItem("access_token", userToken.data.access_token);
        if (userToken.data.refreshToken) {
          encryptStorage.setItem("refreshToken", userToken.data.refreshToken);
        } else if (userToken.data.refresh_token) {
          encryptStorage.setItem("refreshToken", userToken.data.refresh_token);
        }

        try {
          // ลองเรียก API เพื่อเช็ค project ID
          const projectId = await axios.get("/my-project");
          if (
            projectId.data &&
            projectId.data.data &&
            projectId.data.data.myProjectId
          ) {
            encryptStorage.setItem(
              "projectId",
              projectId.data.data.myProjectId
            );
          }
        } catch (error) {
          console.log("Project ID not found, but login successful");
          // ไม่ต้อง throw error เพราะ login สำเร็จแล้ว
        }

        try {
          // ลองเรียก profile API (ถ้ามี)
          const userData = await axios.get("/mcst/profile");
          if (userData.data && userData.data.result) {
            encryptStorage.setItem("userData", userData.data.result);
          }
        } catch (error) {
          console.log("Profile data not available, but login successful");
          // ไม่ต้อง throw error เพราะ login สำเร็จแล้ว
        }

        // อัพเดท auth state
        dispatch.userAuth.updateAuthState(true);

        // แสดง success message
        callSuccessModal("Login successful!");

        // ไม่ต้อง manual redirect ให้ useEffect ใน layout จัดการเอง

        return true;
      } catch (error) {
        console.error("Login ERROR:", error);
        FailedModal("Login failed. Please try again.");
        return false;
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

        if (!refreshToken || refreshToken === "undefined") {
          console.error("No refresh token available");
          throw "refresh token not found";
        }

        console.log("🔄 Attempting to refresh token...");
        const res = await axios.post("/auth/dashboard/refresh-token", {
          refreshToken: refreshToken,
        });

        if (res.status >= 400) {
          console.error("Refresh token API error:", res.data.message);
          throw "refresh token expired";
        }

        if (!res.data.hasOwnProperty("access_token")) {
          console.error("No access_token in response:", res.data);
          throw "access_token not found";
        }

        console.log("✅ Token refreshed successfully");
        encryptStorage.setItem("access_token", res.data.access_token);

        // อัพเดท refresh token ใหม่ถ้ามี
        if (res.data.refresh_token) {
          encryptStorage.setItem("refreshToken", res.data.refresh_token);
        }

        dispatch.userAuth.updateAuthState(true);
        return true;
      } catch (error) {
        console.error("Refresh token failed:", error);
        dispatch.userAuth.onLogout();
        return false;
      }
    },

    async onLogout() {
      try {
        encryptStorage.removeItem("projectId");
        encryptStorage.removeItem("access_token");
        encryptStorage.removeItem("refreshToken");
        encryptStorage.removeItem("userData");
        dispatch.userAuth.updateAuthState(false);
        return true;
      } catch (error) {
        encryptStorage.removeItem("projectId");
        encryptStorage.removeItem("access_token");
        encryptStorage.removeItem("refreshToken");
        encryptStorage.removeItem("userData");
        dispatch.userAuth.updateAuthState(false);
        return false;
      }
    },
  }),
});
