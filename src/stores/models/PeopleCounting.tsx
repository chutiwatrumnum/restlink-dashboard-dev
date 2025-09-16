import { createModel } from "@rematch/core";
import {
  PeopleCountingDataType,
  PeopleCountingFormDataType,
  PeopleCountingType,
} from "../interfaces/PeopleCounting";
import axios from "axios";
import FailedModal from "../../components/common/FailedModal";
import { RootModel } from "./index";

export const peopleCounting = createModel<RootModel>()({
  state: {
    peopleCountingData: [],
  } as PeopleCountingType,

  reducers: {
    updatePeopleCountingDataState: (
      state,
      payload: PeopleCountingDataType[]
    ) => ({
      ...state,
      peopleCountingData: payload,
    }),
  },

  effects: (dispatch) => ({
    async getPeopleCountingData() {
      try {
        const result = await axios.get(`/people-counting/dashboard/spaces`);
        if (result.data.statusCode >= 400) {
          console.error(result.data.message);
          FailedModal("Something went wrong");
          return false;
        }
        console.log("TEST GET", result.data.result);
        dispatch.peopleCounting.updatePeopleCountingDataState(
          result.data.result.data
        );
        return true;
      } catch (error) {
        console.error("CATCH: ", error);
        FailedModal("Failed to fetch data");
        return false;
      }
    },

    async editPeopleCountingData(payload: PeopleCountingFormDataType) {
      const imageFile = payload?.image;
      try {
        if (!payload.id) {
          console.error("No ID provided for edit");
          return false;
        }
        if (!imageFile) {
          const data = {
            id: payload.id,
            name: payload.name,
            description: payload.description,
            statusLow: payload.statusLow,
            statusMedium: payload.statusMedium,
            statusHigh: payload.statusHigh,
            icon: payload.icon,
            cameraIp: payload.cameraIp,
            sort: payload.sort,
            active: payload.active,
          };

          const result = await axios.put(
            `people-counting/dashboard/space/${payload.id}`,
            data
          );

          if (result.data.statusCode >= 400) {
            console.error(result.data.message);
            FailedModal("Something went wrong");
            return false;
          }
        } else {
          const formData = new FormData();

          formData.append("name", payload.name || "");
          formData.append("description", payload.description || "");
          formData.append("statusLow", String(payload.statusLow) || "");
          formData.append("statusMedium", String(payload.statusMedium) || "");
          formData.append("statusHigh", String(payload.statusHigh) || "");
          formData.append("icon", payload.icon || "");
          formData.append("cameraIp", String(payload.cameraIp) || "");
          formData.append("sort", String(payload.sort) || "");
          formData.append("active", String(payload.active || false));
          formData.append("image", imageFile);

          const result = await axios.put(
            `people-counting/dashboard/space/${payload.id}`,
            formData
          );

          if (result.data.statusCode >= 400) {
            console.error(result.data.message);
            FailedModal("Something went wrong");
            return false;
          }
        }

        await dispatch.peopleCounting.getPeopleCountingData();
        return true;
      } catch (error) {
        console.error("Edit error:", error);
        FailedModal("Failed to update data");
        return false;
      }
    },
  }),
});
