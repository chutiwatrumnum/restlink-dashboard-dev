import axios from "axios";
import {
  DataType,
  Ibooking,
  conditionPage,
  dataItem,
} from "../../../../stores/interfaces/Facilities";
import { paramsData } from "./paramsAPI";
import { encryptStorage } from "../../../../utils/encryptStorage";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
dayjs.extend(customParseFormat);

const getdataFacilitieslist = async (params: conditionPage) => {
  let url: string = `facilities/booking-log?`;
  const resultparams = await paramsData(params);
  if (resultparams.status) {
    url = url + resultparams.paramsstr;
    console.log("url:", url);
  }
  const token = await encryptStorage.getItem("accessToken");
  if (token) {
    try {
      const result = await axios.get(url);
      if (result.status >= 400) {
        console.error("status code:", result.status);
        console.error("data error:", result.data);
      }
      // console.log("data facilitie:",result.data.result.bookingLog);
      const AllDataFacilies = result.data.result.bookingLog.rows;
      let data: DataType[] = [];
      AllDataFacilies.map((e: any, i: number) => {
        let userdata: DataType = {
          key: e.id,
          refBooking: e.refBooking,
          purpose: e.purpose,
          joiningDate: e.joinAt ? dayjs(e.joinAt).format("DD/MM/YYYY") : "-",
          blockNo: e.unit[0].block[0].blockNo,
          unitNo: e.unit[0].unitNo,
          status: e.status,
          createdAt: dayjs(e.createdAt).format("DD/MM/YYYY"),
          startEndTime: `${e.startTime}-${e.endTime}`,
          bookedBy: e.bookingUser,
          approve: e.approve,
          reject: e.reject,
          juristicConfirm: e.juristicConfirm,
        };
        data.push(userdata);
      });

      return {
        total: result.data.result.bookingLog.total,
        status: true,
        dataValue: data,
      };
    } catch (err) {
      console.error("err:", err);
    }
  } else {
    console.log("====================================");
    console.log("token undefilend.....");
    console.log("====================================");
  }
};

const dowloadFacilities = async (id: number | null) => {
  console.log("====================================");
  console.log("id faci:", id);
  console.log("====================================");
  var now = dayjs();
  axios({
    url: `facilities/download?id=${id}`, //your url
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

const deleteFacilitieId = async (id: number) => {
  try {
    const resultDelete = await axios.delete(`facilities/booking-log/${id}`);

    if (resultDelete.status >= 400) {
      console.warn("delete", resultDelete);

      return {
        status: false,
      };
    }
    return {
      status: true,
    };
  } catch (err) {
    console.error(err);

    return {
      status: false,
    };
  }
};

const ApprovedId = async (data: any) => {
  try {
    const resultPending = await axios.put(`facilities/booking-log`, data);
    if (resultPending.status >= 400) {
      console.warn("approve", resultPending);

      return {
        status: false,
      };
    }
    return {
      status: true,
    };
  } catch (err) {
    console.error(err);

    return {
      status: false,
    };
  }
};

const getFacilitiesList = async () => {
  try {
    const facilitie = await axios.get("facilities/list");

    if (facilitie.status >= 400) {
      return {
        status: false,
        data: null,
        fristId: null,
      };
    }
    let data: dataItem;
    let arrData: dataItem[] = [];
    facilitie.data.result.map((e: any) => {
      let data: dataItem = {
        value: e.id,
        label: e.name,
        imageId: e.imageId,
      };
      arrData.push(data);
    });
    return {
      status: true,
      data: arrData,
      fristId: arrData[0].value,
    };
  } catch (err) {
    console.error(err);
    return {
      status: false,
      data: null,
      fristId: null,
    };
  }
};

const getFacilitiesBymonth = async (param: any) => {
  try {
    const facilitie = await axios.get(
      `/facilities/by-month?facilitiesId=${param?.facilitiesId}&sortBy=${param?.sortBy}`
    );
    if (facilitie.status < 400 && facilitie.data.result.booking !== undefined) {
      let data: Ibooking;
      let arrData: Ibooking[] = [];
      facilitie.data.result.booking.map((e: any) => {
        const datehour = dayjs(e?.startTime, "h:mm A").format("H");
        let data: Ibooking = {
          unit: e.unit,
          bookingBy: e.bookingBy,
          contactNo: e.contactNo,
        };
        if (datehour === "16") {
          arrData[1] = data;
        } else if (datehour === "9") {
          arrData[0] = data;
        }
      });
      return {
        status: true,
        data: arrData,
      };
    } else {
      return {
        status: false,
        data: null,
        fristId: null,
      };
    }
  } catch (err) {
    console.error(err);
    return {
      status: false,
      data: null,
      fristId: null,
    };
  }
};
export {
  getdataFacilitieslist,
  deleteFacilitieId,
  ApprovedId,
  getFacilitiesList,
  getFacilitiesBymonth,
  dowloadFacilities,
};
