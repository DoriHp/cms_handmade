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
		res.cookie('result', result, { expires: new Date(Date.now() + 5000)})
		//res.status(200).sendFile(__basedir + '/public/properties.html')
		res.status(200)
		if(type_of_script(result) == true){
			res.render('properties', {quick_replies: result.scripts.question.quick_replies})
		}
	}else{
		res.status(500)
	}
}

function type_of_script(input){
	if(typeof(input) == 'array'){
		input.forEach(ele, type_of_script(ele))
	}else if(typeof(input) == 'object'){
		if('question' in input) return true
	}

	return false
}