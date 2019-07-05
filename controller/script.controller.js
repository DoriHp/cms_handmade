var express = require('express')
var Script = require('../models/script.model.js')
var mongoose = require('mongoose')
require('dotenv').config()

module.exports.index = async (req, res) => {
	res.status(200).render('script_table', {locate: 'Danh sách mẫu tin nhắn', user: 'admin'})
}

module.exports.list = async (req, res) => {
	var result = await Script.find().lean()
	res.send(result)
}

module.exports.addScript = (req, res) => {
	var intent = req.params.intent
	if(intent == "question"){
		res.status(200)
		res.render('script_question', {intent: 'adding', locate: 'Thêm mẫu tin nhắn ', user: 'admin'})
	}else{
		res.status(200)
		res.render('script_response', {intent: 'adding', locate: 'Thêm mẫu tin nhắn ', user: req.user})
	}
}

module.exports.saveNewScript = (req, res) => {
	var data = JSON.parse(req.body.data)
	Script.insertMany(data, function(err, result){
		if(err){
			console.log(err)
			res.status(500).send("Error:" + err)
		}else{
			res.status(200).send('OK')
		}
	})
}

module.exports.getProperties = async function(req, res){

	var _id = decodeURIComponent(req.params._id)
	var result = await Script.findById(_id).lean()
	var response = JSON.stringify(result)
	if(result){
		res.cookie("info" ,response)
		if(result.type == 'question'){
			res.render('script_question', {intent: 'display', locate: 'Chi tiết mẫu tin nhắn', user: req.user})
		}else{
			res.render('script_response', {intent: 'display', locate: 'Chi tiết mẫu tin nhắn', user: req.user})
		}
	}else{
		res.status(500)
	}
}

module.exports.updateScript = function(req, res){

	console.log(req.body.data)
	var update = req.body.data
	Script.findOneAndUpdate({'_id': req.params._id}, {$set: update}, { new: true, upsert: false, useFindAndModify: false},function(err, result){
		if(err){
			console.log(err)	
			res.status(500).end()
		}else{
			res.status(200).send(result)
		}
	})
}

module.exports.delScript = function(req, res){
	
	Script.findOneAndRemove({'_id' : req.params._id}, { useFindAndModify: false }, function(err, result){
		if(err){
			console.log(err)
			res.status(500).end()
		}else{
			res.status(200).end()
		}
	})
}
