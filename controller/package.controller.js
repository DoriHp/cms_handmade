require('dotenv').config()
var Package = require('../models/package.modal.js')
var graph = require('fbgraph')
var request = require('request')
var fs = require('fs')

module.exports.package_image_list = async (req, res) => {
	var data = await Package.find().lean()
	var image_link = []
	data.forEach(ele => {
		image_link.push('http://' + req.headers.host + '/public/image/' + ele.image_name)			
	})
	res.status(200).render('package', {breadcrumb: [{href: '/manager/package/image' ,locate: 'Hình ảnh mô tả VAS'}], data: data, link: image_link, user: req.user})
}

module.exports.add_image = (req, res) => {
	var pc_code = req.params.pc_code
	if(req.file.filename){
		image_link = 'http://' + req.headers.host + '/public/image/' + req.file.filename
		res.status(200).send({filename: req.file.filename, filelink: image_link})
	}else{
		res.status(500).send('An error occured!')
	}
}

module.exports.get_image_pro = async (req, res) => {
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
	var pk_code = req.params.pk_code
	var update = req.body.data
	await Package.findOne({package_code: pk_code}, function(err, result){
		if(!err && result){
			if(result.image_name && result.image_name != update.image_name){
				try{
					fs.unlinkSync(global.__basedir + '/public/upload/' + result.image_name)
					console.log('Deleted old file!')
				}catch(eror){
					console.log(eror)
					res.status(500).end()
				}
			}
			result.update(update, function(err){
				if(err){
					res.status(500).end()
				}else{
					res.status(200).send('Updated!')
				}
			})
		}
	})
}

module.exports.add_new_pk = function(req, res){
	var now = new Date()
	var data = req.body.data
	data.create_time = now
	data.update_time = now
	Package.findOne({package_code: data.package_code}, function(err, result){
		if(err){
			res.status(500).send("Đã có lỗi xảy ra, vui lòng thử lại sau!")
			return
		}
		if(result){
			res.status(500).send("Mã gói đã tồn tại, vui lòng kiểm tra lại!")
			return
		}	
		Package.insertMany(data, function(error){
			if(error){
				res.status(500).send("Đã có lỗi xảy ra, vui lòng thử lại sau!")
				return		
			}else{
				res.status(200).send("OK")
			}
		})
	})
}