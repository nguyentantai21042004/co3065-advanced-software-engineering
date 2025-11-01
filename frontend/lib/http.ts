import axios, {
  type AxiosInstance,
  type AxiosError,
  type InternalAxiosRequestConfig,
  type AxiosResponse,
} from "axios";

// Tạo axios instance với config mặc định
const http: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - Thêm token vào headers
http.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Bỏ qua việc thêm token cho các endpoint không cần auth
    const skipAuthUrls = [
      "/users/login",
      "/users/register",
      "/auth/forgot-password",
      "/auth/reset-password",
    ];
    const isSkipAuth = skipAuthUrls.some((url) => config.url?.includes(url));

    if (!isSkipAuth) {
      const token = localStorage.getItem("accessToken");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error: AxiosError) => {
    throw error;
  }
);

// Response interceptor - Xử lý errors và refresh token
http.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config;

    // Nếu là lỗi 401 và chưa retry
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !("_retry" in originalRequest)
    ) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (originalRequest as any)._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (refreshToken) {
          // Gọi API refresh token
          const response = await axios.post(
            `${
              process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"
            }/auth/refresh`,
            { refreshToken }
          );

          const { accessToken } = response.data;
          localStorage.setItem("accessToken", accessToken);

          // Retry request với token mới
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          }
          return http(originalRequest);
        }
      } catch (refreshError) {
        // Nếu refresh token fail, clear storage và redirect to login
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        globalThis.location.href = "/auth/login";
        throw refreshError;
      }
    }

    throw error;
  }
);

export default http;
