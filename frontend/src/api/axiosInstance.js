import axios from "axios";

// Xác định URL API dựa trên biến môi trường được cung cấp bởi build tool
// Create React App (và các tool tương tự) sẽ tự động chọn giá trị đúng
// từ .env.development khi chạy `npm start` và từ .env.production khi chạy `npm run build`.
const apiBaseUrl = process.env.REACT_APP_API_URL;

// Kiểm tra xem biến môi trường có được định nghĩa không, nếu không thì cung cấp fallback (cho an toàn)
if (!apiBaseUrl) {
  console.warn(
    "REACT_APP_API_URL is not defined. Falling back to default development URL."
  );
}

const axiosInstance = axios.create({
  // Sử dụng giá trị đã đọc hoặc fallback nếu cần
  baseURL: apiBaseUrl || "http://localhost:5000", // Sử dụng giá trị từ .env hoặc fallback
  timeout: 10000, // Thời gian chờ request (10 giây)
  headers: {
    "Content-Type": "application/json",
    // Bạn có thể thêm các header mặc định khác ở đây nếu cần
  },
});

export default axiosInstance;
