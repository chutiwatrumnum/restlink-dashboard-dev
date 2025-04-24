import axios from "axios";
import { paramsdata } from "./paramsAPI";
import { encryptStorage } from "../../../../utils/encryptStorage";
import {
  AddNewDeliveryLogsType,
  conditionPage,
  dataDeliveryLogsType,
  EditDeliveryLogsType,
  blockDetail,
} from "../../../../stores/interfaces/DeliveryLogs";
import dayjs from "dayjs";

const getdataDeliveryLogslist = async (params: conditionPage) => {
  let url: string = `/parcel/list?`;
  const resultparams = await paramsdata(params);
  if (resultparams.status) {
    url = url + resultparams.paramsstr;
    //console.log("url:",url);
  }
  const token = await encryptStorage.getItem("access_token");
  if (token) {
    try {
      const result = await axios.get(url);
      if (result.status < 400) {
        const AllDataDeliveryLogs = result.data.result.rows;
        let data: dataDeliveryLogsType[] = [];
        AllDataDeliveryLogs.map((e: any, i: number) => {
          let dataDeliveryLogs: dataDeliveryLogsType = {
            key: e.id,
            name: e.name,
            contact: e.contact,
            senderType: e.senderType,
            trackingNumber: e.trackingNumber,
            blockNo: e.blockNo,
            unitNo: e.unitNo,
            createdAt: e.createdAt,
            FromDateTime: `${e.startDate} ${e.startTime}`,
            ToDateTime: `${e.endDate} ${e.endTime}`,
            pickUpType: "-",
            collected: e.collected,
            reminderNotification: e.reminderNotification,
            comment: e.comment,
            blockId: e.blockId,
            unitId: e.unitId,
            startDate: e.startDate,
            startTime: e.startTime,
            endDate: e.endDate,
            endTime: e.endTime,
            pickUpLocation: e.pickUpLocation,
          };
          if (e.pickUpType) {
            dataDeliveryLogs.pickUpType = e.pickUpType;
          }
          data.push(dataDeliveryLogs);
        });

        return {
          total: result.data.result.total,
          status: true,
          datavalue: data,
        };
      } else {
        console.warn("status code:", result.status);
        console.warn("data error:", result.data);
      }
    } catch (err) {
      console.error("err:", err);
      return {
        total: null,
        status: false,
        datavalue: null,
      };
    }
  } else {
    console.log("====================================");
    console.log("token undefilend.....");
    console.log("====================================");
  }
};

const deleteDeliveryLogsById = async (id: string) => {
  try {
    const resultDelete = await axios.delete(`/parcel/delete/${id}`);
    if (resultDelete.status < 400) {
      return true;
    } else {
      return false;
    }
  } catch (err) {
    console.error(err);
    return false;
  }
};

const editDeliveryLogs = async (req: EditDeliveryLogsType) => {
  try {
    const result = await axios.put("/parcel/update", req);
    if (result.status < 400) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    return false;
  }
};
const addDeliveryLogs = async (req: AddNewDeliveryLogsType) => {
  try {
    const result = await axios.post("/parcel/create", req);
    if (result.status < 400) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    return false;
  }
};

const changeCollectedById = async (id: number) => {
  const req = {
    id: id,
    collected: true,
  };
  try {
    const result = await axios.put("/parcel/collected", req);
    if (result.status < 400) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    return false;
  }
};

const getUserByunit = async (value: string) => {
  try {
    const { status, data } = await axios.get(`/users?unitId=${value}`);
    if (status >= 400) {
      console.error(data.message);
      return {
        status: false,
        data: null,
      };
    }
    if (data.result.dataListLength === 0) {
      return {
        status: false,
        data: null,
      };
    }
    return {
      status: true,
      data: data.result.dataList,
    };
  } catch (error) {
    return {
      status: false,
      data: null,
    };
  }
};
const getDataBlock = async () => {
  try {
    const data = await axios.get("/unit/block-unit-list");
    if (data.status === 200) {
      const blocklst = data.data.result.blockList;
      let arrayBlock: blockDetail[] = [];
      blocklst.map((e: any) => {
        if (e?.active) {
          const block: blockDetail = {
            label: e.blockNo,
            value: e.id,
          };
          arrayBlock.push(block);
        }
      });
      if (arrayBlock.length > 0) {
        return {
          status: true,
          dataselectblock: arrayBlock,
          datablock: blocklst,
        };
      } else {
        return {
          status: false,
          datablock: null,
        };
      }
    }
  } catch (error) {
    console.error(error);
    return {
      status: false,
      datablock: null,
    };
  }
};

const dowloadDeliveryLogs = async () => {
  var now = dayjs();
  axios({
    url: `parcel/download`, //your url
    method: "GET",
    responseType: "blob", // important
  }).then((response) => {
    // create file link in browser's memory
    const href = URL.createObjectURL(response.data);
    console.log("response.data======", response.data);
    // create "a" HTML element with href to file & click
    const link = document.createElement("a");
    link.href = href;
    link.setAttribute("download", dayjs(now).format("DD-MM-YYYY")); //or any other extension
    document.body.appendChild(link);
    link.click();

    // clean up "a" element & remove ObjectURL
    // document.body.removeChild(link);
    // URL.revokeObjectURL(href);
  });
};
export {
  getUserByunit,
  getdataDeliveryLogslist,
  editDeliveryLogs,
  addDeliveryLogs,
  deleteDeliveryLogsById,
  changeCollectedById,
  getDataBlock,
  dowloadDeliveryLogs,
};
