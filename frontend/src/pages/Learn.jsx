import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../api/axiosInstance"; // Đảm bảo bạn đã cấu hình axiosInstance

// Hàm helper để xáo trộn mảng (có thể đặt trong file utils)
const shuffleArray = (array) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const Learn = () => {
  const { moduleId, moduleName } = useParams(); // Lấy moduleId và moduleName từ URL
  const [allFlashcards, setAllFlashcards] = useState([]);
  const [questionQueue, setQuestionQueue] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // State cho câu trả lời của người dùng
  const [userAnswer, setUserAnswer] = useState(""); // Cho dạng điền từ
  const [selectedOption, setSelectedOption] = useState(null); // Cho dạng trắc nghiệm

  // State cho phản hồi và trạng thái câu trả lời
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);

  // State theo dõi tiến độ trong phiên học
  const [stats, setStats] = useState({
    correctAnswers: 0,
    totalAnswered: 0,
    knownCards: new Set(), // Lưu ID các thẻ người dùng đánh dấu là "đã biết"
    unknownCards: new Set(), // Lưu ID các thẻ người dùng đánh dấu là "chưa biết"
  });

  // 1. Fetch flashcards cho module
  useEffect(() => {
    const fetchModuleData = async () => {
      if (!moduleId) return;
      setIsLoading(true);
      setError(null);
      try {
        // Giả định endpoint /api/modules/:moduleId trả về module object với array flashcards
        // Ví dụ: response.data.flashcards
        // Nếu bạn dùng endpoint /api/flashcards/module/:moduleId, thì response.data sẽ là array flashcards
        const response = await axiosInstance.get(`/api/modules/${moduleId}`);

        // Cố gắng lấy flashcards từ response.data.flashcards hoặc response.data
        const fetchedFlashcards =
          response.data?.flashcards || response.data || [];

        if (!Array.isArray(fetchedFlashcards)) {
          console.error("Fetched data is not an array:", fetchedFlashcards);
          setError("Dữ liệu flashcards không hợp lệ.");
          setAllFlashcards([]);
        } else if (fetchedFlashcards.length === 0) {
          setError("Không tìm thấy flashcard nào trong học phần này.");
          setAllFlashcards([]);
        } else {
          setAllFlashcards(fetchedFlashcards);
        }
      } catch (err) {
        console.error("Lỗi khi tải flashcards cho việc học:", err);
        setError(err.response?.data?.message || "Không thể tải flashcards.");
        setAllFlashcards([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchModuleData();
  }, [moduleId]);

  // 2. Tạo hàng đợi câu hỏi khi flashcards được tải
  const generateQuestionQueue = useCallback((cards) => {
    if (!cards || cards.length === 0) {
      setQuestionQueue([]);
      return;
    }
    const newQueue = [];
    const numCards = cards.length;

    cards.forEach((card) => {
      const randType = Math.random();
      // Ưu tiên không dùng trắc nghiệm nếu có ít hơn 4 thẻ (khó tạo câu hỏi tốt)
      if (numCards < 4) {
        if (randType < 0.5) {
          newQueue.push(createLearnFlashcardQuestion(card));
        } else {
          newQueue.push(createWordFillingQuestion(card));
        }
      } else if (randType < 0.33) {
        // Trắc nghiệm
        newQueue.push(createMultipleChoiceQuestion(card, cards));
      } else if (randType < 0.66) {
        // Điền từ
        newQueue.push(createWordFillingQuestion(card));
      } else {
        // Học Flashcard
        newQueue.push(createLearnFlashcardQuestion(card));
      }
    });

    setQuestionQueue(shuffleArray(newQueue));
    setCurrentQuestionIndex(0);
    setShowFeedback(false);
    setIsCorrect(null);
    setUserAnswer("");
    setSelectedOption(null);
  }, []); // Dependencies sẽ được thêm nếu các hàm createQuestion thay đổi

  useEffect(() => {
    if (allFlashcards.length > 0) {
      generateQuestionQueue(allFlashcards);
    } else {
      setQuestionQueue([]);
    }
  }, [allFlashcards, generateQuestionQueue]);

  // --- Hàm tạo các loại câu hỏi ---
  const createMultipleChoiceQuestion = (correctCard, allCards) => {
    const isTermAsQuestion = Math.random() < 0.5;
    const questionText = isTermAsQuestion
      ? correctCard.term
      : correctCard.definition;
    const correctAnswer = isTermAsQuestion
      ? correctCard.definition
      : correctCard.term;

    let options = [correctAnswer];
    const distractors = allCards
      .filter((card) => card._id !== correctCard._id) // Lọc ra các thẻ khác
      .map((card) => (isTermAsQuestion ? card.definition : card.term)); // Lấy phần tương ứng làm phương án nhiễu

    const shuffledDistractors = shuffleArray(distractors);

    for (let i = 0; i < Math.min(3, shuffledDistractors.length); i++) {
      // Lấy tối đa 3 phương án nhiễu
      if (options.length < 4 && !options.includes(shuffledDistractors[i])) {
        options.push(shuffledDistractors[i]);
      }
    }
    // Đảm bảo có đủ lựa chọn nếu có thể, tránh lặp lại nếu không cần thiết
    while (
      options.length < Math.min(4, allCards.length) &&
      allCards.length > options.length
    ) {
      const randomCard = allCards[Math.floor(Math.random() * allCards.length)];
      const potentialDistractor = isTermAsQuestion
        ? randomCard.definition
        : randomCard.term;
      if (!options.includes(potentialDistractor)) {
        options.push(potentialDistractor);
      }
    }

    return {
      type: "multiple-choice",
      cardId: correctCard._id,
      questionText,
      options: shuffleArray(options),
      correctAnswer,
    };
  };

  const createWordFillingQuestion = (card) => {
    const isTermAsQuestion = Math.random() < 0.5; // Ngẫu nhiên hỏi thuật ngữ hay định nghĩa
    const questionPrompt = isTermAsQuestion
      ? `Định nghĩa cho thuật ngữ "${card.term}" là gì?`
      : `Thuật ngữ cho định nghĩa "${card.definition}" là gì?`;
    const correctAnswer = isTermAsQuestion ? card.definition : card.term;
    return {
      type: "word-filling",
      cardId: card._id,
      questionPrompt, // Nội dung câu hỏi hiển thị cho người dùng
      correctAnswer,
    };
  };

  const createLearnFlashcardQuestion = (card) => {
    return {
      type: "learn-flashcard",
      cardId: card._id,
      term: card.term,
      definition: card.definition,
    };
  };

  // Lấy câu hỏi hiện tại từ queue
  const currentQuestion = useMemo(() => {
    if (
      questionQueue.length > 0 &&
      currentQuestionIndex < questionQueue.length
    ) {
      return questionQueue[currentQuestionIndex];
    }
    return null;
  }, [questionQueue, currentQuestionIndex]);

  // --- Xử lý trả lời ---
  const handleMultipleChoiceSubmit = (option) => {
    if (showFeedback) return;
    const correct = option === currentQuestion.correctAnswer;
    setIsCorrect(correct);
    setShowFeedback(true);
    setSelectedOption(option);
    setStats((prev) => ({
      ...prev,
      correctAnswers: correct ? prev.correctAnswers + 1 : prev.correctAnswers,
      totalAnswered: prev.totalAnswered + 1,
      ...(correct
        ? { knownCards: new Set(prev.knownCards).add(currentQuestion.cardId) }
        : {
            unknownCards: new Set(prev.unknownCards).add(
              currentQuestion.cardId
            ),
          }),
    }));
  };

  const handleWordFillingSubmit = (e) => {
    e.preventDefault();
    if (showFeedback) return;
    const correct =
      userAnswer.trim().toLowerCase() ===
      currentQuestion.correctAnswer.trim().toLowerCase();
    setIsCorrect(correct);
    setShowFeedback(true);
    setStats((prev) => ({
      ...prev,
      correctAnswers: correct ? prev.correctAnswers + 1 : prev.correctAnswers,
      totalAnswered: prev.totalAnswered + 1,
      ...(correct
        ? { knownCards: new Set(prev.knownCards).add(currentQuestion.cardId) }
        : {
            unknownCards: new Set(prev.unknownCards).add(
              currentQuestion.cardId
            ),
          }),
    }));
  };

  const handleLearnFlashcardResponse = (knewIt) => {
    // Với 'learn-flashcard', không có 'đúng/sai' mà là tự đánh giá
    // setShowFeedback(true); // Đã show rồi khi lật thẻ
    setIsCorrect(knewIt); // Dùng isCorrect để lưu trạng thái "đã biết"
    setStats((prev) => ({
      ...prev,
      // totalAnswered có thể không tăng ở đây, hoặc tăng nếu coi đây là một lần "trả lời"
      ...(knewIt
        ? { knownCards: new Set(prev.knownCards).add(currentQuestion.cardId) }
        : {
            unknownCards: new Set(prev.unknownCards).add(
              currentQuestion.cardId
            ),
          }),
    }));
    goToNextQuestion(); // Tự động chuyển câu sau khi chọn "Biết" / "Không biết"
  };

  // --- Điều hướng ---
  const goToNextQuestion = () => {
    if (currentQuestionIndex < questionQueue.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setShowFeedback(false);
      setIsCorrect(null);
      setUserAnswer("");
      setSelectedOption(null);
    } else {
      alert(
        `Kết thúc phiên học!\nĐúng: ${stats.correctAnswers}/${stats.totalAnswered}\nThẻ đã biết: ${stats.knownCards.size}\nThẻ chưa biết: ${stats.unknownCards.size}`
      );
      // Tùy chọn: Tạo lại queue, quay về trang trước, ...
      generateQuestionQueue(allFlashcards); // Bắt đầu lại với thứ tự mới
    }
  };

  // --- Render ---
  if (isLoading)
    return <div className="learn-loading">Đang tải bài học...</div>;
  if (error)
    return (
      <div className="learn-error">
        Lỗi: {error}{" "}
        <button onClick={() => generateQuestionQueue(allFlashcards)}>
          Thử lại
        </button>
      </div>
    );
  if (!currentQuestion && !isLoading)
    return (
      <div className="learn-no-questions">
        Không có câu hỏi nào được tạo. Học phần này có thể chưa có thẻ học.
      </div>
    );
  if (!currentQuestion) return null; // Trường hợp này ít xảy ra nếu các check trên đã xử lý

  return (
    <div className="learn-page-container">
      <div className="learn-header">
        <h2>Học bài: {moduleName || "Học phần"}</h2>
        <div className="learn-progress">
          <span>
            Câu hỏi: {Math.min(currentQuestionIndex + 1, questionQueue.length)}{" "}
            / {questionQueue.length}
          </span>
          <span>
            Đúng: {stats.correctAnswers} / {stats.totalAnswered}
          </span>
        </div>
      </div>

      <div className="learn-content">
        {/* Dạng trắc nghiệm */}
        {currentQuestion.type === "multiple-choice" && (
          <div className="multiple-choice-area question-block">
            <h4>{currentQuestion.questionText}</h4>
            <div className="options-container">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  className={`option-btn 
                              ${
                                showFeedback &&
                                option === currentQuestion.correctAnswer
                                  ? "correct"
                                  : ""
                              }
                              ${
                                showFeedback &&
                                selectedOption === option &&
                                option !== currentQuestion.correctAnswer
                                  ? "incorrect"
                                  : ""
                              }
                              ${
                                selectedOption === option && !showFeedback
                                  ? "selected"
                                  : ""
                              }`}
                  onClick={() =>
                    !showFeedback && handleMultipleChoiceSubmit(option)
                  }
                  disabled={showFeedback}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Dạng điền từ */}
        {currentQuestion.type === "word-filling" && (
          <div className="word-filling-area question-block">
            <h4>{currentQuestion.questionPrompt}</h4>
            <form onSubmit={handleWordFillingSubmit}>
              <input
                type="text"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Nhập câu trả lời của bạn"
                disabled={showFeedback}
                className="word-filling-input"
              />
              {!showFeedback && (
                <button type="submit" className="submit-btn">
                  Kiểm tra
                </button>
              )}
            </form>
          </div>
        )}

        {/* Dạng học flashcard */}
        {currentQuestion.type === "learn-flashcard" && (
          <div className="learn-flashcard-area question-block">
            <div
              className={`flashcard-learn-view ${
                showFeedback ? "is-flipped" : ""
              }`}
              onClick={() => !showFeedback && setShowFeedback(true)}
            >
              <div className="flashcard-face flashcard-front-learn">
                <p>{currentQuestion.term}</p>
              </div>
              <div className="flashcard-face flashcard-back-learn">
                <p>{currentQuestion.definition}</p>
              </div>
            </div>
            {!showFeedback && (
              <button
                onClick={() => setShowFeedback(true)}
                className="reveal-btn"
              >
                Hiện đáp án
              </button>
            )}
          </div>
        )}

        {/* Phản hồi chung và nút "Tiếp theo" */}
        {showFeedback && (
          <div className="feedback-section">
            {currentQuestion.type !== "learn-flashcard" && (
              <p
                className={
                  isCorrect ? "feedback-correct" : "feedback-incorrect"
                }
              >
                {isCorrect
                  ? "Chính xác!"
                  : `Sai rồi! Đáp án đúng là: ${currentQuestion.correctAnswer}`}
              </p>
            )}
            {currentQuestion.type === "learn-flashcard" && (
              <div className="known-unknown-buttons">
                <button
                  onClick={() => handleLearnFlashcardResponse(false)}
                  className="btn-unknown"
                >
                  Chưa biết
                </button>
                <button
                  onClick={() => handleLearnFlashcardResponse(true)}
                  className="btn-known"
                >
                  Đã biết
                </button>
              </div>
            )}
            {currentQuestion.type !== "learn-flashcard" && (
              <button onClick={goToNextQuestion} className="next-question-btn">
                Câu tiếp theo
              </button>
            )}
          </div>
        )}
      </div>
      {/* CSS cơ bản - nên đưa vào file CSS riêng */}
      <style jsx global>{`
        .learn-page-container {
          max-width: 800px;
          margin: 20px auto;
          padding: 20px;
          font-family: sans-serif;
        }
        .learn-header {
          text-align: center;
          margin-bottom: 30px;
        }
        .learn-progress {
          display: flex;
          justify-content: space-around;
          margin-top: 10px;
          color: #555;
        }
        .question-block {
          background-color: #f9f9f9;
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 20px;
        }
        .question-block h4 {
          margin-top: 0;
        }
        .options-container {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 10px;
          margin-top: 15px;
        }
        .option-btn {
          padding: 12px 15px;
          border: 1px solid #ccc;
          border-radius: 5px;
          cursor: pointer;
          background-color: white;
          text-align: left;
          transition: background-color 0.2s;
        }
        .option-btn:hover:not(:disabled) {
          background-color: #f0f0f0;
        }
        .option-btn.selected:not(.correct):not(.incorrect) {
          background-color: #e0e0e0;
        }
        .option-btn.correct {
          background-color: #d4edda !important;
          color: #155724;
          border-color: #c3e6cb !important;
        }
        .option-btn.incorrect {
          background-color: #f8d7da !important;
          color: #721c24;
          border-color: #f5c6cb !important;
        }
        .option-btn:disabled {
          cursor: not-allowed;
          opacity: 0.7;
        }
        .word-filling-input {
          padding: 10px;
          border: 1px solid #ccc;
          border-radius: 5px;
          width: calc(100% - 110px);
          margin-right: 10px;
        }
        .submit-btn,
        .reveal-btn,
        .next-question-btn,
        .known-unknown-buttons button {
          padding: 10px 20px;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          background-color: #007bff;
          color: white;
        }
        .known-unknown-buttons {
          display: flex;
          gap: 10px;
          justify-content: center;
          margin-top: 15px;
        }
        .btn-unknown {
          background-color: #ffc107;
          color: black;
        }
        .btn-known {
          background-color: #28a745;
        }
        .feedback-section {
          margin-top: 20px;
          text-align: center;
        }
        .feedback-correct {
          color: green;
          font-weight: bold;
        }
        .feedback-incorrect {
          color: red;
          font-weight: bold;
        }
        .flashcard-learn-view {
          perspective: 1000px;
          width: 90%;
          max-width: 400px;
          height: 250px;
          position: relative;
          margin: 20px auto;
          cursor: pointer;
        }
        .flashcard-face {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          display: flex;
          justify-content: center;
          align-items: center;
          border: 1px solid #ccc;
          border-radius: 8px;
          padding: 15px;
          box-sizing: border-box;
          font-size: 1.3em;
          transition: transform 0.6s;
          transform-style: preserve-3d;
        }
        .flashcard-front-learn {
          background-color: #e9f5fe;
        }
        .flashcard-back-learn {
          background-color: #fff0e9;
          transform: rotateY(180deg);
        }
        .flashcard-learn-view.is-flipped .flashcard-front-learn {
          transform: rotateY(180deg);
        }
        .flashcard-learn-view.is-flipped .flashcard-back-learn {
          transform: rotateY(0deg);
        }
        .learn-loading,
        .learn-error,
        .learn-no-questions {
          text-align: center;
          padding: 30px;
          font-size: 1.2em;
        }
      `}</style>
    </div>
  );
};
export default Learn;
