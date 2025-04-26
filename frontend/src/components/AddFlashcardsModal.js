import React, { useState, useEffect } from "react";
import axios from "axios";

// Số lượng trường mặc định khi mở modal
const INITIAL_FIELD_COUNT = 5;

function AddFlashcardsModal({ isOpen, onClose, onSubmitSuccess, moduleId }) {
  // State lưu trữ danh sách các thẻ đang được nhập
  const [cardsToAdd, setCardsToAdd] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Reset state khi modal được mở
  useEffect(() => {
    if (isOpen) {
      // Tạo mảng ban đầu với số lượng trường mặc định
      const initialCards = Array.from({ length: INITIAL_FIELD_COUNT }, () => ({
        term: "",
        definition: "",
        // Thêm key duy nhất để React quản lý list hiệu quả hơn khi thêm/xóa
        tempId: Math.random().toString(36).substring(2, 15),
      }));
      setCardsToAdd(initialCards);
      setIsSubmitting(false);
      setError(null);
    }
  }, [isOpen]); // Chạy lại khi isOpen thay đổi

  // Hàm xử lý thay đổi input cho một thẻ cụ thể
  const handleInputChange = (index, field, value) => {
    // Tạo bản sao mới của mảng để tránh mutate state trực tiếp
    const updatedCards = cardsToAdd.map((card, i) => {
      if (i === index) {
        return { ...card, [field]: value }; // Cập nhật trường tương ứng
      }
      return card;
    });
    setCardsToAdd(updatedCards);
  };

  // Hàm thêm một cặp trường input mới
  const addMoreFields = () => {
    setCardsToAdd([
      ...cardsToAdd,
      {
        term: "",
        definition: "",
        tempId: Math.random().toString(36).substring(2, 15),
      },
    ]);
    // Tùy chọn: Scroll xuống cuối form sau khi thêm
    setTimeout(() => {
      const modalContent = document.querySelector(".modal-content");
      if (modalContent) {
        modalContent.scrollTop = modalContent.scrollHeight;
      }
    }, 0);
  };

  // Hàm xóa một cặp trường input
  const removeField = (indexToRemove) => {
    // Chỉ cho phép xóa nếu còn nhiều hơn 1 trường
    if (cardsToAdd.length > 1) {
      setCardsToAdd(cardsToAdd.filter((_, index) => index !== indexToRemove));
    } else {
      // Nếu chỉ còn 1, thì xóa trắng nội dung thay vì xóa hàng
      setCardsToAdd([
        {
          term: "",
          definition: "",
          tempId: Math.random().toString(36).substring(2, 15),
        },
      ]);
    }
  };

  // Hàm xử lý khi nhấn nút Save
  const handleSubmit = async () => {
    setError(null); // Reset lỗi

    // Lọc ra những thẻ có ít nhất term hoặc definition không trống
    const validCards = cardsToAdd.filter(
      (card) => card.term.trim() !== "" || card.definition.trim() !== ""
    );

    // Kiểm tra xem có thẻ nào hợp lệ không
    if (validCards.length === 0) {
      setError("Please fill in at least one flashcard.");
      return;
    }

    // Kiểm tra xem có thẻ nào chỉ điền 1 trong 2 không (tùy chọn)
    const incompleteCards = validCards.some(
      (card) => card.term.trim() === "" || card.definition.trim() === ""
    );
    if (incompleteCards) {
      if (
        !window.confirm(
          "Some cards have empty terms or definitions. Do you want to proceed?"
        )
      ) {
        return; // Hủy nếu người dùng không đồng ý
      }
      // Nếu đồng ý, lọc lại lần nữa để chỉ lấy thẻ hoàn chỉnh (hoặc giữ nguyên tùy logic)
      // Ví dụ: chỉ gửi thẻ hoàn chỉnh
      // const completeCards = validCards.filter(
      //     (card) => card.term.trim() !== "" && card.definition.trim() !== ""
      // );
      // if (completeCards.length === 0) {
      //     setError("No complete flashcards to add.");
      //     return;
      // }
      // cardsPayload = completeCards; // Gán lại payload
    }

    setIsSubmitting(true);

    try {
      // Gọi API để thêm nhiều thẻ cùng lúc (cần backend hỗ trợ)
      // Giả sử endpoint là /api/flashcards/bulk
      const response = await axios.post("/api/flashcards/bulk", {
        moduleId: moduleId,
        cards: validCards.map(({ term, definition }) => ({ term, definition })), // Chỉ gửi term và definition
      });

      onSubmitSuccess(response.data); // Gọi callback thành công với dữ liệu thẻ mới
      onClose(); // Đóng modal
    } catch (err) {
      console.error("Error adding multiple flashcards:", err);
      setError(
        err.response?.data?.message ||
          "Failed to add flashcards. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Không render gì nếu modal không mở
  if (!isOpen) {
    return null;
  }

  // Render modal
  return (
    <div className="modal" onClick={onClose}>
      {" "}
      {/* Click overlay để đóng */}
      <div
        className="modal-content add-cards-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        {" "}
        {/* Ngăn click content đóng modal */}
        <h2>Add New Flashcards</h2>
        {error && <p className="modal-error">{error}</p>}
        <div className="flashcard-input-list">
          {cardsToAdd.map((card, index) => (
            <div key={card.tempId} className="flashcard-input-row">
              <span className="card-index">{index + 1}.</span>
              <input
                type="text"
                placeholder="Term"
                value={card.term}
                onChange={(e) =>
                  handleInputChange(index, "term", e.target.value)
                }
                className="modal-input term-input"
                aria-label={`Term for card ${index + 1}`}
              />
              <input
                type="text"
                placeholder="Definition"
                value={card.definition}
                onChange={(e) =>
                  handleInputChange(index, "definition", e.target.value)
                }
                className="modal-input definition-input"
                aria-label={`Definition for card ${index + 1}`}
              />
              {/* Nút xóa hàng (chỉ hiển thị nếu có nhiều hơn 1 hàng) */}
              {cardsToAdd.length > 1 && (
                <button
                  onClick={() => removeField(index)}
                  className="btn-remove-field"
                  aria-label={`Remove card ${index + 1}`}
                  title="Remove this row"
                >
                  &times; {/* Ký tự X */}
                </button>
              )}
            </div>
          ))}
        </div>
        <button onClick={addMoreFields} className="btn-add-field">
          + Add More Fields
        </button>
        <div className="modal-actions">
          <button
            onClick={onClose}
            className="btn-cancel"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="btn-save"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save Cards"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddFlashcardsModal;
