import React, { useState } from "react";

const EditForm = ({ initialName, onSubmit, onCancel }) => {
  const [name, setName] = useState(initialName);

  const handleSubmit = (e) => {
    e.preventDefault(); // Ngăn form submit và reload trang
    onSubmit(name);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nhập tên lớp học mới"
        className="modal-input" // Thêm class để style
        autoFocus // Tự động focus vào input khi modal mở
      />
      <div className="modal-actions">
        <button type="submit" className="btn-save">
          Save
        </button>
        <button type="button" onClick={onCancel} className="btn-cancel">
          Cancel
        </button>{" "}
        {/* type="button" để không submit form */}
      </div>
    </form>
  );
};

export default EditForm;
