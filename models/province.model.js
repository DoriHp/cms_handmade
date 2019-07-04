var mongoose = require('mongoose')

var provinceSchema = new mongoose.Schema({
	_id: mongoose.Schema.Types.ObjectId,
	province_code: String,
	name: String,
	pic_name: String,
	pic_phone: String,
	office_address: String,
	hotline: String
})

var Province = mongoose.model('Province', provinceSchema, 'provinces')

module.exports = Province