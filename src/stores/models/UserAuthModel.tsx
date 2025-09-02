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
import { clearIntendedDestination } from "../../utils/googleAuth";

export const userAuth = createModel<RootModel>()({
  state: {
    userId: null,
    userFirstName: "Den",
    userLastName: "Tao",
    isAuth: false,
    userToken: null,
    isSignUpModalOpen: false,
    isConfirmDetailModalOpen: false,
    // เพิ่ม state สำหรับ VMS
    vmsUrl: null,
    vmsToken: null,
    roleName: null,
  } as UserType & {
    vmsUrl: string | null;
    vmsToken: string | null;
    roleName: string | null;
  },
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
    // เพิ่ม reducers สำหรับ VMS
    updateVmsState: (state, payload) => ({
      ...state,
      vmsUrl: payload.vmsUrl,
      vmsToken: payload.vmsToken,
      roleName: payload.roleName,
    }),
  },
  effects: (dispatch) => ({
    async loginEffects(payload: LoginPayloadType) {
      try {
        const data = { username: payload.username, password: payload.password };

        // Step 1: Login เพื่อเอา access_token
        const userToken = await axios.post("/auth/dashboard/login", data);

        if (userToken.status >= 400) {
          FailedModal(userToken.data.message || "Login failed");
          return false;
        }

        // เก็บ tokens จาก login
        encryptStorage.setItem("access_token", userToken.data.access_token);
        if (userToken.data.refreshToken) {
          encryptStorage.setItem("refreshToken", userToken.data.refreshToken);
        } else if (userToken.data.refresh_token) {
          encryptStorage.setItem("refreshToken", userToken.data.refresh_token);
        }

        try {
          // Step 2: เรียก /my-project เพื่อเอา projectId และ VMS data
          const projectResponse = await axios.get("/my-project");

          if (projectResponse.data && projectResponse.data.data) {
            const projectData = projectResponse.data.data;

            // เก็บ projectId แบบเดิม
            if (projectData.myProjectId) {
              encryptStorage.setItem("projectId", projectData.myProjectId);
            }

            // เก็บข้อมูล VMS ใหม่
            if (projectData.vmsUrl && projectData.vmsToken) {
              const vmsData = {
                vmsUrl: projectData.vmsUrl,
                vmsToken: projectData.vmsToken,
                roleName: projectData.roleName || null,
              };

              // เก็บลง encrypted storage
              encryptStorage.setItem("vmsUrl", projectData.vmsUrl);
              encryptStorage.setItem("vmsToken", projectData.vmsToken);
              if (projectData.roleName) {
                encryptStorage.setItem("roleName", projectData.roleName);
              }
              // อัพเดท state
              dispatch.userAuth.updateVmsState(vmsData);
            }
          }
        } catch (error) {
          console.log("Project/VMS data not found, but login successful");
          // ไม่ต้อง throw error เพราะ login สำเร็จแล้ว
        }

        try {
          // ลองเรียก profile API (ถ้ามี)
          const userData = await axios.get("/user/profile");
          if (userData.data && userData.data.result) {
            encryptStorage.setItem("userData", userData.data.result);
          }
        } catch (error) {
          console.log("Profile data not available, but login successful");
        }

        // อัพเดท auth state
        dispatch.userAuth.updateAuthState(true);

        // แสดง success message
        callSuccessModal("Login successful!");

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

        encryptStorage.setItem("access_token", res.data.access_token);

        // อัพเดท refresh token ใหม่ถ้ามี
        if (res.data.refresh_token) {
          encryptStorage.setItem("refreshToken", res.data.refresh_token);
        }

        // โหลด VMS data จาก storage กลับเข้า state
        const vmsUrl = await encryptStorage.getItem("vmsUrl");
        const vmsToken = await encryptStorage.getItem("vmsToken");
        const roleName = await encryptStorage.getItem("roleName");

        if (vmsUrl && vmsToken) {
          dispatch.userAuth.updateVmsState({
            vmsUrl,
            vmsToken,
            roleName,
          });
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
        // ลบข้อมูล VMS
        encryptStorage.removeItem("vmsUrl");
        encryptStorage.removeItem("vmsToken");
        encryptStorage.removeItem("roleName");

        // ทำความสะอาด intended destination จาก Google OAuth
        clearIntendedDestination();

        // รีเซ็ต VMS state
        dispatch.userAuth.updateVmsState({
          vmsUrl: null,
          vmsToken: null,
          roleName: null,
        });

        // ล้างข้อมูล projectData ของ setupProject
        dispatch.setupProject.setProjectData({});

        dispatch.userAuth.updateAuthState(false);
        return true;
      } catch (error) {
        encryptStorage.removeItem("projectId");
        encryptStorage.removeItem("access_token");
        encryptStorage.removeItem("refreshToken");
        encryptStorage.removeItem("userData");
        encryptStorage.removeItem("vmsUrl");
        encryptStorage.removeItem("vmsToken");
        encryptStorage.removeItem("roleName");

        clearIntendedDestination();

        dispatch.userAuth.updateVmsState({
          vmsUrl: null,
          vmsToken: null,
          roleName: null,
        });

        // ล้างข้อมูล projectData ของ setupProject (ในกรณี error)
        dispatch.setupProject.setProjectData({});

        dispatch.userAuth.updateAuthState(false);
        return false;
      }
    },
  }),
});
