import React from "react";
import { Link } from "react-router-dom"; // Import Link để điều hướng giữa các trang

function Navigation1(props) {
  return (
    <div className="nav1">
      <h1 className="nav1-header">Thư viện của bạn</h1>
      <ul className="nav1-list">
        <li>
          <Link
            className={`nav1-link ${props.type === undefined ? "active" : ""}`}
            to="/"
          >
            Lớp học
          </Link>
        </li>
        <li>
          <Link
            className={`nav1-link ${props.type === "modules" ? "active" : ""}`}
            to="/modules"
          >
            Học phần
          </Link>
        </li>
        <li>
          <Link
            className={`nav1-link ${props.type === "test" ? "active" : ""}`}
            to="/test"
          >
            Bài kiểm tra
          </Link>
        </li>
      </ul>
    </div>
  );
}

export default Navigation1;
