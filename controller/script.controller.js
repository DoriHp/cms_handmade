var express = require('express')
var Script = require('../models/script.model.js')

module.exports.index = async (req, res) => {
	var result = await Script.find().lean()
	console.log(result[0])
	res.send(result)
}