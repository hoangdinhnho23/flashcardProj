import React from "react";
import FlashcardList from "./pages/FlashcardList";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom"; // Import các thành phần cần thiết từ react-router-dom
import Home from "./pages/Home"; // Import trang Home
import Modules from "./pages/Modules"; // Import trang Modules
const AppLayout = ({ children }) => {
  const location = useLocation();
  const containerClass =
    location.pathname.startsWith("/class/") ||
    location.pathname.startsWith("/module/")
      ? "app-container"
      : "app-container";
  return <div className={containerClass}>{children}</div>;
};

const App = () => {
  return (
    <Router>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/:type" element={<Home />} />
        </Routes>
        <Routes>
          <Route path="/class/:classId" element={<Modules />} />
          {/* Trang danh sách học phần theo lớp học */}
          <Route path="/module/:moduleId" element={<FlashcardList />} />
          {/* Trang danh sách flashcard theo học phần */}
        </Routes>
      </AppLayout>
    </Router>
  );
};

export default App;
