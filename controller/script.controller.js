var express = require('express')
var Script = require('../models/script.model.js')
require('dotenv').config()

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

	var _id = decodeURIComponent(req.params._id)
	var result = await Script.findById(_id).lean()
	var response = JSON.stringify(result)
	if(result){
		res.cookie("info" ,response)
		if(result.type == 'question'){
			res.status(200).sendFile(__basedir + '/public/properties.html')
		}else{
			res.status(200).sendFile(__basedir + '/public/properties_2.html')
		}
	}else{
		res.status(500)
	}
}

module.exports.delScript = function(req, res){
	
	Script.findOneAndRemove({'_id' : req.params._id}, { useFindAndModify: false }, function(err, result){
		if(err){
			res.status(500).end()
		}else{
			res.status(200).end()
		}
	})
}

module.exports.sendBroadcastForm = function(req, res){
	res.status(200).sendFile(__basedir + '/public/broadcast.html')
}

module.exports.execBroadcast = function(req, res){
	var request = require('request')
	var option1 = {
		method : 'POST',
		uri: 'https://graph.facebook.com/v3.3/me/message_creatives?access_token=' + process.env.PAGE_ACCESS_TOKEN,
		headers:{
			'Content-Type': 'application/json'
		},
		body: req.body.data,
		json: true
	}
	var message_creative_id, error1
	request(option1, function(err, response, body){
		if(err){
			console.log(err)
			throw err
		}
		message_creative_id = body.message_creative_id
		error1 = body
		var option2 = {
			method : 'POST',
			uri: 'https://graph.facebook.com/v3.3/me/broadcast_messages?access_token=' + process.env.PAGE_ACCESS_TOKEN,
			headers:{
				'Content-Type': 'application/json'
			},
			body: {message_creative_id: message_creative_id},
			json: true
		}

		request(option2, function(err, response, body){
			if(err){
				console.log(err)
				throw err
			}
			if(body.error == undefined){
				res.status(200).send('OK')
			}else{
				res.status(503).end()
			}
	
			console.log('broadcast_id:' + body.broadcast_id)
		})
	})
}