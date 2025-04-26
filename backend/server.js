const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const classRoutes = require('./routes/classRoutes');
const flashcardRoutes = require('./routes/flashcardRoutes');
const moduleRoutes = require('./routes/moduleRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

connectDB(); // Kết nối đến MongoDB

// Middleware
app.use(cors()); // Cho phép tất cả các nguồn gốc truy cập
app.use(express.json()); // Phân tích dữ liệu JSON trong yêu cầu

//Routes
app.use('/api/classes', classRoutes); // Đường dẫn cho lớp học
app.use('/api/flashcards', flashcardRoutes); // Đường dẫn cho flashcard
app.use('/api/modules', moduleRoutes); // Đường dẫn cho module

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})