import React, { useState } from "react";

function FlashcardElement({ data }) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleClick = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div
      className={`flashcard-element ${isFlipped ? "is-flipped" : ""}`}
      onClick={handleClick}
      role="button"
      tabIndex={0} // Cho phép focus bằng bàn phím
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") handleClick();
      }} // Cho phép lật bằng Enter/Space
    >
      <div className="flashcard-face flashcard-front">{data.term}</div>
      <div className="flashcard-face flashcard-back">{data.definition}</div>
    </div>
  );
}

export default FlashcardElement;
