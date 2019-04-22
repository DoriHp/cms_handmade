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
            type : String, 
            pattern : String
        }
    ], 
    variables : [String], 
    script : [
        {
            topic : String, 
            script : [
                {
                    text : [String],
                    fb_attachment: {
                        template_type: String,
                        elements: [
                            {
                                title: String,
                                subtitle: String,
                                image_url: String,
                                button: [
                                    {
                                        type: String,
                                        title: String,
                                        url: String,
                                        webview_height_ratio: String,
                                        payload: String
                                    }                                
                                ]
                            }
                        ],
                        action: String
                    },
                }
            ]
        }
    ]
})

var Script = mongoose.model('Script', scriptSchema, 'scripts')

module.exports = Script