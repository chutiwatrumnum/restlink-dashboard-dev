import axios from "axios";
import { encryptStorage } from "../utils/encryptStorage";
import { API_URL } from "./configs";

axios.defaults.baseURL = API_URL;
// axios.defaults.headers.common['Authorization'] = 'AUTH TOKEN';
// axios.defaults.headers.common['Authorization'] = `Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsInJvbGUiOiIwIiwicm9sZV9yYW5rIjowLCJpYXQiOjE2NzQ1NDg0MDAsImV4cCI6MTY3NDgwNzYwMH0.jZUscD3QJ1MiWUmvpRJuXrD7g0KeW0ATdQKXqJiOha0r_KOlvOeZcXI7iFTAHScxyFAZCsHzS7wQMniQfJeWd5RsRv98_TVNkERguIDPF-rfvyx9TfJogBeRA-yEJdEo5hBMMcxkdzRUfOxl9d4gBbQY4rRlI71nJjSdgwf6kpjQQJcdgrTDJS5z7DWeZS1xo2x-545gXPGTkcPgQB9Q43rrv-8zSP_uOVNmsA3LUD1SslqVv6AGIdv5g2CUxqwy4e-i4Lnm4nHFOXCgm6ZxAiPURBTDsZOmPUZ3Y0JIdsQgqpVcqJZ_jxfiKx3vtvI9oQD5BXh1QwbdQXHfQlD9im1Zddpp6NST_OA2hftVdPAKtzU_oxpgKjMR8IVlxNVY4skb3Z_Eb-cSdNN9T2TvDFdR767QvkVmfg9-MI5k3hKUxYpq2MSJ4jD8cETq883vZtTBFk-HTH8plC4eC4imP_URUMETIMOkl3ymc3CkI4AyB1ov2frNaS_5-D28JlQgZ93sDqzLPysnd_WmfTUN2Cq6EwuPYMV1EOtWiQz4u8_EXpJ7BEayEAl2vkw7Kmj8TGirfohH3yDGz_NNiPza4iVH4G7DekbfUlO2ry1cP8D3SqNGpKfvcVd-V4bylEhpMt82S7GAnr2TQeTGnvDMffrHdzILpG9CxVjcWr_tVow`
axios.defaults.headers.post["Content-Type"] = "application/json";
// axios.defaults.headers.get["Access-Control-Allow-Origin"] = `${API_URL}`;
// axios.defaults.headers.post["Access-Control-Allow-Origin"] = `${API_URL}`;
// axios.defaults.headers.get["Access-Control-Allow-Credentials"] = true;
// axios.defaults.headers.post["Access-Control-Allow-Credentials"] = true;
// axios.defaults.headers.get["Access-Control-Allow-Methods"] = "GET";
// axios.defaults.headers.post["Access-Control-Allow-Methods"] = "POST";

axios.interceptors.request.use(
  async (request) => {
    const accessToken = await encryptStorage.getItem("accessToken");
    if (accessToken !== undefined) {
      request.headers.Authorization = `Bearer ${accessToken}`;
    }
    return request;
  },
  (error) => {
    console.log(error);
    return Promise.reject(error);
  }
);

axios.interceptors.response.use(
  (response) => {
    // Edit response config
    return response;
  },
  (error) => {
    // return Promise.reject(error);/
    return error.response;
  }
);
