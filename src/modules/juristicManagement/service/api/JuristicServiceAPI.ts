import axios from "axios";
import {
  JuristicAddNew,
  conditionPage,
  roleDetail,
  hobbyDetail,
  rejectRequest,
  unitDetail,
  JuristicEditPayload
} from "../../../../stores/interfaces/JuristicManage";
import { paramsdata } from "./paramsAPI";
import { encryptStorage } from "../../../../utils/encryptStorage";
import { message } from "antd";

const getdatajuristiclist = async (params: conditionPage) => {
  let url: string = `/team-management/list?`;
  const resultparams = await paramsdata(params);
  // console.log(resultparams);

  if (resultparams.status) {
    url = url + resultparams.paramsstr;
    // console.log("url:", url);
  }
  const token = await encryptStorage.getItem("access_token");
  if (token) {
    try {
      const result = await axios.get(url);

      if (result.status < 400) {
        const AllDataJuristic = result.data.result.rows;
        // console.log(AllDataJuristic);

        return {
          total: result.data.result.total,
          status: true,
          dataValue: AllDataJuristic,
        };
      } else {
        message.error(result.data.message);
        console.warn("status code:", result.status);
        console.warn("data error:", result.data);
      }
    } catch (err) {
      console.error("err:", err);
    }
  } else {
    console.log("====================================");
    console.log("token undefined.....");
    console.log("====================================");
  }
};

const deleteJuristicId = async (id: string) => {
  try {
    const resultDelete = await axios.delete(`/team-management/${id}`);
    console.log("resultDelete:", resultDelete);

    if (resultDelete.status === 200) {
      return {
        status: true,
      };
    } else {
      message.error(resultDelete.data.message);
      return {
        status: false,
      };
    }
  } catch (err) {
    console.error(err);
    return {
      status: false,
    };
  }
};

const ApprovedId = async (id: string) => {
  try {
    const resultApproved = await axios.post(`/users/approve`, {
      userId: id,
    });
    console.log("resultApproved", resultApproved);
    if (resultApproved.status === 201) {
      return true;
    } else {
      message.error(resultApproved.data.message);
      return false;
    }
  } catch (err) {
    console.error(err);
    return {
      status: false,
    };
  }
};

const ResendById = async (id: string) => {
  try {
    const resultApproved = await axios.post(`/users/approve`, {
      userId: id,
      resend: true,
    });
    console.log("resultResend", resultApproved);
    if (resultApproved.status === 201) {
      return true;
    } else {
      message.error(resultApproved.data.message);
      return false;
    }
  } catch (err) {
    console.error(err);
    return {
      status: false,
    };
  }
};

const getDataMasterJuristicDetail = async () => {
  try {
    const data = await axios.get("/users/sign-up/master-data");
    if (data.status === 200) {
      const UintDataList = data.data.result.unit;
      const RoleDataList = data.data.result.role;
      let arrayUintDetail: unitDetail[] = [];
      let arrayRoleDetail: roleDetail[] = [];
      UintDataList.map((e: any) => {
        const unit: unitDetail = {
          label: e.roomAddress,
          value: e.id,
        };
        arrayUintDetail.push(unit);
      });
      RoleDataList.map((e: any) => {
        const role: roleDetail = {
          label: e.name,
          value: e.id,
        };
        arrayRoleDetail.push(role);
      });
      if (arrayUintDetail.length > 0 && arrayRoleDetail.length > 0) {
        return {
          status: true,
          dataUnit: arrayUintDetail,
          dataRole: arrayRoleDetail,
        };
      } else {
        return {
          status: false,
          dataUnit: null,
          dataRole: null,
        };
      }
    }
  } catch (error) {
    console.error(error);
    return {
      status: false,
      dataUnit: null,
      dataRole: null,
    };
  }
};

const getdatarole = async () => {
  try {
    const data = await axios.get("/role/list");

    if (data.status === 200) {
      const rolelist = data.data.result.roleList;

      let arrayrole: roleDetail[] = [];
      rolelist.map((e: any) => {
        const role: roleDetail = {
          label: e.roleCode,
          value: e.id,
        };
        arrayrole.push(role);
      });

      if (arrayrole.length > 0) {
        return {
          status: true,
          datarole: arrayrole,
        };
      } else {
        return {
          status: false,
          datarole: null,
        };
      }
    }
  } catch (err) {
    console.error(err);
    return {
      status: false,
      datarole: null,
    };
  }
};

const getdatahobby = async () => {
  try {
    const data = await axios.get("/hobby");

    if (data.status === 200) {
      const hobbylist = data.data.result.hobby;
      let arrayhobby: hobbyDetail[] = [];
      hobbylist.map((e: any) => {
        if (e.active) {
          const hobby: hobbyDetail = {
            label: e.nameEn,
            value: e.id,
          };
          arrayhobby.push(hobby);
        }
      });

      if (arrayhobby.length > 0) {
        return {
          status: true,
          datahobby: arrayhobby,
        };
      } else {
        return {
          status: false,
          datahobby: null,
        };
      }
    }
  } catch (error) {
    console.error(error);

    return {
      status: false,
      datahobby: null,
    };
  }
};

// อัพเดตฟังก์ชัน editdatajuristic ให้รองรับ format ใหม่
const editdatajuristic = async (userId: string, payload: any) => {
  try {
    // แปลงข้อมูลให้ตรงกับ API format ที่ต้องการ (ไม่รวม image)
    const apiPayload = {
      givenName: payload.givenName,
      familyName: payload.familyName,
      middleName: payload.middleName || "",
      contact: payload.contact,
      roleId: payload.roleId
      // ไม่ส่ง image ใน payload นี้
    };

    console.log("edit request:", apiPayload);
    const result = await axios.put(`/team-management/${userId}`, apiPayload);
    console.log("result edit:", result);

    if (result.status < 400) {
      return true;
    } else {
      message.error(result.data.message);
      return false;
    }
  } catch (err: any) {
    console.error("Edit juristic error:", err);
    if (err.response?.data?.message) {
      message.error(err.response.data.message);
    } else {
      message.error("Failed to update user information");
    }
    return false;
  }
};

// อัพเดตฟังก์ชัน addJuristic ให้ใช้ endpoint ใหม่ /team-management/add
const addJuristic = async (req: JuristicAddNew) => {
  try {
    // แปลงข้อมูลให้ตรงกับ API format ใหม่ (ไม่รวม image)
    const apiPayload = {
      roleId: req.roleId,
      firstName: req.firstName,
      middleName: req.middleName || "",
      lastName: req.lastName,
      contact: req.contact,
      email: req.email
      // ไม่ส่ง image ใน payload นี้
    };

    console.log("addJuristic API Payload:", apiPayload);

    const result = await axios.post("/team-management/add", apiPayload);
    console.log("addJuristic result:", result);

    if (result.status === 200 || result.status === 201) {
      return {
        status: true,
        data: result.data
      };
    } else {
      message.error(result.data.message || "Failed to add team member");
      return {
        status: false,
        data: null
      };
    }
  } catch (error: any) {
    console.error("addJuristic error:", error);

    let errorMessage = "Failed to add team member";
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.message) {
      errorMessage = error.message;
    }

    message.error(errorMessage);
    return {
      status: false,
      data: null
    };
  }
};

const RejectById = async (data: rejectRequest) => {
  try {
    const resultReject = await axios.post(`/users/reject`, data);
    if (resultReject.status === 201) {
      return true;
    } else {
      return false;
    }
  } catch (err) {
    console.error(err);
    return {
      status: false,
    };
  }
};


// เพิ่มฟังก์ชันใหม่ในไฟล์ JuristicServiceAPI.ts

import axios from "axios";
import { message } from "antd";

// ฟังก์ชันสำหรับ upload image profile
const uploadJuristicImage = async (base64String: string): Promise<string | null> => {
  try {
    // สร้าง payload ตาม format ที่ API ต้องการ
    const payload = {
      imageProfile: base64String
    };

    console.log("Uploading image with payload format...");
    const result = await axios.put(`/users/juristic/image-profile`, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log("Image upload result:", result);

    if (result.status === 200 || result.status === 201) {
      // สมมติว่า API return { imageUrl: "..." } หรือ success message
      return result.data.imageUrl || result.data.data?.imageUrl || result.data.url || "success";
    } else {
      message.error(result.data.message || "Failed to upload image");
      return null;
    }
  } catch (err: any) {
    console.error("Image upload error:", err);
    const errorMessage = err.response?.data?.message || "Failed to upload image";
    message.error(errorMessage);
    return null;
  }
};

// ฟังก์ชันสำหรับ get juristic profile (รวมรูปภาพ)
const getJuristicProfile = async () => {
  try {
    console.log("Fetching juristic profile...");
    const result = await axios.get(`/users/juristic/profile`);

    console.log("Profile result:", result);

    if (result.status === 200) {
      return {
        status: true,
        data: result.data.data || result.data
      };
    } else {
      message.error(result.data.message || "Failed to fetch profile");
      return {
        status: false,
        data: null
      };
    }
  } catch (err: any) {
    console.error("Profile fetch error:", err);
    const errorMessage = err.response?.data?.message || "Failed to fetch profile";
    message.error(errorMessage);
    return {
      status: false,
      data: null
    };
  }
};

// ฟังก์ชันแปลง File เป็น base64 string
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result); // จะได้ "data:image/jpeg;base64,xxxxxxxx"
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export {
  getdatajuristiclist,
  deleteJuristicId,
  editdatajuristic,
  ApprovedId,
  RejectById,
  getdatahobby,
  getdatarole,
  getDataMasterJuristicDetail,
  addJuristic,
  ResendById,
  uploadJuristicImage,
  getJuristicProfile,
  fileToBase64
};