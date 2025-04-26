const Class = require("../models/Class");
const Module = require("../models/Module");
const Flashcard = require("../models/Flashcard");

// Lấy tất cả các lớp học
const getAllClasses = async (req, res) => {
  try {
    const classes = await Class.find();
    res.json(classes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Tạo một lớp học mới
const createClass = async (req, res) => {
  const newClass = new Class({
    name: req.body.name,
  });
  try {
    const savedClass = await newClass.save();
    res.status(201).json(savedClass);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getModulesAndTerm = async (req, res) => {
  const classId = req.params.id;
  if (!classId)
    return res.status(400).json({ message: "Class ID is required" });
  try {
    const classData = await Module.find({ classId: classId }).lean();

    // Dùng Promise.all để chạy song song việc đếm flashcard cho từng module
    const modulesWithTermCount = await Promise.all(
      classData.map(async (module) => {
        const flashcardCount = await Flashcard.countDocuments({
          moduleId: module._id,
        });
        return { ...module, termCount: flashcardCount };
      })
    );

    res.json(modulesWithTermCount);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateClass = async (req, res) => {
  const classId = req.params.id;
  const updatedClass = req.body;
  try {
    const classData = await Class.findByIdAndUpdate(classId, updatedClass, {
      new: true,
    });
    if (!classData) {
      return res.status(404).json({ message: "Class not found" });
    }
    res.json(classData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteClass = async (req, res) => {
  const classId = req.params.id;
  try {
    const classData = await Class.findByIdAndDelete(classId);
    res.json(classData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getClass = async (req, res) => {
  const classId = req.params.id;
  try {
    const classData = await Class.findById(classId);
    res.json(classData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Ensure these methods are exported correctly
module.exports = {
  getAllClasses,
  createClass,
  getModulesAndTerm,
  updateClass,
  deleteClass,
  getClass,
};
