var mongoose = require('mongoose')

var FeedbackSchema = new mongoose.Schema({

	_id: mongoose.Schema.Types.ObjectId,
	id: String,
	type: String, 
	datetime: String,
	fb_id: String,
	feedbacks: mongoose.Schema.Types.Mixed,
	status:{
		read: Boolean,
		reply: Boolean
	}
	// status: Number
})

var Feedback = mongoose.model('Feedback', FeedbackSchema, 'feedbacks')

module.exports = Feedback