var mongoose = require('mongoose')

var tk_historySchema = new mongoose.Schema({
	_id: mongoose.Schema.Types.ObjectId,
	ticket_id: Number,
	update_time: Date,
	update_by: String,
	change_description: {
		_id: false,
		content: [{
			field: String,
			value: String
		}],
		comment: String
	}
})

var Tk_history = mongoose.model('Tk_history', tk_historySchema, 'ticket_history')

module.exports = Tk_history