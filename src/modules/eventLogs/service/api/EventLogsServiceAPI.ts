import axios from "axios";
import { paramsdata } from "./paramsAPI";
import { encryptStorage } from "../../../../utils/encryptStorage";
import { statusSuccess, statusCreated } from "../../../../constant/status_code";
import {
  AddNewEventLogsType,
  dataEventJoinLogsType,
  conditionPage,
  dataEventJoinLogsByIDType,
  dataEventLogsType,
  EditEventLogsType,
  IChangeLockedById,
} from "../../../../stores/interfaces/EventLog";
import dayjs from "dayjs";
const getDataEventJoinLogList = async (params: conditionPage) => {
  let url: string = `events/referral/list?`;
  const resultparams = await paramsdata(params);
  if (resultparams.status) {
    url = url + resultparams.paramsstr;
    console.log("url:", url);
  }
  const token = await encryptStorage.getItem("accessToken");
  try {
    const result = await axios.get(url);
    if (result.status === statusSuccess) {
      const AllDataEventLogs = result.data.result.rows;
      let data: dataEventJoinLogsType[] = [];
      AllDataEventLogs.map((e: any, i: number) => {
        let dataEventLogs: dataEventJoinLogsType = {
          key: e?.id,
          eventName: e?.eventName,
          joiningDate: e?.joiningDate,
          blockNo: e?.blockNo,
          unitNo: e?.unitNo,
          participant: e?.participant,
          bookingBy: e?.bookingBy,
        };
        data.push(dataEventLogs);
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
  }
};
const getDataEventLogList = async (params: conditionPage) => {
  let url: string = `events/list?`;
  const resultparams = await paramsdata(params);
  if (resultparams.status) {
    url = url + resultparams.paramsstr;
    console.log("url:", url);
  }
  const token = await encryptStorage.getItem("accessToken");
  try {
    const result = await axios.get(url);
    console.log("getdataEventLoglist:", result);

    if (result.status === statusSuccess) {
      const AllDataEventLogs = result.data.result.rows;
      let data: dataEventLogsType[] = [];
      AllDataEventLogs.map((e: any, i: number) => {
        let dataEventLogs: dataEventLogsType = {
          key: e?.id,
          title: e?.title,
          description: e?.description,
          status:
            dayjs(e?.date, "YYYY-MM-DD").diff(dayjs().format("YYYY-MM-DD")) >
              -1
              ? "Published"
              : "Unpublished",
          limitPeople: e?.limitPeople,
          createDate: e?.createdAt,
          startDate: e?.date,
          startTime: e?.startTime,
          endTime: e?.endTime,
          visitorRegister: e?.isAllowVisitor,
          createBy: `${e?.createdBy?.firstName ? e?.createdBy?.firstName : ""} ${e?.createdBy?.middleName ? e?.createdBy?.middleName : " "} ${e?.createdBy?.lastName ? e?.createdBy?.lastName : ""}`,
          unitAll: e?.unitAll,
          unitList: e?.unitList,
          imageUrl: e?.imageUrl,
          isPayable: e?.isPayable,
          fee: e?.fee,
          locked: e?.locked,
          currentBookingPeople: e?.currentBookingPeople,
          isMaxBookingPerUnit: e?.isMaxBookingPerUnit,
          maxBookingPerUnit: e?.maxBookingPerUnit,
        };
        data.push(dataEventLogs);
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
  }
};

const deleteEventLogsById = async (id: string) => {
  try {
    const resultDelete = await axios.delete(`/events/${id}`);
    if (resultDelete.status === statusSuccess) {
      return true;
    } else {
      console.warn("delete", resultDelete);
      return false;
    }
  } catch (err) {
    console.error(err);
    return false;
  }
};

const deleteEventJoinById = async (id: string) => {
  try {
    const resultDelete = await axios.delete(`/events/referral/${id}`);
    if (resultDelete.status === statusSuccess) {
      return {
        status: true,
      };
    } else {
      console.warn("delete", resultDelete);
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

const editEventLogs = async (req: EditEventLogsType) => {
  try {
    const result = await axios.put("/events/update", req);
    if (result.status === statusSuccess) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    return false;
  }
};
const addEventLogs = async (req: AddNewEventLogsType) => {
  try {
    const result = await axios.post("/events/create", req);
    if (result.status === statusCreated) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    return false;
  }
};

const getDataJoinLogByid = async (id: number) => {
  try {
    const resultDatajoinLogId = await axios.get(
      `events/referral/info?referralId=${id}`
    );
    if (resultDatajoinLogId.status === statusSuccess) {
      const { participant, roomType } = resultDatajoinLogId.data.result;
      let dataJoinLogId: dataEventJoinLogsByIDType = {
        typeEventJoinLog: roomType,
        participant: participant,
      };
      return {
        status: true,
        data: dataJoinLogId,
      };
    }
  } catch (err) {
    console.error(err);
    return {
      status: false,
      data: null,
    };
  }
};
const changeLockedById = async (req: IChangeLockedById) => {
  try {
    const result = await axios.put("/events/locked", req);
    if (result.status === statusSuccess) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    return false;
  }
};

const downloadEventLogs = async () => {
  var now = dayjs();
  axios({
    url: `events/events-log/download`, //your url
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

const downloadEventJoinLogs = async () => {
  var now = dayjs();
  axios({
    url: `events/events-joining/download`, //your url
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
  getDataEventJoinLogList,
  getDataEventLogList,
  getDataJoinLogByid,
  deleteEventJoinById,
  editEventLogs,
  addEventLogs,
  deleteEventLogsById,
  changeLockedById,
  downloadEventJoinLogs,
  downloadEventLogs,
};