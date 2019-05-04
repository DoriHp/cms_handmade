var mongoose = require('mongoose')
var ObjectId =  mongoose.Schema.Types.ObjectId

var scriptSchema = new mongoose.Schema({ 
    _id : ObjectId, 
    command : String, 
    description : String, 
    id : String, 
    name : String, 
    triggers : [
        {
            fromType : String, 
            pattern : String
        }
    ], 
    variables : [String], 
    scripts: {type: mongoose.Schema.Types.Mixed},
    id_next_question: String
})



var Script = mongoose.model('Script', scriptSchema, 'scripts')

module.exports = Script

