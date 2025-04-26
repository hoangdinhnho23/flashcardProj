import React, { useState, useEffect } from "react";
import ListElement from "./ListElement";
import EditForm from "./EditForm";
import axiosInstance from "../api/axiosInstance";

const ClassList = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const fetchClasses = async () => {
    try {
      const response = await axiosInstance.get("/api/classes");
      setClasses(response.data);
    } catch (error) {
      console.error("Error fetching classes:", error);
    } finally {
      setLoading(false);
    }
  };

  /********************************************/
  /* Add Class */
  /********************************************/
  const handleAddClass = async (className) => {
    if (className && className.trim()) {
      axiosInstance
        .post("/api/classes", { name: className })
        .then((response) => {
          setClasses([...classes, response.data]);
          handleCloseAddModal();
        })
        .catch((error) => {
          console.error("Error adding class:", error);
          alert("Failed to add class.");
        });
    } else if (className !== null) {
      alert("Class name cannot be empty.");
    }
  };

  const handleOpenAddModal = () => {
    setIsAddModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
  };

  /********************************************/
  /* Edit Class */
  /********************************************/
  const handleOpenEditModal = (classItem) => {
    setSelectedClass(classItem);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedClass(null);
  };

  const handleUpdateClass = async (updatedName) => {
    if (!selectedClass || !updatedName || !updatedName.trim()) {
      alert("Class name cannot be empty.");
      return;
    }
    if (updatedName.trim() === selectedClass.name) {
      alert("No changes made to the class name.");
      return;
    }

    try {
      const response = await axiosInstance.put(
        `/api/classes/${selectedClass._id}`,
        {
          name: updatedName,
        }
      );
      setClasses(
        classes.map((cls) =>
          cls._id === selectedClass._id ? response.data : cls
        )
      );
      handleCloseEditModal();
    } catch (error) {
      console.error("Error updating class:", error);
      alert("Failed to update class.");
    }
  };

  /********************************************/
  /* Delete Class */
  /********************************************/
  const handleOpenDeleteModal = (classItem) => {
    setSelectedClass(classItem);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedClass(null);
  };

  const handleDeleteClass = async () => {
    if (!selectedClass) return;
    try {
      await axiosInstance.delete(`/api/classes/${selectedClass._id}`);
      setClasses(classes.filter((cls) => cls._id !== selectedClass._id));
      handleCloseDeleteModal();
    } catch (error) {
      console.error("Error deleting class:", error);
      alert("Failed to delete class.");
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  if (loading) return <div className="fz-18">Loading...</div>;

  return (
    <>
      <div className="class-part">
        <button className="btn-add-class" onClick={handleOpenAddModal}>
          Thêm lớp học
        </button>
        {classes.length === 0 && !loading ? (
          <p class="fz-18">
            Bạn chưa tạo lớp học nào. Ấn vào "Thêm lớp học" để tạo lớp học mới{" "}
          </p>
        ) : (
          <ul className="class-list">
            {classes.map((classItem) => (
              <ListElement
                key={classItem._id}
                data={classItem}
                type={"class"}
                onEditRequest={handleOpenEditModal} //
                onDeleteRequest={handleOpenDeleteModal}
              />
            ))}
          </ul>
        )}
      </div>

      {/* EditClassModal*/}
      {isEditModalOpen && selectedClass && (
        <div className="modal">
          <div className="modal-content">
            <h2>Chỉnh sửa lớp học</h2>
            <EditForm
              initialName={selectedClass.name}
              onSubmit={handleUpdateClass}
              onCancel={handleCloseEditModal}
            />
          </div>
        </div>
      )}

      {isDeleteModalOpen && selectedClass && (
        <div className="modal">
          <div className="modal-content">
            <h2>Xóa lớp học</h2>
            <p className="modal-text">Bạn có chắc chắn muốn xóa lớp học này?</p>
            <div className="modal-actions">
              <button className="btn-delete" onClick={handleDeleteClass}>
                Xóa
              </button>
              <button className="btn-cancel" onClick={handleCloseDeleteModal}>
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {isAddModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>Thêm lớp học</h2>
            <EditForm
              initialName={""}
              onSubmit={handleAddClass}
              onCancel={handleCloseAddModal}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default ClassList;
