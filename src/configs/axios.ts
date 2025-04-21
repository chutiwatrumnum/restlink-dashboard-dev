import axios from "axios";
import { encryptStorage } from "../utils/encryptStorage";
import { API_URL } from "./configs";

axios.defaults.baseURL = API_URL;
// axios.defaults.headers.common['Authorization'] = 'AUTH TOKEN';
axios.defaults.headers.common['Authorization'] = `Bearer eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJhQ3dkU0JWOVFBSDdneXkxOEt3SEhNaHNITzFDNDNfQ19WT1lUX0FFajFzIn0.eyJleHAiOjE3NDUyNjA4ODgsImlhdCI6MTc0NTI0NjQ4OCwianRpIjoiODc4YjQ1OTUtNmYyOS00YmIxLWJhZmItYTBkMTVhYjNiZjM0IiwiaXNzIjoiaHR0cHM6Ly9rZXljbG9hay5hcnRhbml0ZWNoLmNvbS9yZWFsbXMvanVyaXN0aWMiLCJhdWQiOiJhY2NvdW50Iiwic3ViIjoiZWZlNWEwNjAtODI0Zi00M2E3LWJjYzItMzE5YTRjYTljOWFlIiwidHlwIjoiQmVhcmVyIiwiYXpwIjoianVyaXN0aWMtY2xpZW50LWJhY2tlbmQiLCJzaWQiOiIzMzkxMDhjZC1hZDExLTQ3MGEtYTUxYS1kM2NjNTNjYTBjNjQiLCJhY3IiOiIxIiwiYWxsb3dlZC1vcmlnaW5zIjpbIi8qIl0sInJlYWxtX2FjY2VzcyI6eyJyb2xlcyI6WyJvZmZsaW5lX2FjY2VzcyIsImRlZmF1bHQtcm9sZXMtanVyaXN0aWMiLCJ1bWFfYXV0aG9yaXphdGlvbiJdfSwicmVzb3VyY2VfYWNjZXNzIjp7ImFjY291bnQiOnsicm9sZXMiOlsibWFuYWdlLWFjY291bnQiLCJtYW5hZ2UtYWNjb3VudC1saW5rcyIsInZpZXctcHJvZmlsZSJdfX0sInNjb3BlIjoicHJvZmlsZSBlbWFpbCIsImVtYWlsX3ZlcmlmaWVkIjpmYWxzZSwibmFtZSI6IkNodXRpd2F0IFJ1bW51bSIsInByZWZlcnJlZF91c2VybmFtZSI6ImNodXRpd2F0cnVtbnVtQGdtYWlsLmNvbSIsImdpdmVuX25hbWUiOiJDaHV0aXdhdCIsImZhbWlseV9uYW1lIjoiUnVtbnVtIiwiZW1haWwiOiJjaHV0aXdhdHJ1bW51bUBnbWFpbC5jb20ifQ.Af62_INkPCUHZ115oOdd3Tf19uLjwRJWIj0_bcJy-5xJ_FH8cDHOX4CMver-rvtnBYDzuRYOrfsWgvSdTnVqenokNpU4AnnNqRmoPDsZFW0t26PeFrojbv4wkLzV3tGTKG6bpD7Wk1xq1vbSTX-3_kwMnoe8xiUtDTMInMLNRsPz_5N2os5qqzEgxjr6AFBgZJS-z5RHQO0IOcy1efjCN1LmqIOug00RkZj30uhlK6dlXhNeFCZLz-7vcpRdZR2mPjihKD98AnE_j2V88VHzC00hvaFucoLWr4pfCim9v6Wa25p4hjg8qONKbsL-JQ3OdRgGS6GltK5ZfFDEwa-vJA`
axios.defaults.headers.post["Content-Type"] = "application/json";
axios.defaults.headers.common['x-api-key'] = `9c89fc0d-5153-448b-a98a-9434f4ec1114`
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
