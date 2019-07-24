var mongoose = require('mongoose')

var packageSchema = new mongoose.Schema({
	_id: mongoose.Schema.Types.ObjectId,
	package_code: String, 
	image_name: String,
	description_link: String,
	priority: Number,
	create_time: Date,
	upadate_time: Date
})

var Package = mongoose.model('Package', packageSchema, 'vas_packages')

module.exports = Package