import axios from "axios";
import { encryptStorage } from "../utils/encryptStorage";
import { API_URL } from "./configs";

console.log(API_URL, 'API_URL')
axios.defaults.baseURL = API_URL;
axios.defaults.headers.post["Content-Type"] = "application/json";

// Remove hard-coded headers - they should be set dynamically in interceptors
// axios.defaults.headers.common['Authorization'] = `Bearer eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJhQ3dkU0JWOVFBSDdneXkxOEt3SEhNaHNITzFDNDNfQ19WT1lUX0FFajFzIn0.eyJleHAiOjE3NDUyOTUzNTEsImlhdCI6MTc0NTI4MDk1MSwianRpIjoiMzRlMmY4YWItMDY4YS00NDRlLThjNzMtNWUwMzBlN2VhNzZjIiwiaXNzIjoiaHR0cHM6Ly9rZXljbG9hay5hcnRhbml0ZWNoLmNvbS9yZWFsbXMvanVyaXN0aWMiLCJhdWQiOiJhY2NvdW50Iiwic3ViIjoiZWZlNWEwNjAtODI0Zi00M2E3LWJjYzItMzE5YTRjYTljOWFlIiwidHlwIjoiQmVhcmVyIiwiYXpwIjoianVyaXN0aWMtY2xpZW50LWJhY2tlbmQiLCJzaWQiOiI0YzVlMmM4OC1hODc0LTQwNmYtYWM3NS1lY2ZhMjc3NmUxNjYiLCJhY3IiOiIxIiwiYWxsb3dlZC1vcmlnaW5zIjpbIi8qIl0sInJlYWxtX2FjY2VzcyI6eyJyb2xlcyI6WyJvZmZsaW5lX2FjY2VzcyIsImRlZmF1bHQtcm9sZXMtanVyaXN0aWMiLCJ1bWFfYXV0aG9yaXphdGlvbiJdfSwicmVzb3VyY2VfYWNjZXNzIjp7ImFjY291bnQiOnsicm9sZXMiOlsibWFuYWdlLWFjY291bnQiLCJtYW5hZ2UtYWNjb3VudC1saW5rcyIsInZpZXctcHJvZmlsZSJdfX0sInNjb3BlIjoicHJvZmlsZSBlbWFpbCIsImVtYWlsX3ZlcmlmaWVkIjpmYWxzZSwibmFtZSI6IkNodXRpd2F0IFJ1bW51bSIsInByZWZlcnJlZF91c2VybmFtZSI6ImNodXRpd2F0cnVtbnVtQGdtYWlsLmNvbSIsImdpdmVuX25hbWUiOiJDaHV0aXdhdCIsImZhbWlseV9uYW1lIjoiUnVtbnVtIiwiZW1haWwiOiJjaHV0aXdhdHJ1bW51bUBnbWFpbC5jb20ifQ.ndHEcIYoAFRRETMq_Y7i7OLnqttPJAUXrLaEcyiY2SyOp6wk0AhXoxA4nObFQLsu_UFwz2v7hP6EHbzzmSJs1NKZqGt2mcDjxo7CQ1GiO-_9RJazATwxtMJkeHRFWqGoqZZCGxOqQseB1A5fPc-upYM-Hwe4waMHn6USaAIasUdtERZeb9C9BZDmZjF8EwQRryeW2MINv4uOtn2e2H_ExrvLRvIPXzFrdZEbjXS4VkgJaur1Jsrw3TwMbdDeU39K_APft22sJp-C6i4_55EoaW2oH5cJnw21fTYnX589L64ZlE7xW-YqGLGUAKfkrbbt6D14bY44X1qqUV69heQX6g`
// axios.defaults.headers.common['x-api-key'] = `9c89fc0d-5153-448b-a98a-9434f4ec1114`

axios.interceptors.request.use(
  async (request) => {
    const access_token = await encryptStorage.getItem("access_token");
    const projectID = await encryptStorage.getItem("projectId");

    // Set Authorization header if token exists
    if (access_token && access_token !== "undefined" && access_token !== null) {
      request.headers.Authorization = `Bearer ${access_token}`;
    }

    // Set x-api-key header if projectID exists
    if (projectID && projectID !== "undefined" && projectID !== null) {
      request.headers["x-api-key"] = projectID;
    } else {
      // Fallback to default x-api-key for login requests
      request.headers["x-api-key"] = "9c89fc0d-5153-448b-a98a-9434f4ec1114";
    }

    console.log("🔧 Request interceptor:", {
      url: request.url,
      method: request.method,
      hasAuth: !!request.headers.Authorization,
      apiKey: request.headers["x-api-key"]
    });

    return request;
  },
  (error) => {
    console.log("❌ Request interceptor error:", error);
    return Promise.reject(error);
  }
);

axios.interceptors.response.use(
  (response) => {
    console.log("✅ Response interceptor:", {
      status: response.status,
      url: response.config.url,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.log("❌ Response interceptor error:", {
      status: error.response?.status,
      url: error.config?.url,
      message: error.response?.data?.message || error.message
    });
    return error.response;
  }
);

export default axios;