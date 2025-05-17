import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import FlashcardElement from "../components/FlashcardElement";
import AddFlashcardsModal from "../components/AddFlashcardsModal"; // Import modal mới
import axiosInstance from "../api/axiosInstance";
import { SettingIcon } from "./Modules";
import { Link } from "react-router-dom";

const FlashcardList = () => {
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [className, setClassName] = useState("");
  const [showSettingMenu, setShowSettingMenu] = useState(false);
  const { moduleId, moduleName, classId } = useParams();
  const settingIconRef = useRef();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState("none");

  // State mới để quản lý modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // State for editing a flashcard
  const [cardToEditId, setCardToEditId] = useState(null);
  const [editedTerm, setEditedTerm] = useState("");
  const [editedDefinition, setEditedDefinition] = useState("");

  const handleSettingIconClick = (e) => {
    e.stopPropagation(); // Ngăn chặn sự kiện click lan truyền
    setShowSettingMenu((prev) => !prev);
  };

  // --- Fetch Flashcards ---
  const fetchFlashcards = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/api/modules/${moduleId}`);
      setFlashcards(response.data || []);
      setCurrentIndex(0);
      setSlideDirection("none");
      const classResponse = await axiosInstance.get(
        `api/classes/getClass/${classId}`
      );
      setClassName(classResponse.data.name); // Lưu tên lớp học
    } catch (error) {
      console.error("Error fetching flashcards:", error);
      setFlashcards([]); // Set rỗng nếu lỗi
    } finally {
      setLoading(false);
    }
  }, [moduleId, classId]); // classId is used for fetching className

  useEffect(() => {
    if (moduleId) {
      fetchFlashcards();
    }
  }, [fetchFlashcards, moduleId]); // fetchFlashcards will change if moduleId changes

  // --- Xóa hàm handleAddFlashcard cũ ---

  // --- Hàm mở modal ---
  const openAddModal = () => {
    setIsAddModalOpen(true);
  };

  // --- Hàm đóng modal ---
  const closeAddModal = () => {
    setIsAddModalOpen(false);
  };

  const handleAddSuccess = (newlyAddedCards) => {
    if (Array.isArray(newlyAddedCards)) {
      const updatedFlashcards = [...flashcards, ...newlyAddedCards];
      setFlashcards(updatedFlashcards);
      if (newlyAddedCards.length > 0) {
        setCurrentIndex(flashcards.length);
        setSlideDirection("none");
      }
    } else {
      console.warn(
        "handleAddSuccess received non-array data:",
        newlyAddedCards
      );
      fetchFlashcards();
    }
    closeAddModal();
  };

  // --- Edit Flashcard Modal Logic ---
  useEffect(() => {
    if (isEditModalOpen && currentCard) {
      setCardToEditId(currentCard._id);
      setEditedTerm(currentCard.term);
      setEditedDefinition(currentCard.definition);
    } else if (!isEditModalOpen) {
      setCardToEditId(null);
      setEditedTerm("");
      setEditedDefinition("");
    }
  }, [isEditModalOpen]);

  const handleSaveEdit = async () => {
    if (!cardToEditId) return;
    try {
      await axiosInstance.put(`/api/flashcards/${cardToEditId}`, {
        term: editedTerm,
        definition: editedDefinition,
      });
      setFlashcards((prevFlashcards) =>
        prevFlashcards.map((fc) =>
          fc._id === cardToEditId
            ? { ...fc, term: editedTerm, definition: editedDefinition }
            : fc
        )
      );
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Error updating flashcard:", error);
      alert("Failed to update flashcard.");
    }
  };

  const handleCloseEditModal = () => setIsEditModalOpen(false);

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
      if (
        isEditModalOpen &&
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
  }, [
    flashcards.length,
    goToNextCard,
    goToPreviousCard,
    isAddModalOpen,
    isEditModalOpen,
  ]);

  // --- Render Logic ---
  if (loading) return <div>Loading...</div>;

  const currentCard = flashcards.length > 0 ? flashcards[currentIndex] : null;

  // Class động cho animation (cần reset direction sau khi animation chạy)
  let cardContainerClass = "flashcard-display-area";
  if (slideDirection === "left") cardContainerClass += " slide-enter-left";
  if (slideDirection === "right") cardContainerClass += " slide-enter-right";

  return (
    <div className="container">
      <div className="class-name">{className}</div>
      <div className="flashcard-header">
        <div className="nav1-header">{moduleName}</div>
        <div className="setting-section" onClick={handleSettingIconClick}>
          <div className="setting-icon" ref={settingIconRef}>
            <SettingIcon />
            {showSettingMenu && (
              <div className="setting-menu-modal">
                <button>Sửa tên học phần</button>
                <button>Xuất</button>
                <button>Xóa</button>
              </div>
            )}
            {!showSettingMenu && <span className="more-text">Xem thêm</span>}
          </div>
        </div>
      </div>

      <div className="flashcard-actions">
        <div className="action-card">Thẻ ghi nhớ</div>
        <div className="action-card">
          <Link
            to={`/learn/${moduleId}/${encodeURIComponent(
              moduleName
            )}/${classId}`}
          >
            {" "}
            Học
          </Link>
        </div>
        <div className="action-card">Kiểm tra</div>
        <div className="action-card">Trò chơi</div>
      </div>
      {/* 
      <button onClick={openAddModal} className="btn-open-add-modal">
        + Add New Cards
      </button> */}

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
              {currentCard && (
                <FlashcardElement
                  data={currentCard}
                  openEditModal={setIsEditModalOpen}
                />
              )}
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

      {isEditModalOpen && currentCard && (
        <div className="modal edit-flashcard-modal">
          <div className="modal-content">
            <div className="edit-modal-header">
              Sửa Flashcard
              <button
                onClick={handleCloseEditModal}
                className="modal-close-btn"
              >
                &times;
              </button>
            </div>
            <div className="edit-modal-content">
              <div>
                <label htmlFor="editedTermInput">Thuật ngữ:</label>
                <input
                  id="editedTermInput"
                  className="term"
                  value={editedTerm}
                  onChange={(e) => setEditedTerm(e.target.value)}
                  placeholder="Nhập thuật ngữ"
                />
              </div>
              <div>
                <label htmlFor="editedDefinitionInput">Định nghĩa:</label>
                <textarea
                  id="editedDefinitionInput"
                  className="definition"
                  value={editedDefinition}
                  onChange={(e) => setEditedDefinition(e.target.value)}
                  placeholder="Nhập định nghĩa"
                  rows={4}
                />
              </div>
            </div>
            <div className="edit-modal-footer">
              <button onClick={handleSaveEdit} className="btn-save">
                Lưu
              </button>
              <button onClick={handleCloseEditModal} className="btn-cancel">
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlashcardList;
