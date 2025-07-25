import { createModel } from "@rematch/core";
import {
  FacilitiesDataType,
  ReserveSlotTimeType,
  ReserveFacilityType,
} from "../interfaces/Facilities";
import { RootModel } from "./index";
import axios from "axios";

import { message } from "antd";

export const facilities = createModel<RootModel>()({
  state: {
    paramsAPI: {
      perPage: 10,
      curPage: 1,
      facilitiesId: 1,
    },
    reserveSlotTime: [],
    peopleCountingData: undefined,
    reservationListData: [],
    reservedListData: undefined,
    unitListData: [],
    userData: undefined,
    residentByUnit: [],
  } as FacilitiesDataType,
  reducers: {
    updateloadingParamsState: (state, payload) => ({
      ...state,
      paramsAPI: payload,
    }),
    updateReserveSlotTimeState: (state, payload) => ({
      ...state,
      reserveSlotTime: payload,
    }),
    updatePeopleCountingDataState: (state, payload) => ({
      ...state,
      peopleCountingData: payload,
    }),
    updateReservationListDataState: (state, payload) => ({
      ...state,
      reservationListData: payload,
    }),
    updateReservedListDataState: (state, payload) => ({
      ...state,
      reservedListData: payload,
    }),
    updateUnitListDataState: (state, payload) => ({
      ...state,
      unitListData: payload,
    }),
    updateUserDataState: (state, payload) => ({
      ...state,
      userData: payload,
    }),
    updateResidentByUnit: (state, payload) => ({
      ...state,
      residentByUnit: payload,
    }),
  },
  effects: (dispatch) => ({
    async getTimeSlot(payload: ReserveSlotTimeType) {
      try {
        const result = await axios.get(
          `/facilities/slot-time?id=${payload.id}&date=${payload.date}`
        );
        if (result.data.statusCode >= 400) {
          console.error(result.data.message);
          return false;
        }
        dispatch.facilities.updateReserveSlotTimeState(result.data.result);
        return true;
      } catch (error) {
        console.error("ERROR", error);
      }
    },
    async reserveFacility(payload: ReserveFacilityType) {
      try {
        // console.log(payload);
        const result = await axios.post(
          `/facilities/dashboard-booking`,
          payload
        );
        if (result.data.statusCode >= 400) {
          console.error(result.data.message);
          message.error(result.data.message);
          return;
        }
      } catch (error) {
        console.error("ERROR", error);
      }
    },
    async getPeopleCountingData() {
      try {
        const result = await axios.get(`/people-counting?roomId=1`);
        if (result.data.statusCode >= 400) {
          console.error(result.data.message);
          return;
        }
        dispatch.facilities.updatePeopleCountingDataState(result.data.result);
      } catch (error) {
        console.error("ERROR", error);
      }
    },
    async editPeopleCountingData(payload) {
      try {
        const result = await axios.put(`/people-counting`, payload);
        if (result.data.statusCode >= 400) {
          console.error(result.data.message);
          return;
        }
        console.log("Success");
      } catch (error) {
        console.error("ERROR", error);
      }
    },
    async getReservationList() {
      try {
        const result = await axios.get(`/facilities/dashboard/list`);
        if (result.data.statusCode >= 400) {
          console.error(result.data.message);
          return;
        }
        // console.log("Facility result : ", result.data.result);
        dispatch.facilities.updateReservationListDataState(result.data.result);
      } catch (error) {
        console.error("ERROR", error);
      }
    },
    async updateLockStatus(payload) {
      try {
        const result = await axios.put(`/facilities/dashboard/lock`, payload);
        if (result.data.statusCode >= 400) {
          console.error(result.data.message);
          return false;
        }
        return true;
      } catch (error) {
        console.error("ERROR", error);
      }
    },
    async updateFacilities(payload) {
      try {
        const result = await axios.put(`/facilities`, payload);
        if (result.data.statusCode >= 400) {
          console.error(result.data);
          return false;
        }
        return true;
      } catch (error) {
        console.error("ERROR", error);
      }
    },
    async createFacilities(payload) {
      try {
        const result = await axios.post(`/facilities`, payload);
        if (result.data.statusCode >= 400) {
          console.error(result.data);
          return false;
        }
        return true;
      } catch (error) {
        console.error("ERROR", error);
      }
    },
    async deleteFacilities(id: number) {
      try {
        const result = await axios.delete(`/facilities/${id}`);
        if (result.data.statusCode >= 400) {
          console.error(result.data);
          return false;
        }
        return true;
      } catch (error) {
        console.error("ERROR", error);
      }
    },
    async getReservedList(payload) {
      const date = payload.date ? `&date=${payload.date}` : "";
      const searchWord = payload.search ? `&search=${payload.search}` : "";
      const facilityID =
        payload.facilitiesId !== 0
          ? `&facilitiesId=${payload.facilitiesId}`
          : "";
      try {
        const result = await axios.get(
          `/facilities/dashboard/reservation?curPage=${payload.curPage}&perPage=${payload.perPage}${searchWord}${date}${facilityID}`
        );
        if (result.data.statusCode >= 400) {
          console.error(
            "PARAMS : ",
            `curPage=${payload.curPage}&perPage=${payload.perPage}${searchWord}${date}${facilityID}`,
            result
          );
          return;
        }
        console.log("Booking list result: ", result.data.result);
        dispatch.facilities.updateReservedListDataState(result.data.result);
      } catch (error) {
        console.error("ERROR", error);
      }
    },
    async deleteReserved(payload) {
      try {
        const result = await axios.delete(
          `/facilities/dashboard/reservation/${payload}`
        );
        if (result.data.statusCode >= 400) {
          console.error(result.data.message);
          return false;
        }
        // console.log(result.data);
        return true;
      } catch (error) {
        console.error("ERROR", error);
      }
    },
    async getReservedCreateDataList() {
      try {
        const unit = await axios.get(`facilities/dashboard/unit`);
        const userData = await axios.get(`team-management/profile`);

        if (unit.data.statusCode >= 400 && userData.data.statusCode >= 400) {
          console.error(unit);
          console.error(userData);
          return;
        }
        // console.log(userData.data.result);
        dispatch.facilities.updateUnitListDataState(unit.data.result);
        dispatch.facilities.updateUserDataState(userData.data.result);
      } catch (error) {
        console.error("ERROR", error);
      }
    },
    async getResidentByUnitList(payload) {
      try {
        const residentData = await axios.get(
          `facilities/dashboard/user-by-unit?unitId=${payload}`
        );

        if (residentData.data.statusCode >= 400) {
          console.error(residentData);
          return;
        }
        // console.log(residentData.data.result);
        dispatch.facilities.updateResidentByUnit(residentData.data.result);
        return residentData.data.result;
      } catch (error) {
        console.error("ERROR", error);
      }
    },
    async createReservedFacility(payload) {
      try {
        const residentData = await axios.post(
          `facilities/dashboard/booking`,
          payload
        );

        if (residentData.data.statusCode >= 400) {
          console.error("ERR", residentData);
          message.error(residentData.data.message);
          return residentData.data.statusCode;
        }
        return residentData.data.statusCode;
      } catch (error) {
        console.error("ERROR", error);
      }
    },
  }),
});
