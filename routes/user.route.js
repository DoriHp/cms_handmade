var express = require('express')
var router = express.Router()
var controller = require('../controller/user.controller.js')

router.post('/forgotpw', controller.forgotpw)
router.post('/register', controller.register)
router.get('/profile', controller.profile)
router.post('/change-password', controller.changepw)

module.exports = router