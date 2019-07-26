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
var logger = require('../config/logger.js')

//District management module
module.exports.district = async function(req, res){
	logger.info(`Client send request ${req.method} ${req.url}`)
	var data = await District.find().lean()
	if(!data){
		logger.error("Lỗi khi thực hiện truy vấn tới bảng districts trong CSDL \n" + err)
        logger.error(Error("Bị lỗi từ hệ thống"))
        res.status(500).send("Đã có lỗi xảy ra, vui lòng thử lại sau!")
        return
	}
	var province = await Province.find().lean()
	if(!province){
		logger.error("Lỗi khi thực hiện truy vấn tới bảng provinces trong CSDL \n" + err)
        logger.error(Error("Bị lỗi từ hệ thống"))
        res.status(500).send("Đã có lỗi xảy ra, vui lòng thử lại sau!")
        return
	}
	res.status(200).render('district_table', {breadcrumb: [{href:'/manager/province' ,locate: 'Danh sách quận huyện'}], data: data, province: province, user: req.user})
}

module.exports.dt_list = async function(req, res){
	logger.info(`Client send request ${req.method} ${req.url}`)
	var result = await District.find().lean()
	if(!province){
		logger.error("Lỗi khi thực hiện truy vấn tới bảng districts trong CSDL \n" + err)
        logger.error(Error("Bị lỗi từ hệ thống"))
        res.status(500).send("Đã có lỗi xảy ra, vui lòng thử lại sau!")
        return
	}
	res.status(200).send(result)
}

module.exports.dt_properties = async function(req, res){
	logger.info(`Client send request ${req.method} ${req.url}`)
	var _id = decodeURIComponent(req.params._id)
	var result = await District.findById(_id).lean()
	if(result){
		res.status(200).send(result)
	}else{
		logger.error(`Lỗi khi thực hiện truy vấn dữ liệu một document của bảng district trong CSDL : _id = ${_id} \n` + err)
        logger.error(Error("Bị lỗi từ hệ thống"))
        res.status(500).send("Đã có lỗi xảy ra, vui lòng thử lại sau!")
	}
}

module.exports.dt_adding = function(req, res){
	logger.info(`Client send request ${req.method} ${req.url}`)
	District.insertMany(req.body.data, function(err, result){

		if(!err){
			logger.info("Thêm mới dữ liệu thành công vào bảng districts trong CSDL:" + JSON.stringify(result))
			res.status(200).send('OK')
		}else{
			logger.error(`Lỗi khi thực hiện thêm dữ liệu vào bảng districts trong CSDL \n` + err)
        	logger.error(Error("Bị lỗi từ hệ thống"))
			res.status(500).send("Đã có lỗi xảy ra, vui lòng thử lại sau!")
		}
	})
	//some code here
}

module.exports.dt_update = function(req, res){
	var _id = req.params._id
	logger.info(`Client send request ${req.method} ${req.url}`)
	var update = req.body.data
	District.findByIdAndUpdate(_id, {$set: update}, {new: true, upsert: false, useFindAndModify: false}, function(err, result){
		if(err){
			logger.error(`Lỗi khi thực hiện cập nhật dữ liệu vào bảng districts trong CSDL \n` + err)
        	logger.error(Error("Bị lỗi từ hệ thống"))
			res.status(500).send("Đã có lỗi xảy ra, vui lòng thử lại sau!")
		}else{
			logger.info("Cập nhật dữ liệu thành công vào bảng districts trong CSDL:" + JSON.stringify(result))
			res.status(200).send('Update successfully')
		}
	})
}

module.exports.dt_delete = function(req, res){
	//some code here
	logger.info(`Client send request ${req.method} ${req.url}`)
	District.findOneAndDelete({'_id': req.params._id}, function(err, result){
		if(err){
			logger.error(`Lỗi khi thực hiện xóa dữ liệu từ bảng districts trong CSDL \n` + err)
        	logger.error(Error("Bị lỗi từ hệ thống"))
			res.status(500).send('An error occured!')
		}else{
			logger.info("Đã xóa dữ liệu từ bảng districts trong CSDL:" + JSON.stringify(result))
			res.status(200).send('Delete successfully!')
		}
	})
}

//End of district management module
//Province management module
module.exports.province = async function(req, res){
	logger.info(`Client send request ${req.method} ${req.url}`)
	var data = await Province.find().lean()
	if(!data){
		logger.error("Lỗi khi thực hiện truy vấn tới bảng provinces trong CSDL \n" + err)
        logger.error(Error("Bị lỗi từ hệ thống"))
        res.status(500).send("Đã có lỗi xảy ra, vui lòng thử lại sau!")
        return
	}
	res.status(200).render('province_table', {breadcrumb: [{href: '/manager/province', locate: 'Danh sách tỉnh thành'}], data: data, user: req.user})
}

module.exports.pv_list = async function(req, res){
	logger.info(`Client send request ${req.method} ${req.url}`)
	var result = await Province.find().lean()
	res.status(200).send(result)
}

module.exports.pv_properties = async function(req, res){
	logger.info(`Client send request ${req.method} ${req.url}`)
	var _id = decodeURIComponent(req.params._id)
	var result = await Province.findById(_id).lean()
	if(result){
		res.status(200).send(result)
	}else{
		logger.error(`Lỗi khi thực hiện truy vấn dữ liệu một document của bảng provinces trong CSDL : _id = ${_id} \n` + err)
        logger.error(Error("Bị lỗi từ hệ thống"))
		res.status(500).send("Không tìm thấy dữ liệu tương ứng!")
	}
}

module.exports.pv_adding = function(req, res){
	logger.info(`Client send request ${req.method} ${req.url}`)
	Province.insertMany(req.body.data, function(err, result){

		if(!err){
			logger.info("Thêm mới dữ liệu thành công vào bảng provinces trong CSDL:" + JSON.stringify(result))
			res.status(200).send('OK')
		}else{
			logger.error(`Lỗi khi thực hiện thêm dữ liệu vào bảng provinces trong CSDL \n` + err)
        	logger.error(Error("Bị lỗi từ hệ thống"))
			res.status(500).send("Đã có lỗi xảy ra, vui lòng thử lại sau!")
		}
	})
	//some code here
}

module.exports.pv_update = function(req, res){
	logger.info(`Client send request ${req.method} ${req.url}`)
	var update = req.body.data
	Province.findOneAndUpdate({'_id': req.params._id}, {$set: update}, {new: true, upsert: false, useFindAndModify: false}, function(err, result){
		if(err){
			logger.error(`Lỗi khi thực hiện cập nhật dữ liệu vào bảng provinces trong CSDL \n` + err)
        	logger.error(Error("Bị lỗi từ hệ thống"))
			res.status(500).send('Đã có lỗi xảy ra, vui lòng thử lại sau!')
		}else{
			logger.info("Cập nhật dữ liệu thành công vào bảng provinces trong CSDL:" + JSON.stringify(result))
			res.status(200).send('Update successfully')
		}
	})
}

module.exports.pv_delete = async function(req, res){
	//some code here
	logger.info(`Client send request ${req.method} ${req.url}`)
	await Province.findOneAndDelete({'_id': req.params._id}, function(err, result){
		if(err){
			logger.error(`Lỗi khi thực hiện xóa dữ liệu từ bảng provinces trong CSDL \n` + err)
        	logger.error(Error("Bị lỗi từ hệ thống"))
			res.status(500).send('Đã có lỗi xảy ra, vui lòng thử lại sau!')
		}else{
			logger.info("Đã xóa dữ liệu từ bảng provinces trong CSDL:" + JSON.stringify(result))
			res.status(200).send('Delete successfully!')
		}
	})
}

module.exports.pv_dt = async function(req, res){
	logger.info(`Client send request ${req.method} ${req.url}`)
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
	logger.info(`Client send request ${req.method} ${req.url}`)
	var result = await Product.find().lean()
	if(!result){
		logger.error("Lỗi khi thực hiện truy vấn tới bảng products trong CSDL \n" + err)
        logger.error(Error("Bị lỗi từ hệ thống"))
        res.status(500).send("Đã có lỗi xảy ra, vui lòng thử lại sau!")
        return
	}
	for(let i of result){
		i.gia_goi_string = (i.gia_goi)?i.gia_goi.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,") + ' VND':""
		i.hoa_hong_msocial_string = (i.hoa_hong_msocial)?i.hoa_hong_msocial.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,") + ' VND':""
	}
	res.status(200).render('product_table', {breadcrumb:[{href: '/manager/product', locate: 'Danh sách sản phẩm'}], data: result, user: {username: 'admin'}})
}

module.exports.pd_list = async function(req, res){
	logger.info(`Client send request ${req.method} ${req.url}`)
	var result = await Product.find().lean()
	if(!result){
		logger.error("Lỗi khi thực hiện truy vấn tới bảng products trong CSDL \n" + err)
        logger.error(Error("Bị lỗi từ hệ thống"))
        res.status(500).send("Đã có lỗi xảy ra, vui lòng thử lại sau!")
        return
	}
	res.status(200).send(result)
}

module.exports.pd_update = async function(req, res){
	logger.info(`Client send request ${req.method} ${req.url}`)
	var update = req.body.data
	await Product.findOneAndUpdate({'_id': req.params._id}, {$set: update}, {new: true, upsert: false, useFindAndModify: false}, function(err, result){
		if(err){
			logger.error(`Lỗi khi thực hiện cập nhật dữ liệu vào bảng products trong CSDL \n` + err)
        	logger.error(Error("Bị lỗi từ hệ thống"))
			res.status(500).send('Đã có lỗi xảy ra, vui lòng thử lại sau!')
		}else{
			logger.info("Cập nhật dữ liệu thành công vào bảng products trong CSDL:" + JSON.stringify(result))
			res.status(200).send('Update successfully')
		}
	})
}

module.exports.pd_adding = function(req, res){
	logger.info(`Client send request ${req.method} ${req.url}`)
	Product.insertMany(req.body.data, function(err, result){

		if(!err){
			logger.info("Thêm mới dữ liệu thành công vào bảng districts trong CSDL:" + JSON.stringify(result))
			res.status(200).send('OK')
		}else{
			logger.error(`Lỗi khi thực hiện thêm dữ liệu vào bảng products trong CSDL \n` + err)
        	logger.error(Error("Bị lỗi từ hệ thống"))
			res.status(500).send("Đã có lỗi xảy ra, vui lòng thử lại sau!")
		}
	})
}

module.exports.pd_delete = async function(req, res){
	logger.info(`Client send request ${req.method} ${req.url}`)
	await Product.findOneAndDelete({'_id': req.params._id}, function(err, result){
		if(err){
			ogger.error(`Lỗi khi thực hiện xóa dữ liệu từ bảng products trong CSDL \n` + err)
        	logger.error(Error("Bị lỗi từ hệ thống"))
			res.status(500).send('Đã có lỗi xảy ra, vui lòng thử lại sau!')
		}else{
			logger.info("Đã xóa dữ liệu từ bảng products trong CSDL:" + JSON.stringify(result))
			res.status(200).send('Delete successfully!')
		}
	})
}

module.exports.pd_properties = async function(req, res){
	logger.info(`Client send request ${req.method} ${req.url}`)
	var _id = decodeURIComponent(req.params._id)
	var result = await Product.findById(_id).lean()
	if(result){
		res.status(200).send(result)
	}else{
		logger.error(`Lỗi khi thực hiện truy vấn dữ liệu một document của bảng products trong CSDL : _id = ${_id} \n` + err)
        logger.error(Error("Bị lỗi từ hệ thống"))
		res.status(500).send("Không tìm thấy dữ liệu tương ứng!")
	}
}


