import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import FlashcardElement from "../components/FlashcardElement";
import AddFlashcardsModal from "../components/AddFlashcardsModal"; // Import modal mới
import axiosInstance from "../api/axiosInstance";

const FlashcardList = () => {
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(true);
  const { moduleId } = useParams();
  // Xóa state cho input đơn lẻ cũ
  // const [newTerm, setNewTerm] = useState("");
  // const [newDefinition, setNewDefinition] = useState("");

  const [currentIndex, setCurrentIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState("none");

  // State mới để quản lý modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // --- Fetch Flashcards ---
  // (Giữ nguyên hàm fetchFlashcards)
  const fetchFlashcards = useCallback(async () => {
    // Bọc trong useCallback
    setLoading(true);
    try {
      // *** QUAN TRỌNG: Đảm bảo endpoint này trả về danh sách flashcards của module ***
      // Endpoint có thể là `/api/modules/${moduleId}/flashcards` hoặc tương tự
      const response = await axiosInstance.get(`/api/modules/${moduleId}`); // SỬA ENDPOINT NẾU CẦN
      setFlashcards(response.data || []);
      setCurrentIndex(0);
      setSlideDirection("none");
    } catch (error) {
      console.error("Error fetching flashcards:", error);
      setFlashcards([]); // Set rỗng nếu lỗi
    } finally {
      setLoading(false);
    }
  }, [moduleId]); // Phụ thuộc moduleId

  useEffect(() => {
    if (moduleId) {
      // Chỉ fetch khi có moduleId
      fetchFlashcards();
    }
  }, [fetchFlashcards, moduleId]); // Thêm moduleId vào dependencies

  // --- Xóa hàm handleAddFlashcard cũ ---

  // --- Hàm mở modal ---
  const openAddModal = () => {
    setIsAddModalOpen(true);
  };

  // --- Hàm đóng modal ---
  const closeAddModal = () => {
    setIsAddModalOpen(false);
  };

  // --- Hàm xử lý khi modal thêm thành công ---
  const handleAddSuccess = (newlyAddedCards) => {
    // Kiểm tra xem newlyAddedCards có phải là mảng không
    if (Array.isArray(newlyAddedCards)) {
      // Cập nhật state flashcards với các thẻ mới
      const updatedFlashcards = [...flashcards, ...newlyAddedCards];
      setFlashcards(updatedFlashcards);
      // Tùy chọn: Chuyển đến thẻ đầu tiên mới được thêm
      if (newlyAddedCards.length > 0) {
        setCurrentIndex(flashcards.length); // Index của thẻ đầu tiên trong nhóm mới thêm
        setSlideDirection("none"); // Không cần hiệu ứng slide khi thêm nhiều thẻ
      }
    } else {
      console.warn(
        "handleAddSuccess received non-array data:",
        newlyAddedCards
      );
      // Có thể fetch lại toàn bộ danh sách nếu API không trả về đúng chuẩn
      fetchFlashcards();
    }
    closeAddModal(); // Đóng modal sau khi xử lý xong
  };

  // --- Navigation Functions (goToNextCard, goToPreviousCard) ---
  // (Giữ nguyên)
  const goToNextCard = useCallback(() => {
    if (flashcards.length === 0) return;
    setSlideDirection("right");
    setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % flashcards.length);
      setSlideDirection("none"); // Reset direction sau khi chuyển
    }, 50);
  }, [flashcards.length]);

  const goToPreviousCard = useCallback(() => {
    if (flashcards.length === 0) return;
    setSlideDirection("left");
    setTimeout(() => {
      setCurrentIndex(
        (prevIndex) => (prevIndex - 1 + flashcards.length) % flashcards.length
      );
      setSlideDirection("none"); // Reset direction sau khi chuyển
    }, 50);
  }, [flashcards.length]);

  // --- Keyboard Navigation ---
  // (Giữ nguyên)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Không xử lý phím mũi tên nếu đang focus vào input trong modal
      if (
        isAddModalOpen &&
        (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")
      ) {
        return;
      }

      if (flashcards.length === 0) return;
      if (e.key === "ArrowRight") goToNextCard();
      if (e.key === "ArrowLeft") goToPreviousCard();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [flashcards.length, goToNextCard, goToPreviousCard, isAddModalOpen]); // Thêm isAddModalOpen

  // --- Render Logic ---
  if (loading) return <div>Loading...</div>;

  const currentCard = flashcards.length > 0 ? flashcards[currentIndex] : null;

  // Class động cho animation (cần reset direction sau khi animation chạy)
  let cardContainerClass = "flashcard-display-area";
  if (slideDirection === "left") cardContainerClass += " slide-enter-left";
  if (slideDirection === "right") cardContainerClass += " slide-enter-right";

  return (
    <div className="flashcard-page-container">
      <h1>Flashcard Deck</h1>

      {/* Nút mở modal thêm thẻ */}
      <button onClick={openAddModal} className="btn-open-add-modal">
        + Add New Cards
      </button>

      {/* Khu vực hiển thị thẻ */}
      <div className="flashcard-viewer">
        {flashcards.length > 0 ? (
          <>
            {/* Nút điều hướng trái */}
            <button
              className="nav-btn left-btn"
              onClick={goToPreviousCard}
              aria-label="Previous card"
              disabled={flashcards.length <= 1}
            >
              {/* SVG icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="svg-icon"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
                />
              </svg>
            </button>

            {/* Container chứa thẻ hiện tại */}
            <div
              className={cardContainerClass}
              key={currentCard?._id || currentIndex}
              // Reset animation class sau khi hoàn thành
              onAnimationEnd={() => setSlideDirection("none")}
            >
              {currentCard && <FlashcardElement data={currentCard} />}
            </div>

            {/* Nút điều hướng phải */}
            <button
              className="nav-btn right-btn"
              onClick={goToNextCard}
              aria-label="Next card"
              disabled={flashcards.length <= 1}
            >
              {/* SVG icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="svg-icon"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                />
              </svg>
            </button>
          </>
        ) : (
          <div className="no-flashcards-message">
            No flashcards yet. Click "Add New Cards" to get started!
          </div>
        )}
      </div>

      {/* Hiển thị số thứ tự thẻ */}
      {flashcards.length > 0 && (
        <div className="flashcard-counter">
          {currentIndex + 1} / {flashcards.length}
        </div>
      )}

      {/* Render Modal (không hiển thị nếu isAddModalOpen là false) */}
      <AddFlashcardsModal
        isOpen={isAddModalOpen}
        onClose={closeAddModal}
        onSubmitSuccess={handleAddSuccess}
        moduleId={moduleId}
      />

      {/* Xóa phần add-flashcard-section cũ */}
    </div>
  );
};

export default FlashcardList;
