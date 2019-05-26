var mongoose = require('mongoose')

var userSchema = new mongoose.Schema({

	_id: mongoose.Schema.Types.ObjectId,
	username: String,
	password: String,
	page_token: String
})

var User = mongoose.model('User', userSchema, 'users')

module.exports = User