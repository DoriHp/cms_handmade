var Member = require('../models/member.modal.js')
var graph = require('fbgraph')
graph.setVersion("3.3")
var schedule = require('node-schedule')
var logger = require('../config/logger.js')

module.exports.update_linkChat = function(){
	var job = schedule.scheduleJob('0 1 * * *' , function(fireDate){
		logger.info("Bắt đầu update fb_linkChat của member vào lúc " + fireDate)
		var result = []

		//gọi đến api của fbgraph
		function test(){
		   graph.get(`/${process.env.PAGE_ID}/conversations/conversations?access_token=${process.env.PAGE_ACCESS_TOKEN}&fields=link%2Cparticipants&limit=2`, function(err, res){
		       	if (err) {
		       		console.log('Đã có lỗi xảy ra! ' + err)
		       		return
		       	}
		        res.data.forEach(data => {
	            	result.push(data)
	            })
		        recursion(res)
		   }) 
		}

		test()

		//sử dụng đệ quy để lấy kết quả tới khi nào hết paging.next
		async function recursion(previousRes) {
		    if(previousRes.paging && previousRes.paging.next) {
		        var promise = await new Promise(function(resolve, reject){
		            graph.get(previousRes.paging.next, function(err, currentRes) {
		                if (err) {
		                	logger.error("Lỗi khi thực hiện truy vấn tới Facebook graph API \n" + rejectError)
                    		logger.error(Error("Bị lỗi từ hệ thống"))
		                    reject(err);
		                } else {
		                    resolve(currentRes);
		                }
		            })
		        }).then(resolveData => {
		            resolveData.data.forEach(data => {
		            	result.push(data)
		            })
		            recursion(resolveData)
		        }, rejectError => {
		            logger.error("Lỗi khi thực hiện truy vấn tới Facebook graph API \n" + rejectError)
                    logger.error(Error("Bị lỗi từ hệ thống"))
		        })
		    } else {
		    	//update linkChat trong csdl
		        result.forEach(async ele => {
		        	var linkChat = 'https://www.facebook.com/' + ele.link
                    for(let i of ele.participants.data){
                        if(i.id != process.env.PAGE_ID){
                            await Member.findOneAndUpdate({fb_id: i.id}, {$set:{fb_linkChat: linkChat}}, {new: true, upsert: false, useFindAndModify: false},function(err, result){
                                if(err){
                                    logger.error("Lỗi khi thực hiện update link chat của điểm bán trong CSDL \n" + err)
                                    logger.error(Error("Bị lỗi từ hệ thống"))
                                    return
                                }
                            })
                        }
		        	}
			    })
			}
		}
	})
}