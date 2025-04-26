require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/database");
const classRoutes = require("./routes/classRoutes");
const flashcardRoutes = require("./routes/flashcardRoutes");
const moduleRoutes = require("./routes/moduleRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

connectDB(); // Kết nối đến MongoDB

// Middleware
// Middleware
// Cấu hình CORS để cho phép frontend (cả local và deployed) gọi API
const allowedOrigins = [process.env.FRONTEND_URL, "URL_NETLIFY"]; // Sẽ cập nhật URL Netlify sau
app.use(
  cors({
    origin: function (origin, callback) {
      // Cho phép request không có origin (như Postman) hoặc từ các origin trong danh sách
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.error(`CORS Error: Origin ${origin} not allowed.`); // Log lỗi để debug
        callback(new Error("Not allowed by CORS")); // Chặn request
      }
    },
    credentials: true, // Nếu bạn dùng cookie/session
  })
);
app.use(express.json()); // Để parse JSON body

//Routes
app.use("/api/classes", classRoutes); // Đường dẫn cho lớp học
app.use("/api/flashcards", flashcardRoutes); // Đường dẫn cho flashcard
app.use("/api/modules", moduleRoutes); // Đường dẫn cho module

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
