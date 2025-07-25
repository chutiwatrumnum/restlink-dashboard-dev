import axios from "axios";
import {
  JuristicManageDataType,
  JuristicAddNew,
  conditionPage,
  roleDetail,
  hobbyDetail,
  rejectRequest,
  unitDetail,
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
const editdatajuristic = async (userId: string, payload: JuristicAddNew) => {
  try {
    console.log("edit request:", payload);
    const result = await axios.put(`/team-management/${userId}`, payload);
    console.log("result edit:", result);

    if (result.status < 400) {
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
const addJuristic = async (req: JuristicAddNew) => {
  try {
    const result = await axios.post("/users/sign-up-by-juristic", req);
    console.log("addJuristic result:", result);

    if (result.status === 200) {
      return true;
    } else {
      message.error(result.data.message);
      return false;
    }
  } catch (error) {}
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
};
