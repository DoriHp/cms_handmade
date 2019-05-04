var express = require('express')
var Script = require('../models/script.model.js')

module.exports.index = async (req, res) => {
	var result = await Script.find().lean()
	res.send(result)
}

module.exports.addScript = (req, res) => {
	res.sendFile(__basedir + '/public/add_script.html')
}

module.exports.saveNewScript = (req, res) => {
	var data = JSON.parse(req.body.data)
	console.log(req.body.data)
	Script.insertMany(data, function(err, result){
		if(err){
			console.log(err)
			res.status(500).send("Error:" + err)
		}else{
			res.status(200).send('OK')
		}
	})
}

module.exports.getProperties = async function(req, res){

	var id = decodeURIComponent(req.params.id)
	var result = await Script.findOne({id : id}).lean()
	
	if(result){
		result = JSON.stringify(result)
		res.cookie('result', result)
		res.status(200).sendFile(__basedir + '/public/properties.html')
	}else{
		res.status(500)
	}
}