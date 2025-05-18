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

export { getDataProfile, EditDataProfile };