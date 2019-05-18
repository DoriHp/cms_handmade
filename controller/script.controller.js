var express = require('express')
var Script = require('../models/script.model.js')

module.exports.index = async (req, res) => {
	var result = await Script.find().lean()
	res.send(result)
}

module.exports.addScript = (req, res) => {
	var intent = req.params.intent
	if(intent == "question"){
		res.status(200)
		res.sendFile(__basedir + '/public/add_script.html')
	}else{
		res.status(200)
		res.sendFile(__basedir + '/public/add_script_2.html')
	}
}

module.exports.saveNewScript = (req, res) => {
	var data = JSON.parse(req.body.data)
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
		res.status(200)
		res.sendFile(__basedir + '/public/add_script_2.html')
		// if(result.type == 'question'){
		// 	res.render('properties', {
		// 		id : result.id,
		// 		triggers: result.triggers,
		// 		question: result.script.question
		// 	})
		// }
	}else{
		res.status(500)
	}
}
