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
module.exports.product = async function(req, res){
	var result = await Product.find().lean()
	res.status(200).render('product_table', {breadcrumb:[{href: '/manager/product', locate: 'Quản lý danh sách sản phẩm'}], data: result, user: {username: 'admin'}})
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


