var Script = require('../models/script.model.js')
var Ticket = require('../models/ticket.model.js')
var Tk_history = require('../models/ticket_history.model.js')
var Notify = require('../models/notify.model.js')
var request = require('request')
var Config = require('../models/config.model.js')
var logger = require('../config/logger.js')

module.exports = function(server){
    var io = require('socket.io')(server);
    var clientList = []
    
    io.on('connection', function(socket){
        console.log('add client ' + socket.id);
        clientList.push({id: socket.id, socket: socket});

        socket.on('disconnect', function () {
            for(var i = 0; i < clientList.length; i++){
                if (clientList[i].id == socket.id) {
                    console.log('remove client ' + socket.id);
                    clientList.splice(i, 1);
                    break;
                }
            }
        })
    })
    
    const changeStream = Script.watch({fullDocument: 'updateLookup'})
    changeStream.on('change', function (change) {
        console.log('Script document change with type is ' + change.operationType);

        switch(change.operationType) {
            case "insert":
                Script.findById(change.documentKey._id, function(err, script){
                    if(err)
                        console.log(err);
                    
                    clientList.forEach((client) => {
                        console.log('emit event "insert script" to client ' + client.id);
                        client.socket.emit('insert script',  {script: script});
                    })
                });
                break;
            case "update":
                Script.findById(change.documentKey._id, function(err, script){
                    if(err)
                        console.log(err);
                    
                    clientList.forEach((client) => {
                        console.log('emit event "update script" to client ' + client.id)
                        client.socket.emit('update script', {script: script})
                    })
                })
                break;
            case "delete":
                clientList.forEach((client) => {
                    console.log('emit event "delete script" to client ' + client.id)
                    client.socket.emit('delete script', {_id: change.documentKey._id})
                })
                break
            default: 
                console.log('Error: Change stream type is ' + change.operationType)
                break
        }
    })

    const changeStream_tk = Ticket.watch({fullDocument: 'updateLookup'})
    changeStream_tk.on('change', function(change){
        ('Ticket document change with type is' + change.operationType)
        switch (change.operationType) {
            case 'insert':
                var _id = '5d3a469e51aa6a10dcf330a1'
                Config.findByIdAndUpdate(_id, {$inc: {ticketCounter: 1}}, {new: true, upsert: false, useFindAndModify: false}, function(err, result){

                        if(err){
                            logger.error("Lỗi khi update số lượng ticket \n" + err)
                            logger.error(Error("Lỗi từ hệ thống"))
                        }else{
                            logger.info("Đã update số lượng ticket. Tổng số ticket hiện giờ: " + result.ticketCounter)
                        }
                    })
                    Ticket.findById(change.documnentKey._id, async function(err, ticket){
                        if(err){
                            console.error(err)
                            return
                        }
                        var now = new Date()
                        var object = ticket
                        delete object['_id']
                        customFilter(object)
                        setTimeout(function(){
                            ticket.updateOne({$set: object}, function(err){
                                if(err){
                                    console.log("Lỗi xảy ra khi đổi url của file image")
                                }
                            })
                        }, 2000)

                        Notify.insertMany({
                            ticket_id: ticket.id,
                            time: now.toISOString(),
                            category: 'new',
                            status: false,
                            username: "admin",
                            member_profile:{
                                member_code: ticket.member_profile.member_code
                            }
                        }, function(err, result){
                            if(err){
                                console.error(err)
                                return
                            }
                        })
                        clientList.forEach((client) => {
                            console.log('emit event "recieve new ticket" to client ' + ticket._id)
                            client.socket.emit('recieve new ticket',  {ticket: ticket})
                        })
                    })
                break;
            case 'update':
                //Tạo một notify mới
                if(change.updateDescription.updatedFields.status != null && change.updateDescription.updatedFields.assignee != null){
                    var now = new Date()
                    logger.info("Insert new notification!")
                    Notify.insertMany({
                        ticket_id: change.fullDocument.id,
                        time: now.toISOString(),
                        category: 'assigned',
                        status: false,
                        username: change.updateDescription.updatedFields.assignee,
                        member_profile:{
                            member_code: change.fullDocument.member_profile.member_code
                        }
                    }, function(err, result){
                        console.error(err)
                        return
                    })
                }

                var ticket = change.fullDocument
                clientList.forEach((client) => {
                    console.log('emit event "update ticket" to client ' + client.id)
                    client.socket.emit('update ticket', {ticket: ticket})
                })

                break;
            case "delete":
                clientList.forEach((client) => {
                    console.log('emit event "delete ticket" to client ' + client.id)
                    client.socket.emit('delete ticket', {_id: change.documentKey._id})
                })
                break;
            default:
                // statements_def
            break;
        }
    })

    const changeStream_notify = Notify.watch({fullDocument: 'updateLookup'})
    changeStream_notify.on('change', function(notify){
        switch (notify.operationType) {
            case 'insert':
                clientList.forEach(client => {
                    console.log('emit event "insert notify" to client ' + client.id)
                    client.socket.emit('insert notify')
                })
                break;
            default:
                // statements_def
                break;
        }
    })

}

function randomValueHex(len) {
    return crypto
      .randomBytes(Math.ceil(len / 2))
      .toString('hex') // convert to hexadecimal format
      .slice(0, len) // return required number of characters
}

var crypto = require('crypto');

function file_etx(){
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
    return('image' + now.yyyymmdd() + randomValueHex(6) + '.png')
}

function customFilter(object){
    for(let i of object.description.feedbacks){
        if(i.attachments){
            for(let j of i.attachments){
                if(j.type != 'image'){
                    break
                }
                var path = require('path')
                , url = require('url')
                , fs = require('fs')
                , URL_TO_REQUEST = j.payload.url
                , uri = url.parse(URL_TO_REQUEST)
                , filename = file_etx()

                var DOWNLOAD_DIR = './public/image'
                var file_path = path.join(DOWNLOAD_DIR,filename)
                request(URL_TO_REQUEST)
                    .pipe(fs.createWriteStream(file_path))
                request(URL_TO_REQUEST)
                    .on('response', function(response){
                        console.log(decodeURIComponent(filename))
                        j.payload.url = 'http://localhost:5000/public/image/' + filename
                })
            }
        }
    }
}


