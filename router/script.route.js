var express = require('express')
var router = express.Router()
var controller = require('../controller/script.controller.js')
var cookieParser = require('cookie-parser')
router.use(cookieParser())

router.get('/', controller.index)



module.exports = router
