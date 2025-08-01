import { createModel } from "@rematch/core";
import {
  PeopleCountingType,
  PeopleCountingFormDataType,
} from "../interfaces/PeopleCounting";
import axios from "axios";
import FailedModal from "../../components/common/FailedModal";
import { RootModel } from "./index";

export const peopleCounting = createModel<RootModel>()({
  state: {
    peopleCountingData: [],
  } as PeopleCountingType,
  reducers: {
    updatePeopleCountingDataState: (state, payload) => ({
      ...state,
      peopleCountingData: payload,
    }),
  },
  effects: (dispatch) => ({
    async getPeopleCountingData() {
      try {
        const result = await axios.get(`/people-counting/dashboard/list`);
        if (result.data.statusCode >= 400) {
          console.error(result.data.message);
          FailedModal("Something went wrong");
          return false;
        }
        console.log("TEST GET", result.data.result);
        dispatch.peopleCounting.updatePeopleCountingDataState(
          result.data.result
        );
        return true;
      } catch (error) {
        console.error("CATCH: ", error);
      }
    },
    async editPeopleCountingData(payload: PeopleCountingFormDataType) {
      // console.log(payload);
      try {
        const result = await axios.put(`/people-counting`, payload);
        if (result.data.statusCode >= 400) {
          console.error(result.data.message);
          FailedModal("Something went wrong");
          return false;
        }
        return true;
      } catch (error) {
        console.error(error);
      }
    },
  }),
});
