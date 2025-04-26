const express = require("express");
const router = express.Router();
const moduleController = require("../controllers/moduleController");

router.get("/", moduleController.getAllModules); // Lấy tất cả các module
router.post("/", moduleController.createModule); // Tạo module mới
router.get("/:id", moduleController.getFlashcardsByModuleId); // Lấy tất cả các flashcard của module theo ID
router.put("/:id", moduleController.updateModule); // Cập nhật module theo ID
router.delete("/:id", moduleController.deleteModule); // Xóa module theo ID
/*
router.get('/:id', moduleController.getModuleById); // Lấy module theo ID
*/

module.exports = router;
