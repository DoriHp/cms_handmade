require('dotenv').config()
var Member = require('../models/member.modal.js')
var graph = require('fbgraph')
var request = require('request')
var fs = require('fs')
var client = require('./redis.client.js')

module.exports.member = async function(req, res){
	res.status(200).render('member_table', {breadcrumb: [{href:'/manager/member', locate: 'Danh sách điểm bán'}], user:req.user})
}

module.exports.list = async function(req, res){
	var start = process.hrtime()
	console.log('start:')
	console.log(start)
	var result = await Member.find({}, ['member_code', 'otp', 'fb_firstName', 'fb_lastName', 'fb_gender', 'fb_linkChat', 'auto_reply']).lean()
	var end = process.hrtime(start)
    console.log("end:")
    console.log(end)
    if(result) res.status(200).send(result)
}

module.exports.add = function(req, res){
	var crypto = require('crypto');

	function randomValueHex(len) {
		return crypto
		  .randomBytes(Math.ceil(len / 2))
		  .toString('hex') // convert to hexadecimal format
		  .slice(0, len) // return required number of characters
	}


	var otp = randomValueHex(6)
	var now = new Date().toISOString()
	var new_member = {
		member_code: req.body.data.member_code,
		otp: otp,
		auto_reply: false,
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
			console.log(err)
			res.status(500).send("Đã có lỗi xảy ra, vui lòng thử lại sau!")
		}else{
			res.status(200).end()
		}
	})
}

module.exports.delete = function(req, res){
	var member_code = req.params.member_code
	console.log(member_code)
	Member.findOneAndDelete({member_code: member_code}, function(err, result){
		if(err){
			res.status(500).send("Đã có lỗi xảy ra, vui lòng thử lại sau!")
		}else{
			res.status(200).end()
		}
	})
}

function generateId(){
	var result           = ''
	var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
	var charactersLength = characters.length
	for ( var i = 0; i < 10; i++ ) {
	  result += characters.charAt(Math.floor(Math.random() * charactersLength))
	}
	return result
}

function loop_add(){
	console.log("Start inserting...")
	var now = new Date()
	var index = 22000
	for (var i = 0; i < 22000; i++) {
	    (
	        function(index) {

	        	var new_member = {
	        		member_code: generateId(),
					otp: "222222",
					auto_reply: false,
					fb_id: index,
					fb_firstName: "This is",
					fb_lastName: "me",
					fb_gender: "men",
					fb_linkChat: "https://google.com",
					lastTimeQueryVAS: now.toISOString(),
					create_time: now.toISOString(),
					update_time: now.toISOString()
	        	}
	            
	            Member.insertMany(new_member ,function(err, result){
	            	if(err) throw err
	            })

	        }
	    )(i)
	}
}






