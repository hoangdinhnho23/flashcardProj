import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ModuleElement from "../components/ModuleElement";
import axiosInstance from "../api/axiosInstance";

const SettingIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke-width="1.5"
    stroke="currentColor"
    className="svg-icon"
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
    />
  </svg>
);

const ModuleList = () => {
  const [currentClass, setCurrentClass] = useState(null);
  const [modulesOfClass, setModulesOfClass] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(""); // Trực tiếp từ input
  const [searchTerm, setSearchTerm] = useState(""); // Giá trị đã debounce để query API
  const [showSettingMenu, setShowSettingMenu] = useState(false);
  const settingIconRef = useRef();
  const { classId } = useParams();

  const navigate = useNavigate(); // Thêm dòng này
  // Debounce search term
  useEffect(() => {
    const timerId = setTimeout(() => {
      setSearchTerm(searchInput);
    }, 500); // Delay 500ms

    return () => {
      clearTimeout(timerId);
    };
  }, [searchInput]);

  const fetchData = useCallback(async () => {
    if (!classId) return;
    setLoading(true);
    try {
      // Lấy thông tin lớp học
      const classResponse = await axiosInstance.get(
        `/api/classes/getClass/${classId}`
      );
      setCurrentClass(classResponse.data);

      // Lấy danh sách module cho lớp, có kèm tìm kiếm
      const params = new URLSearchParams();
      params.append("classId", classId);
      if (searchTerm) {
        params.append("search", searchTerm);
      }
      // Sử dụng endpoint /api/modules đã được cập nhật
      const response = await axiosInstance.get(
        `/api/modules?${params.toString()}`
      );
      setModulesOfClass(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      setCurrentClass(null);
      setModulesOfClass([]);
    } finally {
      setLoading(false);
    }
  }, [classId, searchTerm]); // Phụ thuộc vào classId và searchTerm (đã debounce)

  useEffect(() => {
    fetchData();
  }, [fetchData]); // fetchData đã bao gồm các dependencies của nó

  const handleAddModule = async () => {
    const newModuleName = prompt("Enter new module name:");
    if (newModuleName && classId) {
      try {
        const response = await axiosInstance.post("/api/modules", {
          name: newModuleName,
          classId: classId,
          description: "Default description",
        });
        // Tải lại dữ liệu để danh sách được cập nhật và sắp xếp đúng
        fetchData();
      } catch (error) {
        console.error("Error adding module:", error);
        alert("Failed to add module.");
      }
    }
  };

  const handleShowSettingMenu = () => setShowSettingMenu((v) => !v);

  // Đóng menu khi click ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        settingIconRef.current &&
        !settingIconRef.current.contains(e.target)
      ) {
        setShowSettingMenu(false);
      }
    };
    if (showSettingMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showSettingMenu]);

  // Thêm hàm sửa tên lớp
  const handleEditClassName = async () => {
    const newName = prompt("Nhập tên lớp mới:", currentClass?.name || "");
    if (newName && newName !== currentClass?.name) {
      try {
        await axiosInstance.put(`/api/classes/${currentClass._id}`, {
          name: newName,
        });
        fetchData();
      } catch (err) {
        alert("Đổi tên lớp thất bại!");
      }
    }
  };

  const handleRemoveClass = async () => {
    if (window.confirm("Bạn có chắc chắn muốn xóa lớp này?")) {
      try {
        await axiosInstance.delete(`/api/classes/${currentClass._id}`);
        alert("Xóa lớp thành công!");
        navigate("/");
        setCurrentClass(null);
        setModulesOfClass([]);
      } catch (err) {
        alert("Xóa lớp thất bại!");
      }
    }
  };

  // Hiển thị loading chỉ khi chưa có module nào và đang tải
  if (loading && modulesOfClass.length === 0)
    return <div>Loading modules...</div>;

  return (
    <div className="container">
      {currentClass && (
        <>
          <div className="moduleHeader">
            <div>
              <h1 className="nav1-header">{`${currentClass.name}`}</h1>
            </div>
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search modules..."
                className="module-list-search-input" // Sử dụng class CSS thay vì inline style
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
            <div className="setting-section">
              <div
                className="setting-icon"
                ref={settingIconRef}
                onClick={handleShowSettingMenu}
              >
                <SettingIcon />
                {showSettingMenu && (
                  <div className="setting-menu-modal">
                    <button onClick={handleAddModule}>Thêm học phần</button>
                    <button onClick={handleEditClassName}>Sửa tên lớp</button>
                    <button onClick={handleRemoveClass}>Xóa</button>
                  </div>
                )}
                {!showSettingMenu && (
                  <span className="more-text">Xem thêm</span>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {modulesOfClass.length === 0 && !loading ? (
        <p>
          No modules found for this class
          {searchTerm ? " matching your search" : ""}.
        </p>
      ) : (
        <ul className="module-list-in-class module-list">
          {modulesOfClass.map((module) => (
            <li key={module._id}>
              <ModuleElement data={module} />
            </li>
          ))}
        </ul>
      )}

      {/* <button
        onClick={handleAddModule}
        className="btn-add-class"
        style={{ marginTop: "2rem" }}
      >
        Add Module
      </button> */}
    </div>
  );
};

export default ModuleList;
export { SettingIcon };
