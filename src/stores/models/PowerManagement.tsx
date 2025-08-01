import { createModel } from "@rematch/core";
import { PowerManagementDataType } from "../interfaces/PowerManagement";
import axios from "axios";
import FailedModal from "../../components/common/FailedModal";
import { RootModel } from "./index";
import * as crypto from "crypto-js";

const APP_KEY = "YSbV1e047j5bMAnh";
const APP_SECRET = "hOhNh0Q13lp0FvfGFK9Gs5XVuiaIHnYu";
const keySecrets = crypto.enc.Utf8.parse(APP_SECRET);
const options = {
  iv: crypto.enc.Utf8.parse(APP_KEY),
  mode: crypto.mode.CBC,
  padding: crypto.pad.Pkcs7,
};
const Encrypt = (word: string) => {
  const srcs = crypto.enc.Utf8.parse(word);
  const encrypted = crypto.AES.encrypt(srcs, keySecrets, options);
  return encrypted.ciphertext.toString().toUpperCase();
};
const authT = Encrypt(
  JSON.stringify({
    proName: "the-stage",
    timez: `${new Date().getTime()}`,
  })
);
// const rcuURL = "http://103.253.73.131:8040/api/v1";
const rcuURL = "https://the-stage-devicecon.ap.ngrok.io/api/v1";

export const powerManagement = createModel<RootModel>()({
  state: {
    areaData: [],
    devicesData: [],
  } as PowerManagementDataType,
  reducers: {
    updateAreaDataState: (state, payload) => ({
      ...state,
      areaData: payload,
    }),
    updateDevicesDataState: (state, payload) => ({
      ...state,
      devicesData: payload,
    }),
  },
  effects: (dispatch) => ({
    async getAreaData() {
      try {
        const result = await axios.get(`${rcuURL}/rcu/list`, {
          headers: {
            secret: authT,
          },
        });
        // console.log("AREA GET", result);
        if (result?.status >= 400 || result == undefined) {
          console.error(result);
          // FailedModal("Something went wrong");
          return false;
        }
        dispatch.powerManagement.updateAreaDataState(result.data.result);
        return true;
      } catch (error) {
        console.error("CATCH: ", error);
      }
    },
    async editAreaTime(payload) {
      // console.log(payload);
      const setupTime = Encrypt(JSON.stringify(payload));
      console.log("setupTime :: ", setupTime);
      try {
        const result = await axios.put(
          `${rcuURL}/rcu/configs`,
          { body: setupTime },
          {
            headers: {
              secret: authT,
            },
          }
        );

        if (result.status >= 400) {
          console.error(result.data.message);
          FailedModal("Something went wrong");
          return false;
        }
        return true;
      } catch (error) {
        console.error(error);
      }
    },
    async controlAreaLight(payload) {
      // console.log(payload);
      const triggerScene = Encrypt(JSON.stringify(payload));
      // console.log("triggerScene :: ", triggerScene);
      try {
        const result = await axios.post(
          `${rcuURL}/rcu/control`,
          { body: triggerScene },
          {
            headers: {
              secret: authT,
            },
          }
        );
        if (result.status >= 400) {
          console.error(result.data.message);
          FailedModal("Something went wrong");
          return false;
        }
        // console.log(result);

        return true;
      } catch (error) {
        console.error(error);
      }
    },
    async getDevicesData() {
      try {
        const result = await axios.get(`${rcuURL}/rcu/device-list`, {
          headers: {
            secret: authT,
          },
        });
        // console.log("AREA GET", result);
        if (result?.status >= 400 || result == undefined) {
          console.error(result);
          // FailedModal("Something went wrong");
          return false;
        }
        // console.log(result.data.result);
        dispatch.powerManagement.updateDevicesDataState(result.data.result);

        return true;
      } catch (error) {
        console.error("CATCH: ", error);
      }
    },
    async editDevice(payload) {
      // console.log(payload);
      const body = Encrypt(JSON.stringify(payload));
      try {
        const result = await axios.post(
          `${rcuURL}/rcu/device-control`,
          { body: body },
          {
            headers: {
              secret: authT,
            },
          }
        );

        if (result.status >= 400) {
          console.error(result.data.message);
          FailedModal("Something went wrong");
          return false;
        }
        // console.log(result);
        return true;
      } catch (error) {
        console.error(error);
      }
    },
  }),
});
