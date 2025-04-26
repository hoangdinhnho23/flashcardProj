const express = require('express');
const router = express.Router();
const flashcardController = require('../controllers/flashcardController');

router.post('/', flashcardController.createFlashcard); // Tạo flashcard mới

module.exports = router;