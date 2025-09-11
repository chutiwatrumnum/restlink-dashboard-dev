import { io } from "socket.io-client";
import { encryptStorage } from "../utils/encryptStorage";
import { SOCKET_URL } from "./configs";

const URL = SOCKET_URL as string;
const access_token = encryptStorage.getItem("access_token");

export const socket = io(URL, { autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 2,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 2000,
  timeout: 5000,
  extraHeaders: {
    Authorization: `bearer ${access_token}`,
    ["x-api-key"]: `juristic`,
  },
});
