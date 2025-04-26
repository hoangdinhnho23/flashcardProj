const mongoose = require('mongoose');

const FlashcardSchema = new mongoose.Schema({
    moduleId: {type: mongoose.Schema.Types.ObjectId, ref:'Module', required:true},
    term: {type:String, required:true},
    definition: {type:String, required:true},
    imageUrlTerm: {type:String},
    imageUrlDefinition: {type:String}
})

module.exports = mongoose.model('Flashcard',FlashcardSchema);