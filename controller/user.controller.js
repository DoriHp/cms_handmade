var express = require('express')
var User = require('../models/user.model.js')
var mongoose = require('mongoose')
require('dotenv').config()
var bcrypt = require('bcrypt')
const saltRounds = 10
var nodemailer = require('nodemailer')
var generator = require('generate-password')	
var fs = require('fs')
var tokens = JSON.parse(fs.readFileSync('token.json'))
var credentials = JSON.parse(fs.readFileSync('credentials.json'))
const transporter = nodemailer.createTransport({
    service: 'Gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
        type: 'OAuth2',
        user: process.env.EMAIL,
        pass: process.env.EMAILPW,
        clientId: credentials.installed.client_id.toString(),
        clientSecret: credentials.installed.client_secret.toString(),
        refreshToken: tokens.refresh_token.toString(),
        accessToken: tokens.access_token.toString(),
        expires: tokens.expiry_date
    }
})
var Notify = require('../models/notify.model.js')

module.exports.forgotpw = function(req, res){
	var str = generator.generate({
    	length: 10,
    	numbers: true,
    	symbols: true
	})
	var password = bcrypt.hashSync(str, saltRounds)
	var mailOptions = {
	  from: process.env.EMAIL,
	  to: req.body.email,
	  subject: 'New passsword',
	  text: 'Here is new password for you: ' + password
	}
	transporter.sendMail(mailOptions, function(error, info){
		if (error) {
			console.log(error)
			req.flash('error', 'Đã có lỗi xảy ra, vui lòng thử lại sau!')
			res.status(500).redirect('../../login')
		} else {
			User.findOneAndUpdate({email: req.body.email}, {$set: {password: password}}, {upsert: false}, function(err, user){
				if(err){
					req.flash('error', 'Đã có lỗi xảy ra, vui lòng thử lại sau!')
					res.status(500).redirect('../../login')
				}else{
					res.status(200).redirect('../../login')
				}
			})
		}
	})
}

module.exports.register = async function(req, res){
	var username = req.body.username
	console.log(username)
	User.findOne({username: username}, function(err, result){
		if(result){
			req.flash('error', 'Tên đăng nhập đã tồn tại! Hãy chọn tên khác!')
			res.status(500).redirect('../../login')
		}else{
			var password = bcrypt.hashSync(req.body.password, saltRounds)
			User.insertMany({
				name: req.body.fullname,
				username: req.body.username,
				password: password,
				page_token: '',
				email: req.body.email,
				role: 'admin'
			}, function(err, result){
				if(err){
					req.flash('error', 'Đã có lỗi xảy ra, vui lòng thử lại sau!')
					res.status(500).redirect('../../login')
				}else{
					req.flash('error', 'Tạo tài khoản thành công! Sử dụng tài khoản vừa tạo để đăng nhập!')
					res.status(200).redirect('../')
				}
			})
		}
	})
}

module.exports.profile = async function (req, res) {
	res.status(200).render('user_profile', {breadcrumb: [{href: '/user/profile', locate: "Hồ sơ người dùng"}], user: req.user})
}

module.exports.changepw = function(req, res){
	var username = req.user.username
	var password = req.body.data.oldPW
	bcrypt.compare(password, req.user.password, function(err, result){
		if(err){
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
				res.status(500).send("Đã có lỗi xảy ra, vui lòng thử lại sau!")
				return
			}else{
				res.status(200).send("OK")
			}
		})
	})
}

module.exports.notify = async function(req, res){
	var user = req.user
	//Trả về các notification dựa theo người dùng
	if(user.role == 'admin' || user.role == 'supervisor'){
		var result = await Notify.find({username: 'admin', status: false}).lean()
		if(result){
			res.status(200).send(result)
			return
		}
	}
	if(user.role == 'user'){
		var result = await Notify.find({username: user.username, status: false}).lean()
		if(result){
			res.status(200).send(result)
			return
		}
	}
}