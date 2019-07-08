require('dotenv').config()
var Script = require('../models/script.model.js')
var Member = require('../models/member.modal.js')

module.exports.sendBroadcastForm = function(req, res){
	res.render('broadcast_form', {locate: 'Broacast message', user: {username: 'Bảo'}})
}

module.exports.execUpload = function(req, res){
	var filename = req.file.filename
	var response = 'https://' + req.headers.host + '/public/image/' + filename
	res.status(200).send(response)
}

module.exports.execBroadcast = function(req, res){
	console.log(req.body.data)
	var timer
	if(req.body.data.timer){
		timer = req.body.data.timer / 1000
		delete(req.body.data.timer)
	}

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
		console.log(error1)
		var option2_data = (timer)?{message_creative_id: message_creative_id, schedule_time: timer}:{message_creative_id: message_creative_id}
		var option2 = {
			method : 'POST',
			uri: 'https://graph.facebook.com/v3.3/me/broadcast_messages?access_token=' + process.env.PAGE_ACCESS_TOKEN,
			headers:{
				'Content-Type': 'application/json'
			},
			body: option2_data,
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
