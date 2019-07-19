var express = require('express')
var router = express.Router()
var controller = require('../controller/manager.controller.js')
var path = require('path')
var controller2 = require('../controller/package.controller.js')
var controller3 = require('../controller/member.controller.js')
var multer = require('multer')
var path = require('path')
var crypto = require('crypto')
var storage = multer.diskStorage({
	destination: './public/upload',
	filename: function(req, file, cb) {
  		Date.prototype.yyyymmdd = function() {
			var mm = this.getMonth() + 1 // getMonth() is zero-based
			var dd = this.getDate()
			var min = this.getMinutes()
			var hour = this.getHours()
			var sec = this.getSeconds()

			return [this.getFullYear(),
				(mm>9 ? '' : '0') + mm,
				(dd>9 ? '' : '0') + dd,
				'_',`${hour}${min}${sec}`
			].join('')
		}

		var now = new Date()
	  	cb(null, 'image' + now.yyyymmdd() + path.extname(file.originalname))
  	}
})
function isAdmin(req, res, next) {
	if (req.isAuthenticated() && req.user.role == 'admin') {
		next()
}}

var upload = multer({ storage: storage })

//Product management route
router.get('/product', controller.product)
router.get('/product/list', controller.pd_list)
router.post('/product/adding', controller.pd_adding)
router.post('/product/update/:_id', controller.pd_update)
router.get('/product/properties/:_id', controller.pd_properties)
router.delete('/product/delete/:_id', controller.pd_delete)
//Province management route
router.get('/province', controller.province)
router.get('/province/list', controller.pv_list)
router.get('/province/properties/:_id', controller.pv_properties)
router.post('/province/adding', controller.pv_adding)
router.delete('/province/delete/:_id', controller.pv_delete)
router.post('/province/update/:_id', controller.pv_update)
router.get('/province/districtlist/:_id', controller.pv_dt)
//District management route
router.get('/district', controller.district)
router.get('/district/list', controller.dt_list)
router.post('/district/adding', controller.dt_adding)
router.get('/district/properties/:_id', controller.dt_properties)
router.delete('/district/delete/:_id', controller.dt_delete)
router.post('/province/update/:_id', controller.dt_update)
//Feedback management route
router.get('/feedback', controller.feedback)
router.get('/feedback/list/:filter', controller.feedback_list)
router.get('/feedback/read/:_id', controller.get_feedback_content)
router.get('/feedback/user_info/:_id', controller.get_user_info)
router.get('/feedback/user_link/:fb_id', controller.get_user_link)
router.post('/feedback/user_info/:fb_id', controller.update_status_member)
router.post('/feedback/update/:_id', controller.update_status_feedback)
//Package management route
router.get('/package/image', controller2.package_image_list)
router.post('/package/image/upload/:pc_code', upload.single('package_image'), controller2.add_image)
router.get('/package/image/properties/:_id', controller2.get_image_pro)
router.post('/package/image/update/:pk_code', controller2.update_pk_image)
router.post('/package/add-new', controller2.add_new_pk)
// Member management route
router.get('/member', controller3.member)
router.get('/member/list', controller3.list)
router.post('/member/add', controller3.add)
module.exports = router