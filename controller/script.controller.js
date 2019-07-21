var express = require('express')
var Script = require('../models/script.model.js')
var mongoose = require('mongoose')
require('dotenv').config()

module.exports.index = async (req, res) => {
	res.status(200).render('script_table', {breadcrumb: [{href:'/script',locate: 'Danh sách mẫu tin nhắn'}], user: {username: 'Bảo'}})
}

module.exports.list = async (req, res) => {
	var result = await Script.find().lean()
	res.send(result)
}

module.exports.addScript = (req, res) => {
	var intent = req.params.intent
	if(intent == "question"){
		res.status(200)
		res.render('script_question', {intent: 'adding', breadcrumb:[{href:'/script/adding/question', locate: 'Thêm mẫu tin nhắn - khảo sát'}], user: {username: 'Bao'}})
	}else{
		res.status(200)
		res.render('script_response', {intent: 'adding', breadcrumb:[{href:'/script/adding/question', locate: 'Thêm mẫu tin nhắn - phản hồi'}], user: {username: 'Bao'}})
	}
}

module.exports.saveNewScript = (req, res) => {
	var data = JSON.parse(req.body.data)
	Script.findOne({id: data.id}, function(error, result){
		if(error){
			res.status(500).send("Đã có lỗi xảy ra, vui lòng thử lại sau!")
			return
		}
		if(result){
			res.status(500).send("ID của mẫu tin nhắn đã tồn tại, vui lòng lựa chọn ID khác!")
			return
		}
		Script.insertMany(data, function(err){
			if(err){
				console.log(err)
				res.status(500).send("Đã có lỗi xảy ra, vui lòng thử lại sau!")
			}else{
				res.status(200).send('OK')
			}
		})
	})
}

module.exports.getProperties = async function(req, res){

	var _id = decodeURIComponent(req.params._id)
	var result = await Script.findById(_id).lean()
	var response = JSON.stringify(result)
	if(result){
		res.cookie("info" ,response)
		if(result.type == 'question'){
			res.render('script_question', {intent: 'display', breadcrumb:[{href:`/script/properties/${_id}`, locate: 'Chi tiết mẫu tin nhắn'}], user:{username: 'Bao'}})
		}else{
			res.render('script_response', {intent: 'display', locate: 'Chi tiết mẫu tin nhắn', user: {username: 'Bao'}})
		}
	}else{
		res.status(500).send("Đã có lỗi xảy ra, vui lòng thử lại sau!")
	}
}

module.exports.updateScript = function(req, res){

	console.log(req.body.data)
	var update = req.body.data
	Script.findOneAndUpdate({'_id': req.params._id}, {$set: update}, { new: true, upsert: false, useFindAndModify: false},function(err, result){
		if(err){
			console.log(err)	
			res.status(500).end("Đã có lỗi xảy ra, vui lòng thử lại sau!")
		}else{
			res.status(200).send(result)
		}
	})
}

module.exports.delScript = function(req, res){
	
	Script.findOneAndRemove({'_id' : req.params._id}, { useFindAndModify: false }, function(err, result){
		if(err){
			console.log(err)
			res.status(500).end("Đã có lỗi xảy ra, vui lòng thử lại sau!")
		}else{
			res.status(200).end()
		}
	})
}
