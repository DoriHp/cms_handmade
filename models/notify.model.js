var mongoose = require('mongoose')

var notifySchema = new mongoose.Schema({
	_id: mongoose.Schema.Types.ObjectId,
	ticket_id: Number,
	time: Date,
	status: Boolean,
	category: String,
	username: String
})

var Notify = mongoose.model('Notify', notifySchema, 'notifications')

module.exports = Notify