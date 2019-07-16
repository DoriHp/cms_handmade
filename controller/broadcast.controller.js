require('dotenv').config()
var Script = require('../models/script.model.js')
var Member = require('../models/member.modal.js')
var graph = require('fbgraph')
var request = require('request')
var fs = require('fs')

module.exports.sendBroadcastForm = async function(req, res){
	var result = []
	var members = await Member.find().lean()
	//gọi đến api của fbgraph
	function test(){
	   graph.get(`https://graph.facebook.com/v2.11/me/custom_labels?fields=name&access_token=${process.env.PAGE_ACCESS_TOKEN_2}`, function(err, res){
	       	if (err) {
	       		console.log('Đã có lỗi xảy ra! ' + err)
	       	}
	        res.data.forEach(data => {
            	result.push(data)
            })
	        recursion(res)
	   }) 
	}

	test()

	//sử dụng đệ quy để lấy kết quả tới khi nào hết paging.next
	async function recursion(previousRes) {
	    if(previousRes.paging && previousRes.paging.next) {
	        var promise = await new Promise(function(resolve, reject){
	            graph.get(previousRes.paging.next, function(err, currentRes) {
	                if (err) {
	                    reject(err)
	                } else {
	                    resolve(currentRes);
	                }
	            })
	        }).then(resolveData => {
	            console.log('Get a new page: \n')
	            resolveData.data.forEach(data => {
	            	result.push(data)
	            })
	            recursion(resolveData)
	        }, rejectError => {
	            console.log(rejectError)
	        })
	    } else {
	    	//update linkChat trong csdl
	        res.render('broadcast_form', {breadcrumb: [{href: "#", locate: "Tin nhắn 24 + 1" }, {href: "/message241/brodacast", locate: 'Tin nhắn hàng loạt'}], user: {username: 'Bảo'}, labels: result, members: members})
		}
	}
}

module.exports.execUpload = function(req, res){
	var filename = req.file.filename
	var response = 'http://' + req.headers.host + '/public/image/' + filename
	res.status(200).send(response)
}

module.exports.add_psid_to_label = function(req, res){
	var psid = req.body.data.psid
	var label = req.body.data.label
	var option = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		uri: `https://graph.facebook.com/v2.11/${label}/label?access_token=${process.env.PAGE_ACCESS_TOKEN}`,
		body: {user: psid},
		json: true
	}
	request(option, function(error, response, body){
		if(error) res.status(500).end()
		console.log(body)
		if(!body.error){
			res.status(200).end()
		}else{
			res.status(500).end()
		}
	})
}

module.exports.execBroadcast = function(req, res){
	console.log(req.body.data)
	var timer
	var label 
	if(req.body.data.timer){
		timer = req.body.data.timer / 1000
		delete(req.body.data.timer)
	}

	if(req.body.data.label){
		label = req.body.data.label
		delete(req.body.data.label)
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
		var option2_data = {message_creative_id: message_creative_id}
		if(timer) option2_data.schedule_time = timer
		if(label) option2_data.custom_label_id = label
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
			if(!body.error){
				res.status(200).send('OK')
			}else{
				res.status(503).end()
			}
	
			var broadcast_id = body.broadcast_id
			var option3 = {
				method: 'POST',
				uri: `https://graph.facebook.com/v2.11/${broadcast_id}/insights/messages_sent?access_token=${process.env.PAGE_ACCESS_TOKEN}`
			}
			request(option3, function(err, response, body){
				if(!body.error){
					var now = new Date()
					var number = body.data[0].values[0].value
					var type = (timer)?'Scheduled message':"" + (label)?'Targeting message':""
					var save = {
						time: now,
						number: number,
						type: type
					}
					fs.writeFileSync('./log/broadcast.history.json', )
				}
			})
		})
	})
}
