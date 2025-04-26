import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useParams } from "react-router-dom"; // Import useParams to get moduleId from URL
import FlashcardElement from "../components/FlashcardElement";

const FlashcardList = () => {
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(true);
  const { moduleId } = useParams(); // Get moduleId from URL
  const [newTerm, setNewTerm] = useState(""); // State for new term input
  const [newDefinition, setNewDefinition] = useState(""); // State for new definition input

  const [currentIndex, setCurrentIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState("none");

  const handleAddFlashcard = async () => {
    if (!newTerm.trim() || !newDefinition.trim()) {
      alert("Please enter both term and definition."); // Check if inputs are empty
      return;
    }

    try {
      const response = await axios.post("/api/flashcards", {
        moduleId: moduleId, // Use the moduleId from URL
        term: newTerm,
        definition: newDefinition,
      });
      setFlashcards([...flashcards, response.data]);
      setNewTerm("");
      setNewDefinition("");
      setSlideDirection("none"); // Không cần hiệu ứng khi thêm
    } catch (error) {
      console.error("Error adding flashcard:", error.message);
    }
  };

  const fetchFlashcards = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/modules/${moduleId}`);
      setFlashcards(response.data || []);
      setCurrentIndex(0);
      setSlideDirection("none");
    } catch (error) {
      console.error("Error fetching flashcards:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlashcards();
  }, [moduleId]);

  const goToNextCard = useCallback(() => {
    if (flashcards.length === 0) return;
    setSlideDirection("right");
    setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % flashcards.length);
    }, 50); // dùng timeout nhỏ để CSS có thời gian áp dụng class hướng trước khi đổi index
  }, [flashcards.length]);

  const goToPreviousCard = useCallback(() => {
    if (flashcards.length === 0) return;
    setSlideDirection("left");
    setTimeout(() => {
      setCurrentIndex(
        (prevIndex) => (prevIndex - 1 + flashcards.length) % flashcards.length
      );
    }, 50); // dùng timeout nhỏ để CSS có thời gian áp dụng class hướng trước khi đổi index
  }, [flashcards.length]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (flashcards.length === 0) return;
      if (e.key === "ArrowRight") goToNextCard();
      if (e.key === "ArrowLeft") goToPreviousCard();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [flashcards.length, goToNextCard, goToPreviousCard]);

  if (loading) return <div>Loading...</div>;

  const currentCard = flashcards.length > 0 ? flashcards[currentIndex] : null;

  let cardContainerClass = "flashcard-display-area";
  if (slideDirection === "left") cardContainerClass += " slide-enter-left";
  if (slideDirection === "right") cardContainerClass += " slide-enter-right";

  return (
    <div className="flashcard-page-container">
      {" "}
      {/* Container chính cho trang */}
      <h1>Flashcard Deck</h1>
      {/* Khu vực hiển thị thẻ */}
      <div className="flashcard-viewer">
        {flashcards.length > 0 ? (
          <>
            {/* Nút điều hướng trái */}
            <button
              className="nav-btn left-btn"
              onClick={goToPreviousCard}
              aria-label="Previous card"
              disabled={flashcards.length <= 1} // Vô hiệu hóa nếu chỉ có 1 thẻ
            >
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

            {/* Container chứa thẻ hiện tại (cho hiệu ứng) */}
            {/* Sử dụng key để React biết thẻ đã thay đổi hoàn toàn, giúp reset state lật */}
            <div
              className={cardContainerClass}
              key={currentCard?._id || currentIndex}
            >
              {currentCard && <FlashcardElement data={currentCard} />}
            </div>

            {/* Nút điều hướng phải */}
            <button
              className="nav-btn right-btn"
              onClick={goToNextCard}
              aria-label="Next card"
              disabled={flashcards.length <= 1} // Vô hiệu hóa nếu chỉ có 1 thẻ
            >
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
          // Hiển thị khi không có thẻ nào
          <div className="no-flashcards-message">
            No flashcards available in this module. Add one below!
          </div>
        )}
      </div>
      {/* Hiển thị số thứ tự thẻ */}
      {flashcards.length > 0 && (
        <div className="flashcard-counter">
          Card {currentIndex + 1} of {flashcards.length}
        </div>
      )}
      {/* Phần thêm thẻ mới (giữ nguyên) */}
      <div className="add-flashcard-section">
        <h2>Add New Flashcard</h2>
        <div>
          <label htmlFor="termInput">Term: </label>
          <input
            id="termInput"
            type="text"
            value={newTerm}
            onChange={(e) => setNewTerm(e.target.value)}
            placeholder="Enter term"
          />
        </div>
        <div>
          <label htmlFor="definitionInput">Definition: </label>
          <input
            id="definitionInput"
            type="text"
            value={newDefinition}
            onChange={(e) => setNewDefinition(e.target.value)}
            placeholder="Enter definition"
          />
        </div>
        <button onClick={handleAddFlashcard}>Add Flashcard</button>
      </div>
    </div>
  );
};

export default FlashcardList;
