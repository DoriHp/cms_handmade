var express = require('express')
var router = express.Router()
var controller = require('../controller/manager.controller.js')
var path = require('path')

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
router.post('/feedback/update/_id', controller.update_status_feedback)

module.exports = router