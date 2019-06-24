var express = require('express')
var router = express.Router()
var controller = require('../controller/user.controller.js')

router.post('/forgotpw', controller.forgotpw)
router.post('/register', controller.register)

module.exports = router