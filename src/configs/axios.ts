import axios from "axios";
import { encryptStorage } from "../utils/encryptStorage";
import { API_URL } from "./configs";

axios.defaults.baseURL = API_URL;
// axios.defaults.headers.common['Authorization'] = 'AUTH TOKEN';
axios.defaults.headers.common['Authorization'] = `Bearer eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJhQ3dkU0JWOVFBSDdneXkxOEt3SEhNaHNITzFDNDNfQ19WT1lUX0FFajFzIn0.eyJleHAiOjE3NDUxNjM2NTUsImlhdCI6MTc0NTE1NjQ1NSwianRpIjoiYjQ4Mjg3ZDItOWI0OS00MGE4LTk5ODAtOTAwYWQ2MTI2NDJkIiwiaXNzIjoiaHR0cHM6Ly9rZXljbG9hay5hcnRhbml0ZWNoLmNvbS9yZWFsbXMvanVyaXN0aWMiLCJhdWQiOiJhY2NvdW50Iiwic3ViIjoiZWZlNWEwNjAtODI0Zi00M2E3LWJjYzItMzE5YTRjYTljOWFlIiwidHlwIjoiQmVhcmVyIiwiYXpwIjoianVyaXN0aWMtY2xpZW50LWJhY2tlbmQiLCJzaWQiOiJiNWUzODQyZi00ZjlmLTQ0NTctOWI3Ni05YTI5Nzc3OWZlZmMiLCJhY3IiOiIxIiwiYWxsb3dlZC1vcmlnaW5zIjpbIi8qIl0sInJlYWxtX2FjY2VzcyI6eyJyb2xlcyI6WyJvZmZsaW5lX2FjY2VzcyIsImRlZmF1bHQtcm9sZXMtanVyaXN0aWMiLCJ1bWFfYXV0aG9yaXphdGlvbiJdfSwicmVzb3VyY2VfYWNjZXNzIjp7ImFjY291bnQiOnsicm9sZXMiOlsibWFuYWdlLWFjY291bnQiLCJtYW5hZ2UtYWNjb3VudC1saW5rcyIsInZpZXctcHJvZmlsZSJdfX0sInNjb3BlIjoicHJvZmlsZSBlbWFpbCIsImVtYWlsX3ZlcmlmaWVkIjpmYWxzZSwibmFtZSI6IkNodXRpd2F0IFJ1bW51bSIsInByZWZlcnJlZF91c2VybmFtZSI6ImNodXRpd2F0cnVtbnVtQGdtYWlsLmNvbSIsImdpdmVuX25hbWUiOiJDaHV0aXdhdCIsImZhbWlseV9uYW1lIjoiUnVtbnVtIiwiZW1haWwiOiJjaHV0aXdhdHJ1bW51bUBnbWFpbC5jb20ifQ.xDOyFmjNbKUv4xxycDvdrYnC9BlsmXLnSIzKvZWj6-LP-PO29iQX0Zw_lq_BHrU6Hhlb4GZXeoYoBdk-D5WWhOx66qDMu2DMjNgO0YhSJBmIpr-siBAfddhySUCTa5RCrabETEW0j8_X8ME5JCjLocm4XxsH_svQzBPi9-DnusPTG5Ib0SfqKVipwjRyIbCrLokJhpRdnl5hcXbeNQAj-TL42x0ZBrbIFmmGzVOQ6QIgMaAVyotnor8f3-zTDHdOICK0_TUpFZGZBP6ELSS2tDrDshCSgvYa2mdC2aRHyugZQJuRrmj7ClK7ncY_AdU_OfYQNfJTTNO8VvGSDr7nJA`
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
