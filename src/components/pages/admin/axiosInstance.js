import axios from "axios";

const API_BASE_URL = "https://e-commerceapi-uk5z.onrender.com";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
});

// Thêm token vào tất cả request nếu có
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // Lấy token mới nhất mỗi lần gửi request
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;


// axiosInstance

// import axios from "axios";

// // Lấy token từ localStorage hoặc nơi bạn lưu trữ
// const token = localStorage.getItem("token");

// const axiosInstance = axios.create({
//   baseURL: "http://localhost:8080", // URL API của backend
//   headers: {
//     Authorization: Bearer ${token}, // Kẹp token vào header
//   },
// });

// export default axiosInstance;