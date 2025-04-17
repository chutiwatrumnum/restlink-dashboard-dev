import axios from "axios";
import { encryptStorage } from "../../../../utils/encryptStorage";
import { message } from "antd";
import { ProfileDetail, editProfileDetail } from "../../../../stores/interfaces/Profile";
const getDataProfile = async () => {
  let url: string = `/team-management/profile`;
const token = await encryptStorage.getItem("accessToken");
  if (token) {
    try {
      const result = await axios.get(url);
      if (result.status === 200) {
        const profile = result.data.result;
       const profileDetail:ProfileDetail={
         id: profile.id,
         lastName: profile.lastName,
         firstName: profile.firstName,
         middleName: profile.middleName,
         nickName: profile.nickName,
         email: profile.email,
         active: profile.active,
         verifyByJuristic: profile.verifyByJuristic,
         channel: profile.channel,
         imageProfile: profile.imageProfile,
         contact: profile.contact,
         createdAt: profile.createdAt,
         role: profile.role.name,
       }
        return {
          total: result.data.result.total,
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
  } else {
    console.log("====================================");
    console.log("token undefilend.....");
    console.log("====================================");
  }
};

 const EditDataProfile = async ( data: editProfileDetail) => {
  try {
    const result = await axios.put(`/team-management/profile`, data);
    if (result.status === 200) {
      console.log("eidt data success:",result.data);
      
      return true;
    } else {
      message.error(result.data.message)
      return false;
    }
  } catch (err) {
    console.error(err);
    return false;
  }
};
export { getDataProfile,EditDataProfile };
