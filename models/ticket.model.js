var mongoose = require('mongoose')

var member_profileSchema = new mongoose.Schema({
	_id: false,
	member_code: String,
	fb_linkChat: String,
	fb_id: String,
	name: String, 
	contact_phone: String
})

var ticketSchema = new mongoose.Schema({
	_id: mongoose.Schema.Types.ObjectId,
	id: Number,
	type: String,
	status: String,
	priority: String,
	assignee: String,
	member_profile: member_profileSchema,
	comment: String,
	update_by: String,
	create_time: Date,
	update_time: Date,
	finish_time: Date,
	description: Object
})

var Ticket = mongoose.model('Ticket', ticketSchema, 'tickets')

module.exports = Ticket