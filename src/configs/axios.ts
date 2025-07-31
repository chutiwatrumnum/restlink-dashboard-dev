import axios from "axios";
import { encryptStorage } from "../utils/encryptStorage";
import { API_URL } from "./configs";
import { store } from "../stores";

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
    return request;
  },
  (error) => {
    console.log("❌ Request interceptor error:", error);
    return Promise.reject(error);
  }
);

axios.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // ตรวจสอบถ้าเป็น error 401 (Unauthorized) และยังไม่ได้ retry
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      // ตรวจสอบว่าอยู่ในหน้า login อยู่แล้วหรือไม่
      if (!window.location.pathname.includes('/auth') && !window.location.pathname.includes('/login')) {
        originalRequest._retry = true; // ป้องกัน infinite loop
        
        try {
          // ลองทำ refresh token แบบเดียวกับ AuthorizedLayout
          const resReToken = await store.dispatch.userAuth.refreshTokenNew();
          
          if (resReToken) {
            // ถ้า refresh สำเร็จ ให้ retry request เดิมด้วย token ใหม่
            const newAccessToken = await encryptStorage.getItem("access_token");
            if (newAccessToken) {
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
              return axios(originalRequest);
            }
          } else {
            // ถ้า refresh ไม่สำเร็จ ให้ logout
            await store.dispatch.userAuth.onLogout();
            setTimeout(() => {
              window.location.href = '/auth';
            }, 100);
          }
          
        } catch (refreshError) {
          // ถ้า refresh token ล้มเหลว ให้ logout
          await store.dispatch.userAuth.onLogout();
          setTimeout(() => {
            window.location.href = '/auth';
          }, 100);
        }
      }
    }
    
    return error.response;
  }
);

export default axios;