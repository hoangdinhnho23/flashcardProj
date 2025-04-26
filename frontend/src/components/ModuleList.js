import React, { useState, useEffect } from "react";
import ListElement from "./ListElement";
import EditForm from "./EditForm";
import axiosInstance from "../api/axiosInstance";

function Module() {
  const [allModules, setAllModules] = useState([]); // Khởi tạo state để lưu danh sách học phần
  const [loading, setLoading] = useState(true); // Khởi tạo state để theo dõi trạng thái tải dữ liệu
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const fetchAllModules = async () => {
    try {
      const response = await axiosInstance.get("/api/modules"); // Gửi yêu cầu GET đến API để lấy danh sách học phần
      setAllModules(response.data); // Cập nhật state với dữ liệu nhận được
    } catch (error) {
      console.error("Error fetching modules:", error); // In lỗi nếu có
    } finally {
      setLoading(false); // Đặt trạng thái tải dữ liệu thành false sau khi hoàn tất
    }
  };

  useEffect(() => {
    fetchAllModules(); // Gọi hàm để lấy danh sách học phần khi component được mount
  }, []);
  if (loading) return <div className="fz-18">Loading...</div>;

  /****************************************/
  /* EditModal */
  /****************************************/

  const handleOpenEditModal = (moduleItem) => {
    setSelectedModule(moduleItem);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedModule(null);
  };

  const handleUpdateModule = async (updatedName) => {
    if (!selectedModule || !updatedName || !updatedName.trim()) {
      alert("Tên học phần không được để trống");
    }
    if (updatedName.trim() === selectedModule.name) {
      alert("Bạn chưa thay đổi tên học phần");
    }
    if (updatedName && updatedName.trim()) {
      try {
        const response = await axiosInstance.put(
          `/api/modules/${selectedModule._id}`,
          {
            name: updatedName,
          }
        );
        setAllModules(
          allModules.map((module) =>
            module._id === selectedModule._id ? response.data : module
          )
        );
        handleCloseEditModal();
      } catch (error) {
        console.error("Error updating module:", error);
      }
    }
  };

  /****************************************/
  /* DeleteModal */
  /****************************************/
  const handleOpenDeleteModal = (moduleItem) => {
    setSelectedModule(moduleItem);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedModule(null);
  };

  const handleDeleteModule = async () => {
    if (!selectedModule) return;
    try {
      await axiosInstance.delete(`/api/modules/${selectedModule._id}`);
      setAllModules(
        allModules.filter((module) => module._id !== selectedModule._id)
      );
      handleCloseDeleteModal();
    } catch (error) {
      console.log("Error deleting module", error);
    }
  };

  return (
    <>
      <div>
        {allModules.length === 0 && !loading ? (
          <p> Bạn chưa tạo học phần nào</p>
        ) : (
          <ul className="module-list">
            {allModules.map((module) => {
              return (
                <ListElement
                  key={module._id}
                  data={module}
                  type={"module"}
                  onEditRequest={handleOpenEditModal}
                  onDeleteRequest={handleOpenDeleteModal}
                />
              );
            })}
          </ul>
        )}
      </div>
      {isEditModalOpen && selectedModule && (
        <div className="modal">
          <div className="modal-content">
            <h2>Chỉnh sửa học phần</h2>
            <EditForm
              initialName={selectedModule.name}
              onSubmit={handleUpdateModule}
              onCancel={handleCloseEditModal}
            />
          </div>
        </div>
      )}

      {isDeleteModalOpen && selectedModule && (
        <div className="modal">
          <div className="modal-content">
            <h2>Xóa học phần</h2>
            <p className="modal-text">
              Bạn có chắc chắn muốn xóa học phần này?
            </p>
            <div className="modal-actions">
              <button className="btn-delete" onClick={handleDeleteModule}>
                Xóa
              </button>
              <button className="btn-cancel" onClick={handleCloseDeleteModal}>
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Module;
