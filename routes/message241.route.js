var express = require('express')
var router = express.Router()
var controller = require('../controller/broadcast.controller.js')
var path = require('path')
var crypto = require('crypto')
var multer = require('multer')
var storage = multer.diskStorage({
  destination: './public/upload',
  filename: function (req, file, cb) {
    crypto.pseudoRandomBytes(16, function (err, raw) {
      if (err) return cb(err)

      cb(null, raw.toString('hex') + path.extname(file.originalname))
    })
  }
})

var upload = multer({ storage: storage })

router.get('/broadcast', controller.sendBroadcastForm)
router.post('/broadcast', controller.execBroadcast)
router.post('/upload', upload.single('image'), controller.execUpload)

module.exports = router