var mongoose = require('mongoose')

var userSchema = new mongoose.Schema({

	_id: mongoose.Schema.Types.ObjectId,
	username: String,
	password: String,
	name: String,
	email: String,
	role: String
})

var User = mongoose.model('User', userSchema, 'users')

module.exports = User