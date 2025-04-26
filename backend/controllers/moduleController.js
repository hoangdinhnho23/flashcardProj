const Module = require("../models/Module");
const Class = require("../models/Class");
const Flashcard = require("../models/Flashcard");

//Lấy tất cả các học phần
const getAllModules = async (req, res) => {
  try {
    const modules = await Module.find();
    res.json(modules);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//Tạo một học phần mới
const createModule = async (req, res) => {
  const newModule = new Module({
    name: req.body.name,
    classId: req.body.classId,
    description: req.body.description,
  });
  try {
    const savedModule = await newModule.save();
    res.status(201).json(savedModule);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
//Lấy tất cả các flashcard của module theo ID
const getFlashcardsByModuleId = async (req, res) => {
  try {
    const moduleId = req.params.id;
    const flashcards = await Flashcard.find({ moduleId: moduleId });
    res.json(flashcards);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateModule = async (req, res) => {
  try {
    const moduleId = req.params.id;
    const updateModule = req.body;
    const moduleData = await Module.findByIdAndUpdate(moduleId, updateModule, {
      new: true,
    });
    res.json(moduleData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteModule = async (req, res) => {
  try {
    const moduleId = req.params.id;
    const moduleData = await Module.findByIdAndDelete(moduleId);
    res.json(moduleData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
module.exports = {
  getAllModules,
  createModule,
  getFlashcardsByModuleId,
  updateModule,
  deleteModule,
};
