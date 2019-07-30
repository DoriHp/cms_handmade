var express = require('express')
var User = require('../models/user.model.js')
var mongoose = require('mongoose')
require('dotenv').config()
var bcrypt = require('bcrypt')
const saltRounds = 10
var generator = require('generate-password')	
var fs = require('fs')
var logger = require('../config/logger.js')
var Config = require('../models/config.model.js')
var Notify = require('../models/notify.model.js')

module.exports.forgotpw = async function(req, res){
	logger.info(`Client send request ${req.method} ${req.url}`)
	var config = await Config.find().lean()
	console.log(config)
	var password = bcrypt.hashSync(config[0].defaultPassword, saltRounds)
	User.findOneAndUpdate({username: req.body.data}, {$set: {password: password}}, {new: true, upsert: false, useFindAndModify: false}, function(err, user){
		if(err){
			logger.error(`Lỗi khi thực hiện cập nhật dữ liệu vào bảng users trong CSDL \n` + err)
		    logger.error(Error("Bị lỗi từ hệ thống"))
			res.status(500).send("Đã có lỗi xảy ra, vui lòng thử lại sau!")
		}else{
			logger.info("Cập nhật dữ liệu thành công vào bảng tickets trong CSDL:" + JSON.stringify(user))
			res.status(200).send(config[0].defaultPassword)
		}
	})
}

module.exports.register = async function(req, res){
	logger.info(`Client send request ${req.method} ${req.url}`)
	var username = req.body.data.username
	User.findOne({username: username}, function(err, result){
		if(result){
			logger.warn("Người dùng đăng kí mới sử dụng tên đăng nhập đã tồn tại:" + username)
			res.status(500).send("Tên đăng nhập đã tồn tại, vui lòng chọn tên khác!")
			return
		}else{
			var save = req.body.data
			console.log(save)
			save.password = bcrypt.hashSync(req.body.data.password, saltRounds)
			User.insertMany(save, function(err, result){
				if(err){
					logger.error(`Lỗi khi thực hiện thêm dữ liệu vào bảng users trong CSDL \n` + err)
	        		logger.error(Error("Bị lỗi từ hệ thống"))
					res.status(500).send("Đã có lỗi xảy ra, vui lòng thử lại sau!")
				}else{
					logger.info("Thêm mới dữ liệu thành công vào bảng users trong CSDL:" + JSON.stringify(result))
					res.status(200).end()
				}
			})
		}
	})
}

module.exports.profile = async function (req, res) {
	var config = await Config.find().lean()
	logger.info(`Client send request ${req.method} ${req.url}`)
	res.status(200).render('user_profile', {breadcrumb: [{href: '/user/profile', locate: "Hồ sơ người dùng"}], user: req.user, config: config[0] })
}
//người dùng đổi mật khẩu
module.exports.changepw = function(req, res){
	logger.info(`Client send request ${req.method} ${req.url}`)
	var username = req.user.username
	var password = req.body.data.oldPW
	bcrypt.compare(password, req.user.password, function(err, result){
		if(err){
			logger.error("Lỗi của hàm bcrypt")
			logger.error(Error("Bị lỗi từ hệ thống"))
			res.status(500).end("Đã có lỗi xảy ra, vui lòng thử lại sau!")
			return
		}
		if(!result){
			res.status(500).send("Mật khẩu hiện tại không đúng!")
			return
		}
		var newPassword = bcrypt.hashSync(req.body.data.newPW, saltRounds)
		User.findOneAndUpdate({username: username}, {$set:{password: newPassword}}, {new: true, upsert: false, useFindAndModify: false},function(error, user){
			if(error){
				logger.error(`Lỗi khi thực hiện cập nhật dữ liệu vào bảng users trong CSDL \n` + err)
		    	logger.error(Error("Bị lỗi từ hệ thống"))
				res.status(500).send("Đã có lỗi xảy ra, vui lòng thử lại sau!")
				return
			}else{
				logger.info("Cập nhật dữ liệu thành công vào bảng users trong CSDL:" + JSON.stringify(result))
				res.status(200).send("OK")
			}
		})
	})
}
//tải thông báo cho người dùng
module.exports.notify = async function(req, res){
	logger.info(`Client send request ${req.method} ${req.url}`)
	var user = req.user
	var username = user.username
	//Trả về các notification dựa theo người dùng
	var result = await Notify.find({username: username}).sort([['time', -1]]).lean()
	if(result){
		res.status(200).send(result)
		return
	}else{
		logger.error(`Lỗi khi thực hiện truy vấn dữ liệu trong bảng notifications trong CSDL \n` + err)
    	logger.error(Error("Bị lỗi từ hệ thống"))
    	res.status(500).send("Đã có lỗi xảy ra, vui lòng thử lại sau!")
		return		
	}
}

module.exports.config = function(req, res){
	var update = req.body.data
	logger.info(update)
	var _id = '5d3a469e51aa6a10dcf330a1'
	Config.findByIdAndUpdate(_id, {$set: update}, {new: true, upsert: false, useFindAndModify: false}, function(err, result){

			if(err){
				res.status(500).send("Đã có lỗi xảy ra, vui lòng thử lại sau!")
			}else{
				logger.info(result)
				res.status(200).end()
			}
		})
}