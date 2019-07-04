var express = require('express')
var router = express.Router()
var Script = require('../models/script.model.js')
var mongoose = require('mongoose')
var controller = require('../controller/script.controller.js')

router.get('/', controller.index)
router.get('/list', controller.list)
router.get('/add/:intent', controller.addScript)
router.post('/add', controller.saveNewScript)
router.get('/properties/:_id', controller.getProperties)
router.put('/update/:_id', controller.updateScript)
router.delete('/delete/:_id', controller.delScript)

module.exports = router