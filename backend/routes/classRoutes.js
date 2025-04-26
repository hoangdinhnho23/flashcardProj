const express = require("express");
const router = express.Router();
const classController = require("../controllers/classController");

router.get("/", classController.getAllClasses); // Lấy tất cả các lớp học
router.post("/", classController.createClass);
router.get("/:id/modules", classController.getModulesAndTerm); // Lấy tất cả các module của lớp học theo ID
router.put("/:id", classController.updateClass); // Cập nhật lớp học theo ID
router.delete("/:id", classController.deleteClass); // Xóa lớp học theo ID
router.get("/getClass/:id", classController.getClass);
/*\
router.get("/:id/modules", classController.getModulesByClassId); // Lấy tất cả các module của lớp học theo ID
router.get("/:id", classController.getClassById); // Lấy lớp học theo ID
*/
module.exports = router;
