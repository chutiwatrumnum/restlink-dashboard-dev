// src/modules/setting/service/api/profile_api.tsx

import axios from "axios";
import { message } from "antd";
import {
  ProfileDetail,
  editProfileDetail,
} from "../../../../stores/interfaces/Profile";

const getDataProfile = async () => {
  let url: string = `/users/juristic/profile`;
  try {
    const result = await axios.get(url);
    if (result.status === 200) {
      const profile = result.data.result;
      const profileDetail: ProfileDetail = {
        userId: profile.userId,
        lastName: profile.lastName,
        firstName: profile.firstName,
        middleName: profile.middleName || "", // เพิ่ม middleName
        nickName: profile.nickName,
        email: profile.email,
        imageProfile: profile.imageProfile,
        contact: profile.contact,
        allowNotifications: profile.allowNotifications,
        callAllowNotification: profile.callAllowNotification,
        roleName: profile.roleName,
        roleCode: profile.roleCode,
        projectName: profile.projectName,
      };
      return {
        status: true,
        data: profileDetail,
      };
    } else {
      console.warn("status code:", result.status);
      console.warn("data error:", result.data);
    }
  } catch (err) {
    console.error("err:", err);
  }
};

const EditDataProfile = async (data: editProfileDetail) => {
  try {
    const result = await axios.put(`/users/juristic/image-profile`, data);
    if (result.status === 200) {
      return true;
    } else {
      message.error(result.data.message);
      return false;
    }
  } catch (err) {
    console.error(err);
    return false;
  }
};

// เพิ่มฟังก์ชันใหม่สำหรับอัปเดตชื่อผ่าน API ใหม่
const updateUserNames = async (
  userId: string,
  data: {
    givenName: string;
    middleName?: string;
    familyName: string;
  }
) => {
  try {
    const result = await axios.put(`/users/${userId}`, data);
    if (result.status === 200) {
      return {
        status: true,
        data: result.data,
      };
    } else {
      message.error(result.data.message || "Failed to update profile");
      return {
        status: false,
        error: result.data.message,
      };
    }
  } catch (err: any) {
    console.error("Error updating user names:", err);
    message.error(err.response?.data?.message || "Failed to update profile");
    return {
      status: false,
      error: err.response?.data?.message || "Unknown error",
    };
  }
};

// เพิ่มฟังก์ชันสำหรับเปลี่ยนรหัสผ่าน
export interface ChangePasswordPayload {
  oldPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface ChangePasswordResponse {
  status: boolean;
  data?: any;
  error?: string;
}

export const changePassword = async (
  payload: ChangePasswordPayload
): Promise<ChangePasswordResponse> => {
  try {
    const result = await axios.put("/auth/dashboard/change-password", {
      oldPassword: payload.oldPassword,
      newPassword: payload.newPassword,
      confirmNewPassword: payload.confirmNewPassword,
    });

    if (result.status === 200) {
      return {
        status: true,
        data: result.data,
      };
    } else {
      return {
        status: false,
        error: result.data?.message || "Failed to change password",
      };
    }
  } catch (error: any) {
    // Handle different types of errors
    if (error.response) {
      const errorMessage =
        error.response.data?.message || "Failed to change password";

      // Handle specific error cases
      if (error.response.status === 400) {
        return {
          status: false,
          error: errorMessage || "Invalid password format",
        };
      } else if (error.response.status === 401) {
        return {
          status: false,
          error: "Current password is incorrect",
        };
      } else if (error.response.status === 403) {
        return {
          status: false,
          error: "You don't have permission to change password",
        };
      }

      return {
        status: false,
        error: errorMessage,
      };
    } else if (error.request) {
      return {
        status: false,
        error: "Network error. Please check your connection.",
      };
    } else {
      return {
        status: false,
        error: "An unexpected error occurred",
      };
    }
  }
};

export { getDataProfile, EditDataProfile, updateUserNames };
