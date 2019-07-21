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
var client = require('./redis.client.js')

//District management module
module.exports.district = async function(req, res){
	var data = await District.find().lean()
	var province = await Province.find().lean()
	res.status(200).render('district_table', {breadcrumb: [{href:'/manager/province' ,locate: 'Quản lý danh sách quận huyện'}], data: data, province: province, user: req.user})
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
		res.status(500).send("Đã có lỗi xảy ra, vui lòng thử lại sau!")
	}
}

module.exports.dt_adding = function(req, res){
	District.insertMany(req.body.data, function(err, result){

		if(!err){
			res.status(200).send('OK')
		}else{
			res.status(500).send("Đã có lỗi xảy ra, vui lòng thử lại sau!")
		}
	})
	//some code here
}

module.exports.dt_update = function(req, res){
	var update = req.body.data
	Product.findOneAndUpdate({'_id': req.params._id}, {$set: update}, {new: true, upsert: false, useFindAndModify: false}, function(err, result){
		if(err){
			res.status(500).send('An error occured!')
		}else{
			res.status(200).send('Update successfully')
		}
	})
}

module.exports.dt_delete = function(req, res){
	//some code here
	District.findOneAndDelete({'_id': req.params._id}, function(err, result){
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
	res.status(200).render('province_table', {breadcrumb: [{href: '/manager/province', locate: 'Quản lý danh sách tỉnh thành'}], data: data, user: req.user})
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
		res.status(500).send("Không tìm thấy dữ liệu tương ứng!")
	}
}

module.exports.pv_adding = function(req, res){
	Province.insertMany(req.body.data, function(err, result){

		if(!err){
			res.status(200).send('OK')
		}else{
			res.status(500).send("Đã có lỗi xảy ra, vui lòng thử lại sau!")
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
		res.status(500).send("Không tìm thấy dữ liệu tương ứng!")
	}
	var result = await District.find({province_code: province.province_code}).lean()
	res.status(200).send(result)
}
//End of province management modules
//Product management modules
module.exports.product =async function(req, res){
	var data = await Product.find().lean()
	res.status(200).render('product_table', {breadcrumb:[{href: '/manager/product', locate: 'Quản lý danh sách sản phẩm'}], data: data, user: {username: 'admin'}})
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
			res.status(500).send("Đã có lỗi xảy ra, vui lòng thử lại sau!")
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
		res.status(500).send("Không có dữ liệu tương ứng")
	}
}

//Feedback management modules

const get_user_data = async (req, res) => {
	var _id = req.params._id
	var result = await Feedback.findById(_id).lean()
	if(!result){
		res.status(500).send("Không tìm thấy dữ liệu yêu cầu!")
		return
	} 
	var fb_id = result.fb_id
	var member = await Member.findOne({fb_id: fb_id}).lean()
	if(!member){
		res.status(500).send("Đã có lỗi xảy ra, vui lòng thử lại sau!")
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
			res.status(500).send("Đã có lỗi xảy ra, vui lòng thử lại sau!")
		}
		var send = JSON.parse(body)
		send.auto_reply = auto_reply
		// client.setex(_id, 3600, JSON.stringify(send))
		res.status(200).send(send)
	})
}

module.exports.feedback = async function(req, res){
	var feedbacks = await Feedback.find({}, ['fb_id', 'type', 'datetime', 'status']).lean()
	console.log(feedbacks)
	res.status(200).render('feedback', {breadcrumb: [{ href: "/manager/feedback", locate: 'Quản lý phản ánh từ người dùng'}], user: {username: "Bảo"}, feedbacks: feedbacks})

}	

module.exports.feedback_list = async function(req, res){
	switch (req.params.filter) {
		case 'all':
			var feedbacks = await Feedback.find().lean()
			if(feedbacks){
				res.status(200).send(feedbacks)
			}else{
				res.status(500).send("Lỗi khi tải dữ liệu người dùng!")
			}
			break;
		case 'unread':
			var feedbacks = await Feedback.find({'status.read': false}).lean()
			if(feedbacks){
				res.status(200).send(feedbacks)
			}else{
				res.status(500).send("Lỗi khi tải dữ liệu người dùng!")
			}
			break
		case 'unreply':
			var feedbacks = await Feedback.find({'status.reply': false}).lean()
			if(feedbacks){
				res.status(200).send(feedbacks)
			}else{
				res.status(500).send("Đã có lỗi xảy ra, vui lòng thử lại sau!")
			}
			break
		default:
			res.status(500).send('Không tìm thấy dữ liệu tương ứng!')
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
		res.status(500).send("Đã có lỗi xảy ra, vui lòng thử lại sau!")
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
//lấy thông tin người dùng
module.exports.get_user_info = async function(req, res){
	var _id = req.params._id
	var result = await Feedback.findById(_id).lean()
	if(!result){
		res.status(500).send("Lỗi khi tải dữ liệu người dùng!")
		return
	} 
	var fb_id = result.fb_id
	var member = await Member.findOne({fb_id: fb_id}).lean()
	if(!member){
		res.status(500).send("Lỗi khi tải dữ liệu người dùng!")
		return
	}
	var auto_reply = member.auto_reply
	function get_info_from_api(fb_id){
		var options = {
		uri: `https://graph.facebook.com/v3.2/${fb_id}?fields=first_name,last_name,profile_pic,locale,timezone,gender&access_token=${process.env.PAGE_ACCESS_TOKEN_2}`,
			headers: {
				'Content-Type': 'application/json'
			}
		}
		request(options, function(error, response, body){
			if(response.statusCode != 200 || error){
				res.status(500).send("Lỗi khi tải dữ liệu người dùng!")
			}
			var send = JSON.parse(body)
			client.setex(fb_id, 3600, body)
			send.auto_reply = auto_reply
			// client.setex(_id, 3600, JSON.stringify(send))
			res.status(200).send(send)
		})
	}
	client.get(fb_id, (err, result) => {
	    if (result) {
	      	var send = JSON.parse(result)
	      	res.status(200).send(send)
	    } else {
	      	get_info_from_api(fb_id)
	    }
	})
}

module.exports.get_user_link = async function(req, res, next){
	var result = await Member.findOne({fb_id: req.params.fb_id})
	if(!result){
		res.status(500).send("Không tìm thấy dữ liệu người dùng!")
	}else{
		res.status(200).send(result.fb_linkChat)
	}
}

module.exports.update_status_member = async function(req, res){
	var update = req.body.data
	console.log(req.params.fb_id)
	await Member.findOneAndUpdate({fb_id: req.params.fb_id}, {$set:update}, {new: true, upsert: false, useFindAndModify: false}, function(err, result){
		if(err){
			res.status(500).send("Đã có lỗi xảy ra, vui lòng thử lại sau!")
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
			res.status(500).send("Đã có lỗi xảy ra, vui lòng thử lại sau!")
		}else{
			res.status(200).send("")
		}
	})
}

