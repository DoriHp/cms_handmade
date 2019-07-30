var Ticket = require('../models/ticket.model.js')
var Tk_history = require('../models/ticket_history.model.js')
var User = require('../models/user.model.js')
var dateFormat = require('dateformat')
var Notify = require('../models/notify.model.js')
var request = require('request')
var logger = require('../config/logger.js')

var values_array = [{vi: 'mới', en: 'new'}, {vi: 'đã giao', en: 'assigned'}, {vi: 'đã nhận', en: 'recieved'}, {vi: 'đã xử lý', en: 'resolved'}, {vi: 'đã đóng', en: 'closed'}, {vi: 'cao', en: 'high'}, {vi: 'bình thường', en: 'normal'}]
var fields_array = [{vi: 'trạng thái ticket sang', en: 'status'}, {vi: 'chỉ định người được giao ticket là', en: 'assignee'}, 
{vi: 'độ ưu tiên của ticket thành', en: 'priority'}]

function exec_time(time){
	var days = ['Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy', 'Chủ nhật']
	var day = days[time.getDay() - 1]
	var month = (time.getMonth() < 10)?"0" + (time.getMonth() + 1):(time.getMonth() + 1)
	var date = (time.getDate() < 10)?"0" + time.getDate():time.getDate()
	var year = time.getFullYear()
	var hour = (time.getHours() < 10)?"0" + time.getHours():time.getHours()
	var min = (time.getMinutes() < 10)?"0" + time.getMinutes():time.getMinutes()
    var str = `${day} ${date}/${month}/${year} ${hour}:${min}`
    return str
}

module.exports.ticket = async function(req, res){
	logger.info(`Client send request ${req.method} ${req.url}`)
	var result = await Ticket.find({}, ['id', 'type', 'assignee', 'update_time', 'status', 'priority', 'member_profile'])
	if(!result){
		logger.error("Lỗi khi thực hiện truy vấn tới bảng tickets trong CSDL \n" + err)
        logger.error(Error("Bị lỗi từ hệ thống"))
        res.status(500).send("Đã có lỗi xảy ra, vui lòng thử lại sau!")
        return
	}
	var array = ['new', 'assigned', 'recieved', 'resolved', 'closed']
	var array2 = ['Mới', 'Đã gán', 'Đã nhận', 'Đã xử lý', 'Đã đóng']
	for(let i of result){
		i.update_time_string = (i.update_time)?exec_time(i.update_time):""
		i.data_sort = array.indexOf(i.status)
		i.status_string = array2[i.data_sort]
		if(i.assignee) i.assignee_string = await join_to_name(i.assignee)
	}
	if(result){
		res.render('ticket_table', {breadcrumb: [{href:'/manager/ticket', locate: 'Quản lý ticket'}], user: req.user, tickets: result})
	}
}

function customFilter(object){
	for(let i of object.feedbacks){
		if(i.attachments && i.attachments[0].type == 'file'){
	        var path = require('path')
	        , url = require('url')
	        , URL_TO_REQUEST = i.attachments[0].payload.url
	        , uri = url.parse(URL_TO_REQUEST)
	        , filename = path.basename(uri.path)

	        request(URL_TO_REQUEST, function(error, response, body){
	        	if(error){
	        		console.log(error)
	        		return null
	        	}
	            var result = decodeURIComponent(filename)
	            var reg = /^([\Da-zA-Z0-9]+)\?_nc_cat/g
	            i.attachments[0].payload.url = reg.exec(result)[1]
         	})
		}
	}
}

module.exports.tk_content = async function(req, res){
	logger.info(`Client send request ${req.method} ${req.url}`)
	var ticket = await Ticket.findOne({id: req.params.id}).lean()
 	if(!ticket){
 		logger.error(`Lỗi khi thực hiện truy vấn dữ liệu một document của bảng tickets trong CSDL : _id = ${_id} \n` + err)
        logger.error(Error("Bị lỗi từ hệ thống"))
		res.status(500).send("Có lỗi xảy ra khi tải nội dung ticket, vui lòng thử lại sau!")
	}else{
		customFilter(ticket.description)
		setTimeout(function(){
			res.status(200).send(ticket)
		}, 1000)
	}
}

module.exports.tk_properties = async function(req, res){
	logger.info(`Client send request ${req.method} ${req.url}`)
	var ticket_id = parseInt(req.params.id)
	var users = await User.find({}, ['username', 'name', 'role']).lean()
	var history = await Tk_history.find({ticket_id: ticket_id}).lean().sort({update_time: 1})
	if(history){
		for(let i of history){
			i.update_time_string = exec_time(i.update_time)
			for(let j of i.change_description.content){
				j.field_string = fields_array.find(x => x.en == j.field).vi
				if(j.field != 'assignee'){
					j.value_string = values_array.find(x => x.en == j.value).vi
				}else{
					j.value_string = await join_to_name(j.value)
				}
			}
			i.update_by_string = await join_to_name(i.update_by)
		}
	}
	Ticket.findOne({id: ticket_id}, async function(err, ticket){

		if(!ticket){
			logger.error(`Lỗi khi thực hiện truy vấn dữ liệu một document của bảng district trong CSDL : _id = ${_id} \n` + err)
        	logger.error(Error("Dữ liệu không tồn tại"))
			res.status(404).redirect('/404')
			return
		}else{
			await Notify.findOneAndUpdate({username: req.user.username, status: false, ticket_id: ticket_id}, {$set:{status: true}},  {new: true, upsert: false, useFindAndModify: false}, function(err, result){
				if(err){
					console.error(err)
				}else{
					logger.info("Updated notification!")
				}
			})
			if(req.user.role == 'user' && req.user.username != ticket.assignee){
				res.redirect('/403')
				return				
			}

			if(req.user.username == ticket.assignee && ticket.status == 'assigned'){
			    await ticket.updateOne({
					status: 'recieved'
				}, function(err, result){
					if(err){
						logger.error(`Lỗi khi thực hiện cập nhật dữ liệu vào bảng tickets trong CSDL \n` + err)
		        		logger.error(Error("Bị lỗi từ hệ thống"))
					}else{
						console.log("Updated this ticket's status to recieved...")
						logger.info("Cập nhật dữ liệu thành công vào bảng tickets trong CSDL:" + JSON.stringify(result))
					}
				})
			}
			Ticket.findOne({id: ticket_id}, async function(error, result){
				result.update_time_string = (result.update_time)?exec_time(result.update_time):""
				result.create_time_string = (result.create_time)?exec_time(result.create_time):""
				result.finish_time_string = (result.finish_time)?exec_time(result.finish_time):""
				result.status_num = values_array.findIndex(x => x.en == result.status)
				if(result.assignee){
					result.assignee_string = await join_to_name(result.assignee)
				}
				if(result.update_by){
					result.update_by_string = await join_to_name(result.update_by)
				}
				res.status(200).render('ticket_properties', {breadcrumb: [{href: `/manager/ticket/read/${ticket_id}`, locate: 'Chi tiết ticket'}], ticket: result, history: history ,user: req.user, users: users})
			})
		}
	})
}

async function join_to_name(username){
	var result = await User.findOne({username: username})
	return result.name
}

module.exports.tk_update = function(req, res){
	logger.info(`Client send request ${req.method} ${req.url}`)
	var update = req.body.data
	update.update_time = new Date().toISOString()
	update.update_by = req.user.username
	if(update.status == 'closed') update.finish_time = new Date().toISOString()
	if(!update.comment || update.comment == ""){
		delete update['comment']
	}
	Ticket.findOneAndUpdate({id: req.params.id}, {$set: update}, {new: true, upsert: false, useFindAndModify: false}, function(err, result){
		if(err){
			logger.error(`Lỗi khi thực hiện cập nhật dữ liệu vào bảng tickets trong CSDL \n` + err)
		    logger.error(Error("Bị lỗi từ hệ thống"))
			res.status(500).send('An error occured!')
		}else{
			var now = new Date()
			var content = []
			var fields = Object.keys(update)
			var values = []
			for(let i of fields){
				values.push(result[i])
			}
			for(let i in fields){
				if(['comment', 'update_time', 'update_by', 'finish_time'].indexOf(fields[i]) == -1)
				content.push({field: fields[i], value: values[i]})
			}
			Tk_history.insertMany({
				ticket_id: req.params.id,
				update_time: now.toISOString(),
				update_by: req.user.username,
				change_description: {
					content: content,
					comment: req.body.data.comment
				}
			}, function(err, result){
				if(err){
					logger.error(`Lỗi khi thực hiện cập nhật dữ liệu vào bảng ticket_history trong CSDL \n` + err)
		        	logger.error(Error("Bị lỗi từ hệ thống"))
					return
				}else{
					logger.info("Cập nhật dữ liệu thành công vào bảng ticket_history trong CSDL:" + JSON.stringify(result))
				}
			})
			logger.info("Cập nhật dữ liệu thành công vào bảng tickets trong CSDL:" + JSON.stringify(result))
			res.status(200).send('Update successfully')
		}
	})
}

module.exports.tk_delete = function(req, res){
	logger.info(`Client send request ${req.method} ${req.url}`)
	var array = req.body.data
	Ticket.deleteMany({ id: { $in: array}}, function(err) {

		if(err){
			logger.error(`Lỗi khi thực hiện xóa dữ liệu từ bảng tickets trong CSDL \n` + err)
	        logger.error(Error("Bị lỗi từ hệ thống"))
			res.status(500).send("Đã có lỗi xảy ra, vui lòng thử lại sau!")
		}else{
			logger.info("Đã xóa dữ liệu từ bảng tickets trong CSDL")
			res.status(200).end()
		}
	})
}