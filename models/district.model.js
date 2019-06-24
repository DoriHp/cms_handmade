var mongoose = require('mongoose')

var districtSchema = new mongoose.Schema({
	_id: mongoose.Schema.Types.ObjectId,
	district_code: String,
	province_code: String,
	name: String,
	pic_name: String,
	pic_phone: String,
	office_address: String,
	hotline: String 
})

var District = mongoose.model('District', districtSchema, 'districts')

module.exports = District