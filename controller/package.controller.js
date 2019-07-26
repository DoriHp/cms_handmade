require('dotenv').config()
var Package = require('../models/package.modal.js')
var graph = require('fbgraph')
var request = require('request')
var fs = require('fs')
var logger = require('../config/logger.js')

module.exports.package_image_list = async (req, res) => {
	logger.info(`Client send request ${req.method} ${req.url}`)
	var data = await Package.find().lean()
	if(!data){
		logger.error("Lỗi khi thực hiện truy vấn tới bảng vas_packages trong CSDL \n" + err)
        logger.error(Error("Bị lỗi từ hệ thống"))
        res.status(500).send("Đã có lỗi xảy ra, vui lòng thử lại sau!")
        return
	}
	var image_link = []
	data.forEach(ele => {
		image_link.push('http://' + req.headers.host + '/public/image/' + ele.image_name)			
	})
	res.status(200).render('package', {breadcrumb: [{href: '/manager/package/image' ,locate: 'Danh sách gói VAS'}], data: data, link: image_link, user: req.user})
}

module.exports.add_image = (req, res) => {
	logger.info(`Client send request ${req.method} ${req.url}`)
	var pc_code = req.params.pc_code
	if(req.file.filename){
		image_link = 'http://' + req.headers.host + '/public/image/' + req.file.filename
		res.status(200).send({filename: req.file.filename, filelink: image_link})
	}else{
		res.status(500).send('An error occured!')
	}
}

module.exports.get_image_pro = async (req, res) => {
	logger.info(`Client send request ${req.method} ${req.url}`)
	var _id = req.params._id
	var result = await Package.findById({_id})
	if(result){
		image_link = 'http://' + req.headers.host + '/public/image/' + result.image_name
		res.status(200).send({result, image_link})
	}else{
		res.status(404).end()
	}
}

module.exports.update_pk_image = async (req, res) => {
	logger.info(`Client send request ${req.method} ${req.url}`)
	var pk_code = req.params.pk_code
	var update = req.body.data
	console.log(update)
	await Package.findOne({package_code: pk_code}, function(err, result){
		if(!err && result){
			if(result.image_name && result.image_name != update.image_name){
				try{
					fs.unlinkSync(global.__basedir + '/public/upload/' + result.image_name)
					logger.info("Đã xóa file:" + result.image_name)
				}catch(eror){
					logger.error(`Lỗi khi thực hiện xóa một file hình ảnh, tên file: ${result.image_name} \n` + err)
			        logger.error(Error("Bị lỗi từ hệ thống"))
				}
			}
			result.updateOne({$set: update}, {new: true, upsert: false, useFindAndModify: false},function(err, result){
				if(err){
					logger.error(`Lỗi khi thực hiện cập nhật dữ liệu vào bảng vas_packages trong CSDL \n` + err)
		        	logger.error(Error("Bị lỗi từ hệ thống"))
					res.status(500).send("Đã có lỗi xảy ra, vui lòng thử lại sau!")
				}else{
					logger.info("Cập nhật dữ liệu thành công vào bảng vas_packages trong CSDL:" + JSON.stringify(result))
					res.status(200).send('Updated!')
				}
			})
		}
	})
}

module.exports.add_new_pk = function(req, res){
	logger.info(`Client send request ${req.method} ${req.url}`)
	var now = new Date()
	var data = req.body.data
	data.create_time = now
	data.update_time = now
	Package.findOne({package_code: data.package_code}, function(err, result){
		if(err){
			logger.error(`Lỗi khi thực hiện truy vấn dữ liệu của một document trong bảng vas_packages trong CSDL, package_code: ${package_code} \n` + err)
        	logger.error(Error("Bị lỗi từ hệ thống"))
			res.status(500).send("Đã có lỗi xảy ra, vui lòng thử lại sau!")
			return
		}
		if(result){
			logger.error(`Lỗi khi thực hiện thêm mới dữ liệu vào bảng vas_packages trong CSDL. package_code đã tồn tại`)
			res.status(500).send("Mã gói đã tồn tại, vui lòng kiểm tra lại!")
			return
		}	
		Package.insertMany(data, function(error){
			if(error){
				logger.error(`Lỗi khi thực hiện thêm dữ liệu vào bảng vas_packages trong CSDL \n` + err)
        		logger.error(Error("Bị lỗi từ hệ thống"))
				res.status(500).send("Đã có lỗi xảy ra, vui lòng thử lại sau!")
				return		
			}else{
				logger.info("Thêm mới dữ liệu thành công vào bảng vas_packages trong CSDL:" + JSON.stringify(result))
				res.status(200).send("OK")
			}
		})
	})
}

module.exports.delete = function(req, res){
	logger.info(`Client send request ${req.method} ${req.url}`)
	console.log(req.body.data)
	var arr = req.body.data.list
	var test = true
	for(let _id of arr){
		Package.findByIdAndDelete(_id, function(err, result){
			if(err){
				console.log(err)
				test = false
			}
		})
	}
	if(!test){
		logger.error(`Lỗi khi thực hiện xóa dữ liệu từ bảng vas_packages trong CSDL \n` + err)
        logger.error(Error("Bị lỗi từ hệ thống"))
		res.status(500).send("Đã có lỗi xảy ra, vui lòng thử lại sau!")
	}else{
		logger.info("Đã xóa dữ liệu từ bảng vas_packages trong CSDL")
		res.status(200).end()
	}
}