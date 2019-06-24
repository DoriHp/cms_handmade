var express = require('express')
var User = require('../models/user.model.js')
var mongoose = require('mongoose')
require('dotenv').config()
var bcrypt = require('bcrypt')
const saltRounds = 10
var nodemailer = require('nodemailer')
var generator = require('generate-password')

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
        type: 'OAuth2',
        user: 'your_gmail',
        clientId: credentials.installed.client_id.toString(),
        clientSecret: credentials.installed.client_secret.toString(),
        refreshToken: tokens.refresh_token.toString(),
        accessToken: tokens.access_token.toString(),
        expires: tokens.expiry_date,
    }
})

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
	  text: 'Here is new password for you:' + password
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

module.exports.register = function(req, res){
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
			res.status(500).send('An error occured!')
		}else{
			res.status(200).redirect('../')
		}
	})
}