const Flashcard = require('../models/Flashcard');

// Tạo một flashcard mới
const createFlashcard = async (req, res) => {
    const newFlashcard = new Flashcard({
        moduleId: req.body.moduleId,
        term: req.body.term,
        definition: req.body.definition,
        imageUrlTerm: req.body.imageUrlTerm,
        imageUrlDefinition: req.body.imageUrlDefinition
    });
    try {
        const savedFlashcard = await newFlashcard.save();
        res.status(201).json(savedFlashcard)
    } catch (error) {
        res.status(400).json({message:error.message});
    }
}

module.exports = {
    createFlashcard
}