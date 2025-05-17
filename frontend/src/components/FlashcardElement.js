import React, { useState, useEffect, useCallback } from "react";
import { EditIcon } from "./ListElement";

const SpeakerIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth="1.5" // Changed to camelCase
    stroke="currentColor"
    className="svg-icon"
  >
    <path
      strokeLinecap="round" // Changed to camelCase
      strokeLinejoin="round" // Changed to camelCase
      d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z"
    />
  </svg>
);

function FlashcardElement({ data, openEditModal }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [availableVoices, setAvailableVoices] = useState([]);

  // Load voices when component mounts and when voices change
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setAvailableVoices(voices);
    };

    // Initial load
    loadVoices();

    // Subscribe to voiceschanged event
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);

    // Cleanup: remove event listener when component unmounts
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
    };
  }, []);

  const handleClick = () => {
    setIsFlipped(!isFlipped);
  };

  const handleEditFlashcard = (e) => {
    e.stopPropagation(); // Ngăn chặn sự kiện click lan truyền
    openEditModal(true); // Giả sử openEditModal được dùng để mở modal
    console.log("Edit flashcard:", data);
  };

  const handleSpeakerClick = useCallback(
    (e) => {
      e.stopPropagation(); // Ngăn chặn sự kiện click lan truyền

      if (!("speechSynthesis" in window)) {
        console.error("Trình duyệt của bạn không hỗ trợ API phát âm thanh.");
        alert(
          "Xin lỗi, trình duyệt của bạn không hỗ trợ tính năng phát âm này."
        );
        return;
      }

      const isSpeakingDefinition = isFlipped;
      const textToSpeak = isSpeakingDefinition ? data.definition : data.term;
      if (!textToSpeak) {
        console.warn("Không có nội dung để phát âm cho mặt thẻ này.");
        return;
      }

      // Dừng bất kỳ âm thanh nào đang phát
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(textToSpeak);

      // Logic lựa chọn giọng nói
      let preferredVoice = null;
      if (availableVoices.length > 0) {
        if (isSpeakingDefinition) {
          // Đang đọc DEFINITION, ưu tiên tiếng Việt
          // 1. Ưu tiên giọng tiếng Việt (vi-VN)
          preferredVoice = availableVoices.find(
            (voice) => voice.lang === "vi-VN"
          );

          // 1.1. Nếu không thấy, thử tìm giọng tiếng Việt với lang code bắt đầu bằng 'vi'
          if (!preferredVoice) {
            preferredVoice = availableVoices.find(
              (voice) => voice.lang && voice.lang.toLowerCase().startsWith("vi")
            );
          }

          // 1.2. Nếu vẫn không thấy, thử tìm giọng tiếng Việt qua tên
          if (!preferredVoice) {
            console.log("Không tìm thấy giọng tiếng Việt với lang code.");
            preferredVoice = availableVoices.find(
              (voice) =>
                voice.name &&
                (voice.name.toLowerCase().includes("vietnamese") ||
                  voice.name.toLowerCase().includes("tiếng việt"))
            );
          }

          // 2. Nếu không có tiếng Việt (sau các bước trên), thử giọng tiếng Anh (US) chất lượng cao
          if (!preferredVoice) {
            preferredVoice = availableVoices.find(
              (voice) =>
                voice.lang === "en-US" &&
                voice.name.toLowerCase().includes("google")
            );
          }
          // 3. Nếu không có, thử giọng tiếng Anh (US) mặc định
          if (!preferredVoice) {
            preferredVoice = availableVoices.find(
              (voice) => voice.lang === "en-US" && voice.default
            );
          }
          // 4. Nếu không có, thử bất kỳ giọng tiếng Anh nào
          if (!preferredVoice) {
            preferredVoice = availableVoices.find((voice) =>
              voice.lang.startsWith("en-")
            );
          }
        } else {
          // Đang đọc TERM, ưu tiên tiếng Anh
          // 1. Ưu tiên giọng tiếng Anh (US) chất lượng cao (ví dụ: Google)
          preferredVoice = availableVoices.find(
            (voice) =>
              voice.lang === "en-US" &&
              voice.name.toLowerCase().includes("google")
          );

          // 2. Nếu không có, thử giọng tiếng Anh (US) mặc định
          if (!preferredVoice) {
            preferredVoice = availableVoices.find(
              (voice) => voice.lang === "en-US" && voice.default
            );
          }
          // 3. Nếu không có, thử bất kỳ giọng tiếng Anh nào
          if (!preferredVoice) {
            preferredVoice = availableVoices.find((voice) =>
              voice.lang.startsWith("en-")
            );
          }
        }
      }

      if (preferredVoice) {
        utterance.voice = preferredVoice;
        utterance.lang = preferredVoice.lang; // Đảm bảo ngôn ngữ của utterance khớp với giọng nói được chọn
      } else {
        const allSystemVoices = window.speechSynthesis.getVoices(); // Kiểm tra lại toàn bộ giọng hệ thống
        if (isSpeakingDefinition) {
          // Cố gắng đặt lang là 'vi-VN' nếu có bất kỳ giọng nào hỗ trợ tiếng Việt (dựa trên các tiêu chí mở rộng)
          const hasVietnameseVoice = allSystemVoices.some(
            (v) =>
              v.lang === "vi-VN" ||
              (v.lang && v.lang.toLowerCase().startsWith("vi")) ||
              (v.name &&
                (v.name.toLowerCase().includes("vietnamese") ||
                  v.name.toLowerCase().includes("tiếng việt")))
          );
          if (hasVietnameseVoice) {
            utterance.lang = "vi-VN"; // Vẫn ưu tiên 'vi-VN' chuẩn cho utterance nếu tìm thấy
          } else if (allSystemVoices.some((v) => v.lang.startsWith("en-"))) {
            utterance.lang = "en-US"; // Dự phòng tiếng Anh cho definition nếu không có tiếng Việt
          }
        } else {
          // Đang đọc TERM
          if (allSystemVoices.some((v) => v.lang.startsWith("en-"))) {
            utterance.lang = "en-US";
          }
          // Không đặt utterance.lang mặc định cho term nếu không có giọng Anh,
          // để trình duyệt tự quyết định hoặc sử dụng giọng mặc định của nó.
        }
      }
      // Bạn có thể tùy chỉnh thêm tốc độ, cao độ ở đây nếu muốn
      // utterance.rate = 1; // Mặc định là 1. Khoảng từ 0.1 đến 10.
      // utterance.pitch = 1; // Mặc định là 1. Khoảng từ 0 đến 2.

      window.speechSynthesis.speak(utterance);
    },
    [isFlipped, data.term, data.definition, availableVoices]
  ); // Các dependencies cho useCallback

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
      <div className="flashcard-face flashcard-front">
        <div className="tool-box">
          <div className="tool-icon" onClick={handleEditFlashcard}>
            <EditIcon />
          </div>
          <div className="tool-icon" onClick={handleSpeakerClick}>
            <SpeakerIcon />
          </div>
        </div>
        <div className="flashcard-content">{data.term}</div>
      </div>
      <div className="flashcard-face flashcard-back">
        <div className="tool-box">
          <div className="tool-icon" onClick={handleEditFlashcard}>
            <EditIcon />
          </div>
          <div className="tool-icon" onClick={handleSpeakerClick}>
            <SpeakerIcon />
          </div>
        </div>
        <div className="flashcard-content">{data.definition}</div>
      </div>
    </div>
  );
}

export default FlashcardElement;
