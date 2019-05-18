var express = require('express')
var router = express.Router()
var controller = require('../controller/script.controller.js')
var cookieParser = require('cookie-parser')
//router.use(cookieParser())

router.get('/', controller.index)

router.get('/add/:intent', controller.addScript)

router.post('/add', controller.saveNewScript)

router.get('/properties/:id', controller.getProperties)

module.exports = router
