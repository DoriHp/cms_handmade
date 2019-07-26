var mongoose = require('mongoose')

var configSchema = new mongoose.Schema({
	_id: mongoose.Schema.Types.ObjectId,
	ticketCounter: Number,
	lastTimeSynchronizeData: Date,
	minMinuteBetweenEachVasQuery: Number,
	synchronizationCounter: Number,
	defaultPassword: String
})

var Config = mongoose.model('Config', configSchema, 'configs')

module.exports = Config