const express = require("express");
const router = express.Router();
const flashcardController = require("../controllers/flashcardController");
const Flashcard = require("../models/Flashcard"); // Đảm bảo đã import

router.post("/", flashcardController.createFlashcard); // Tạo flashcard mới

// POST /api/flashcards/bulk - Add multiple flashcards
router.post("/bulk", async (req, res) => {
  const { moduleId, cards } = req.body;

  // Validate input
  if (!moduleId || !Array.isArray(cards) || cards.length === 0) {
    return res.status(400).json({
      message: "Module ID and a non-empty array of cards are required.",
    });
  }

  try {
    // (Thêm kiểm tra định dạng moduleId nếu cần)

    const flashcardsToCreate = cards
      .filter(
        (card) =>
          card &&
          (typeof card.term === "string" ||
            typeof card.definition === "string") &&
          (card.term.trim() || card.definition.trim())
      )
      .map((card) => ({
        term: card.term.trim(),
        definition: card.definition.trim(),
        // *** SỬA Ở ĐÂY: Đổi 'module' thành 'moduleId' ***
        moduleId: moduleId, // Liên kết với module, đảm bảo tên trường khớp với schema
        // user: req.user?._id, // Nếu cần
      }));

    if (flashcardsToCreate.length === 0) {
      return res.status(400).json({ message: "No valid card data provided." });
    }

    // Sử dụng Model.insertMany()
    const createdFlashcards = await Flashcard.insertMany(flashcardsToCreate);

    res.status(201).json(createdFlashcards);
  } catch (error) {
    console.error("Error bulk adding flashcards:", error);
    // Kiểm tra xem có phải lỗi validation không
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Validation failed while adding flashcards.",
        // Gửi chi tiết lỗi validation (tùy chọn, cẩn thận thông tin nhạy cảm)
        errors: error.errors,
      });
    }
    // Lỗi server khác
    res.status(500).json({
      message: "Server error while adding flashcards",
      error: error.message,
    });
  }
});

module.exports = router;
