const mongoose = require('mongoose');

const ModuleSchema = new mongoose.Schema({
    classId: {type: mongoose.Schema.Types.ObjectId, ref: 'Class',required: true},
    name: {type:String, required: true},
    description: {type:String, required: false},
    createdAt: {type:Date,default:Date.now}
})

module.exports = mongoose.model('Module',ModuleSchema);