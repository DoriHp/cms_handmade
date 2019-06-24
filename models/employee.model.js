var mongoose = require('mongoose')

var employeeSchema = new mongoose.Schema({
	_id: mongoose.Schema.Types.ObjectId,
	area_code: String,
	name: String,
	phone: String
})

var Employee = mongoose.model('Employee', employeeSchema, 'employees')

module.exports = Employee