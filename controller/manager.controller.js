var express = require('express')
var mongoose = require('mongoose')
require('dotenv').config()
var Employee = require('../models/employee.model.js')
var District = require('../models/district.model.js')
var Province = require('../models//province.model.js')
var Product = require('../models/product.model.js')
var Feedback = require('../models/feedback.model.js')
var Member = require('../models/member.modal.js')
var request = require('request')

//District management module
module.exports.district = async function(req, res){
	var data = await District.find().lean()
	var province = await Province.find().lean()
	res.status(200).render('district_table', {locate: 'Quản lý danh sách quận huyện', data: data, province: province, user: req.user})
}

module.exports.dt_list = async function(req, res){
	var result = await District.find().lean()
	res.status(200).send(result)
}

module.exports.dt_properties = async function(req, res){

	var _id = decodeURIComponent(req.params._id)
	var result = await District.findById(_id).lean()
	if(result){
		res.status(200).send(result)
	}else{
		res.status(404).end()
	}
}

module.exports.dt_adding = function(req, res){
	District.insertMany(req.body.data, function(err, result){

		if(!err){
			res.status(200).send('OK')
		}else{
			res.status(500).end()
		}
	})
	//some code here
}

module.exports.dt_update = async function(req, res){
	var update = req.body.data
	await Product.findOneAndUpdate({'_id': req.params._id}, {$set: update}, {new: true, upsert: false, useFindAndModify: false}, function(err, result){
		if(err){
			res.status(500).send('An error occured!')
		}else{
			res.status(200).send('Update successfully')
		}
	})
}

module.exports.dt_delete = async function(req, res){
	//some code here
	await District.findOneAndDelete({'_id': req.params._id}, function(err, result){
		if(err){
			res.status(500).send('An error occured!')
		}else{
			res.status(200).send('Delete successfully!')
		}
	})
}

//End of district management module
//Province management module
module.exports.province = async function(req, res){
	var data = await Province.find().lean()
	res.status(200).render('province_table', {locate: 'Quản lý danh sách tỉnh thành', data: data, user: req.user})
}

module.exports.pv_list = async function(req, res){
	var result = await Province.find().lean()
	res.status(200).send(result)
}

module.exports.pv_properties = async function(req, res){

	var _id = decodeURIComponent(req.params._id)
	var result = await Province.findById(_id).lean()
	if(result){
		res.status(200).send(result)
	}else{
		res.status(404).end()
	}
}

module.exports.pv_adding = function(req, res){
	Province.insertMany(req.body.data, function(err, result){

		if(!err){
			res.status(200).send('OK')
		}else{
			res.status(500).end()
		}
	})
	//some code here
}

module.exports.pv_update = async function(req, res){
	var update = req.body.data
	await Province.findOneAndUpdate({'_id': req.params._id}, {$set: update}, {new: true, upsert: false, useFindAndModify: false}, function(err, result){
		if(err){
			res.status(500).send('An error occured!')
		}else{
			res.status(200).send('Update successfully')
		}
	})
}

module.exports.pv_delete = async function(req, res){
	//some code here
	await Province.findOneAndDelete({'_id': req.params._id}, function(err, result){
		if(err){
			res.status(500).send('An error occured!')
		}else{
			res.status(200).send('Delete successfully!')
		}
	})
}

module.exports.pv_dt = async function(req, res){
	var _id = decodeURIComponent(req.params._id)
	var province = await Province.findById(_id).lean()
	if(!province){
		res.status(404).end()
	}
	var result = await District.find({province_code: province.province_code}).lean()
	res.status(200).send(result)
}
//End of province management modules
//Product management modules
module.exports.product =async function(req, res){
	var data = await Product.find().lean()
	res.status(200).render('product_table', {locate: 'Quản lý danh sách sản phẩm', data: data, user: {username: 'admin'}})
}

module.exports.pd_list = async function(req, res){
	var result = await Product.find().lean()
	res.status(200).send(result)
}

module.exports.pd_update = async function(req, res){
	var update = req.body.data
	await Product.findOneAndUpdate({'_id': req.params._id}, {$set: update}, {new: true, upsert: false, useFindAndModify: false}, function(err, result){
		if(err){
			res.status(500).send('An error occured!')
		}else{
			res.status(200).send('Update successfully')
		}
	})
}

module.exports.pd_adding = function(req, res){
	Product.insertMany(req.body.data, function(err, result){

		if(!err){
			res.status(200).send('OK')
		}else{
			res.status(500).end()
		}
	})
}

module.exports.pd_delete = async function(req, res){

	await Product.findOneAndDelete({'_id': req.params._id}, function(err, result){
		if(err){
			res.status(500).send('An error occured!')
		}else{
			res.status(200).send('Delete successfully!')
		}
	})
}

module.exports.pd_properties = async function(req, res){
	var _id = decodeURIComponent(req.params._id)
	var result = await Product.findById(_id).lean()
	if(result){
		res.status(200).send(result)
	}else{
		res.status(404).end()
	}
}

//Feedback management modules

//use redis module
const get_user_data = async (req, res) => {
	var _id = req.params._id
	var result = await Feedback.findById(_id).lean()
	if(!result){
		res.status(500).end()
		return
	} 
	var fb_id = result.fb_id
	var member = await Member.findOne({fb_id: fb_id}).lean()
	if(!member){
		res.status(500).end()
		return
	}
	var auto_reply = member.auto_reply
	var options = {
		uri: `https://graph.facebook.com/v3.2/${fb_id}?fields=first_name,last_name,profile_pic,locale,timezone,gender&access_token=${process.env.PAGE_ACCESS_TOKEN_2}`,
		headers: {
			'Content-Type': 'application/json'
		}
	}
	request(options, function(error, response, body){
		if(response.statusCode != 200 || error){
			res.status(500).end()
		}
		var send = JSON.parse(body)
		send.auto_reply = auto_reply
		// client.setex(_id, 3600, JSON.stringify(send))
		res.status(200).send(send)
	})
}

module.exports.feedback = async function(req, res){
	var feedbacks = await Feedback.find().lean()
	var data = []
	for(var i of feedbacks){
		data.push({
			_id: i._id,
			fb_id: i.fb_id,
			type: i.type,
			time: i.datetime,
			status: {
				reply: i.status.reply,
				read: i.status.read
			}
		})
	}
	console.log()
	res.status(200).render('feedback', {breadcrumb: [{ href: "/manager/feedback", locate: 'Quản lý phản ánh từ người dùng'}], user: {username: "Bảo"}, feedbacks: data})

}	

module.exports.feedback_list = async function(req, res){
	switch (req.params.filter) {
		case 'all':
			var feedbacks = await Feedback.find().lean()
			if(feedbacks){
				res.status(200).send(feedbacks)
			}else{
				res.status(503).end()
			}
			break;
		case 'unread':
			var feedbacks = await Feedback.find({'status.read': false}).lean()
			if(feedbacks){
				res.status(200).send(feedbacks)
			}else{
				res.status(503).end()
			}
			break
		case 'unreply':
			var feedbacks = await Feedback.find({'status.reply': false}).lean()
			if(feedbacks){
				res.status(200).send(feedbacks)
			}else{
				res.status(503).end()
			}
			break
		default:
			res.status(404).send('Not found!')
			break;
	}
}

module.exports.get_feedback_content = async function(req, res){
	var content = await Feedback.findById(req.params._id).lean()
	if(content){
		customFilter(content)
		setTimeout(function(){
			res.status(200).send(content)
		}, 1000)
		
	}else{
		res.status(500).end()
	}
}
//lọc feedback phù hợp với request từ client
function customFilter(object){
	for(let i of object.feedbacks){
		if(i.attachments && i.attachments[0].type == 'file'){
	        var path = require('path')
	        , url = require('url')
	        , URL_TO_REQUEST = i.attachments[0].payload.url
	        , uri = url.parse(URL_TO_REQUEST)
	        , filename = path.basename(uri.path)

	        request(URL_TO_REQUEST, function(error, response, body){
	        	if(error){
	        		console.log(error)
	        		return null
	        	}
	            var result = decodeURIComponent(filename)
	            var reg = /^([\Da-zA-Z0-9]+)?_nc_cat/g
	            i.attachments[0].payload.url = reg.exec(result)[1]
         	})
		}
	}
}

module.exports.get_user_info = async function(req, res){
	var _id = req.parmas._id
	// client.get(_id, (err, result) => {
	// 	if(result) {
	// 		res.send(result)
	// 	}else{
	// 		get_user_data(req, res)
	// 	}
	// })
	get_user_data(req, res)
}

module.exports.get_user_link = async function(req, res, next){
	var result = await Member.findOne({fb_id: req.params.fb_id})
	if(!result){
		res.status(404).end()
	}else{
		res.status(200).send(result.fb_linkChat)
	}
}

module.exports.update_status_member = async function(req, res){
	var update = req.body.data
	console.log(req.params.fb_id)
	await Member.findOneAndUpdate({fb_id: req.params.fb_id}, {$set:update}, {new: true, upsert: false, useFindAndModify: false}, function(err, result){
		if(err){
			res.status(500).end()
		}else{
			console.log('Updated!')
			res.status(200).end()
		}
	})
}

module.exports.update_status_feedback = async function(req, res){
	var update = req.body.data
	await Feedback.findByIdAndUpdate(req.params._id, {$set:update}, {new: true, upsert: false, useFindAndModify: false}, function(err, result){
		if(err){
			res.status(500).end()
		}else{
			res.status(200).end()
		}
	})
}

