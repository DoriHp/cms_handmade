var express = require('express')
var User = require('../models/user.model.js')
var mongoose = require('mongoose')
require('dotenv').config()

module.exports.register = function(req, res){
	res.status(200).send('Ok')
}