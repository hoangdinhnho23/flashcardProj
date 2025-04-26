import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom"; // Import Link từ react-router-dom
import Navigation1 from "../components/Navigation1";
import ClassList from "../components/ClassList";
import ModuleList from "../components/ModuleList";

const Home = () => {
  const { type } = useParams(); // Lấy tham số từ URL nếu cần thiết

  useEffect(() => {
    console.log("Type:", type); // Kiểm tra giá trị của type
  }, [type]);
  return (
    <div className="container">
      <Navigation1 type={type} />
      <div className="part-content">
        {type === "modules" ? (
          <ModuleList />
        ) : type === "test" ? (
          <h1>Bạn chưa tạo bài kiểm tra nào</h1>
        ) : (
          <ClassList />
        )}
      </div>
    </div>
  );
};

export default Home;
