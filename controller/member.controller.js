require('dotenv').config()
var Member = require('../models/member.modal.js')
var graph = require('fbgraph')
var request = require('request')
var fs = require('fs')
var client = require('./redis.client.js')
var logger = require('../config/logger.js')

module.exports.member = async function(req, res){
	logger.info(`Client send request ${req.method} ${req.url}`)
	res.status(200).render('member_table', {breadcrumb: [{href:'/manager/member', locate: 'Danh sách điểm bán'}], user:req.user})
}

module.exports.list = async function(req, res){
	logger.info(`Client send request ${req.method} ${req.url}`)
	var start = process.hrtime()
	console.log('start:')
	console.log(start)
	var result = await Member.find({}, ['member_code', 'otp', 'fb_firstName', 'fb_lastName', 'fb_gender', 'fb_linkChat', 'auto_reply']).lean()
	var end = process.hrtime(start)
    console.log("end:")
    console.log(end)
    if(result){
    	res.status(200).send(result)
    }else{
		logger.error("Lỗi khi thực hiện truy vấn tới bảng districts trong CSDL \n" + err)
        logger.error(Error("Bị lỗi từ hệ thống"))
        res.status(500).send("Đã có lỗi xảy ra, vui lòng thử lại sau!")
        return
    }
}

module.exports.add = async function(req, res){
	logger.info(`Client send request ${req.method} ${req.url}`)
	var crypto = require('crypto');

	function randomValueHex(len) {
		return crypto
		  .randomBytes(Math.ceil(len / 2))
		  .toString('hex') // convert to hexadecimal format
		  .slice(0, len) // return required number of characters
	}

	var otp
	var otps = await Member.find({}, ['otp'])
	while(!otp || otps.indexOf(otp) != -1){
		otp = randomValueHex(6)
	}
	logger.info("Genarate new otp successfully!")
	var now = new Date().toISOString()
	var new_member = {
		member_code: req.body.data.member_code,
		otp: otp,
		auto_reply: true,
		fb_id: "",
		fb_firstName: "",
		fb_lastName: "",
		fb_gender: "",
		fb_linkChat: "",
		lastTimeQueryVAS: now,
		create_time: now,
		update_time: now
	}
	Member.insertMany(new_member, function(err, result){
		if(err){
			logger.error(`Lỗi khi thực hiện thêm dữ liệu vào bảng members trong CSDL \n` + err)
        	logger.error(Error("Bị lỗi từ hệ thống"))
			res.status(500).send("Đã có lỗi xảy ra, vui lòng thử lại sau!")
		}else{
			logger.info("Thêm mới dữ liệu thành công vào bảng members trong CSDL:" + JSON.stringify(result))
			res.status(200).send(otp)
		}
	})
}

module.exports.delete = function(req, res){
	logger.info(`Client send request ${req.method} ${req.url}`)
	var member_code = req.params.member_code
	console.log(member_code)
	Member.findOneAndDelete({member_code: member_code}, function(err, result){
		if(err){
			logger.error(`Lỗi khi thực hiện xóa dữ liệu từ bảng members trong CSDL \n` + err)
        	logger.error(Error("Bị lỗi từ hệ thống"))
			res.status(500).send('An error occured!')
		}else{
			logger.info("Đã xóa dữ liệu từ bảng members trong CSDL:" + JSON.stringify(result))
			res.status(200).end()
		}
	})
}







