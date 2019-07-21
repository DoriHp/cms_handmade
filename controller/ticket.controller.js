var Ticket = require('../models/ticket.model.js')
var Tk_history = require('../models/ticket_history.model.js')
var User = require('../models/user.model.js')

module.exports.create = function(){
	var piority = [0, 1, 2]
	var now = new Date()
	var pri_arr = ["high", "normal"]
	var assignee = ["supervisor", "user1", "user2", ""]
	var type_arr = ["feedback", "asking_for_information"]
	var sta_arr = ["new", "assigned", "recieve", "resolve", "closed"]
	function loop_add(){
		console.log("Start inserting...")
		var now = new Date()
		var index = 20
		for (var i = 0; i < 20; i++) {
		    (
		        function(index) {

		        	var new_ticket = {
		        		id: i,
		        		status: sta_arr[Math.floor(Math.random() * sta_arr.length)],
	                    type: type_arr[Math.floor(Math.random() * type_arr.length)],
	                    priority: pri_arr[Math.floor(Math.random() * pri_arr.length)],
	                    assignee: assignee[Math.floor(Math.random() * assignee.length)],
	                    member_profile: {
	                        fb_id: "2137451023011934",
	                        member_code: "0fffassss",
	                        fb_linkChat: "https://google.com"
	                    },
	                    comment: generateId(),
	                    update_by: this.assignee,
	                    create_time: now.toISOString(),
	                    update_time: now.toISOString(),
	                    finish_time: now.toISOString()
		        	}
		            
		            Ticket.insertMany(new_ticket ,function(err, result){
		            	if(err) throw err
		            })

		        }
		    )(i)
		}
	}

	function generateId(){
		var result           = ''
		var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
		var charactersLength = characters.length
		for ( var i = 0; i < 20; i++ ) {
		  result += characters.charAt(Math.floor(Math.random() * charactersLength))
		}
		return result
	}

	loop_add()
}

module.exports.ticket = async function(req, res){
	var result = await Ticket.find({}, ['id', 'update_time', 'status', 'priority'])
	if(result){
		res.render('ticket_table', {breadcrumb: [{href:'/manager/ticket', locate: 'Quản lý ticket'}], user: {username: "Bảo"}, tickets: result})
	}
}

module.exports.tk_properties = async function(req, res){

	var ticket_id = parseInt(req.params.id)
	var users = await User.find({}, ['username', 'role']).lean()
	var history = await Tk_history.find({ticket_id: ticket_id}).lean().sort({update_time: -1})
	console.log(history)
	Ticket.findOne({id: ticket_id}, function(err, ticket){

		if(!ticket){
			res.status(404).redirect('/404')
		}else{
			if(req.user.username == ticket.assignee && ticket.status == 'assigned'){
				ticket.update({
					status: 'recieved'
				}, function(err, result){
					if(!err){
						console.log("Update this ticket's status to recieved...")
						res.status(200).render('ticket_properties', {breadcrumb: [{href: `/manager/ticket/read/${ticket_id}`, locate: 'Chi tiết ticket'}], user: {username: 'Bảo', role: 'admin'}, ticket: ticket, history: history ,users: users})
						return
					}
				})
			}
			res.status(200).render('ticket_properties', {breadcrumb: [{href: `/manager/ticket/read/${ticket_id}`, locate: 'Chi tiết ticket'}], user: {username: 'Bảo', role: 'admin'}, ticket: ticket, history: history ,users: users})
		}
	})
}

module.exports.tk_update = function(req, res){

	var update = req.body.data
	if(!update.comment || update.comment == ""){
		delete update['comment']
	}
	Ticket.findOneAndUpdate({id: req.params.id}, {$set: update}, {new: true, upsert: false, useFindAndModify: false}, function(err, result){
		if(err){
			console.log(err)
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
				if(fields[i] != 'comment')
				content.push({field: fields[i], value: values[i]})
			}
			Tk_history.insertMany({
				ticket_id: req.params.id,
				update_time: now.toISOString(),
				update_by: 'Bảo',
				change_description: {
					content: content,
					comment: req.body.data.comment
				}
			}, function(err, result){
				if(err){
					console.log(err)
					return
				}
			})
			res.status(200).send('Update successfully')
		}
	})
}