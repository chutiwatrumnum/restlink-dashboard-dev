import axios from "axios";
import { encryptStorage } from "../utils/encryptStorage";
import { API_URL } from "./configs";

axios.defaults.baseURL = API_URL;
// axios.defaults.headers.common['Authorization'] = 'AUTH TOKEN';
axios.defaults.headers.common['Authorization'] = `Bearer eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJhQ3dkU0JWOVFBSDdneXkxOEt3SEhNaHNITzFDNDNfQ19WT1lUX0FFajFzIn0.eyJleHAiOjE3NDUyOTUzNTEsImlhdCI6MTc0NTI4MDk1MSwianRpIjoiMzRlMmY4YWItMDY4YS00NDRlLThjNzMtNWUwMzBlN2VhNzZjIiwiaXNzIjoiaHR0cHM6Ly9rZXljbG9hay5hcnRhbml0ZWNoLmNvbS9yZWFsbXMvanVyaXN0aWMiLCJhdWQiOiJhY2NvdW50Iiwic3ViIjoiZWZlNWEwNjAtODI0Zi00M2E3LWJjYzItMzE5YTRjYTljOWFlIiwidHlwIjoiQmVhcmVyIiwiYXpwIjoianVyaXN0aWMtY2xpZW50LWJhY2tlbmQiLCJzaWQiOiI0YzVlMmM4OC1hODc0LTQwNmYtYWM3NS1lY2ZhMjc3NmUxNjYiLCJhY3IiOiIxIiwiYWxsb3dlZC1vcmlnaW5zIjpbIi8qIl0sInJlYWxtX2FjY2VzcyI6eyJyb2xlcyI6WyJvZmZsaW5lX2FjY2VzcyIsImRlZmF1bHQtcm9sZXMtanVyaXN0aWMiLCJ1bWFfYXV0aG9yaXphdGlvbiJdfSwicmVzb3VyY2VfYWNjZXNzIjp7ImFjY291bnQiOnsicm9sZXMiOlsibWFuYWdlLWFjY291bnQiLCJtYW5hZ2UtYWNjb3VudC1saW5rcyIsInZpZXctcHJvZmlsZSJdfX0sInNjb3BlIjoicHJvZmlsZSBlbWFpbCIsImVtYWlsX3ZlcmlmaWVkIjpmYWxzZSwibmFtZSI6IkNodXRpd2F0IFJ1bW51bSIsInByZWZlcnJlZF91c2VybmFtZSI6ImNodXRpd2F0cnVtbnVtQGdtYWlsLmNvbSIsImdpdmVuX25hbWUiOiJDaHV0aXdhdCIsImZhbWlseV9uYW1lIjoiUnVtbnVtIiwiZW1haWwiOiJjaHV0aXdhdHJ1bW51bUBnbWFpbC5jb20ifQ.ndHEcIYoAFRRETMq_Y7i7OLnqttPJAUXrLaEcyiY2SyOp6wk0AhXoxA4nObFQLsu_UFwz2v7hP6EHbzzmSJs1NKZqGt2mcDjxo7CQ1GiO-_9RJazATwxtMJkeHRFWqGoqZZCGxOqQseB1A5fPc-upYM-Hwe4waMHn6USaAIasUdtERZeb9C9BZDmZjF8EwQRryeW2MINv4uOtn2e2H_ExrvLRvIPXzFrdZEbjXS4VkgJaur1Jsrw3TwMbdDeU39K_APft22sJp-C6i4_55EoaW2oH5cJnw21fTYnX589L64ZlE7xW-YqGLGUAKfkrbbt6D14bY44X1qqUV69heQX6g`
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
    const access_token = await encryptStorage.getItem("access_token");
    const projectID = await encryptStorage.getItem("projectId");
    if (access_token !== undefined) {
      request.headers.Authorization = `Bearer ${access_token}`;
    }
    if (projectID) {
      request.headers["x-api-key"] = projectID;
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
