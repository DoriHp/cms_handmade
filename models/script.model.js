var mongoose = require('mongoose')

var triggerSchema = new mongoose.Schema({
    _id : false,
    type : String, 
    pattern : String
})

var responseSchema = new mongoose.Schema({
    _id: false,
    response: [String],
    next_script: String
})

var scriptSchema = new mongoose.Schema({ 
    _id : mongoose.Schema.Types.ObjectId, 
    command : String, 
    description : String, 
    type: String,
    id : String, 
    name : String, 
    triggers : [triggerSchema], 
    variables : [String], 
    script: mongoose.Schema.Types.Mixed,
    next_script: String,
    response_mapping: [responseSchema],
    intent: String,
    entities: [String],
    versionKey: false
})



var Script = mongoose.model('Script', scriptSchema, 'scripts')

module.exports = Script

