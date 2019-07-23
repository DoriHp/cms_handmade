var Script = require('../models/script.model.js')
var Feedback = require('../models/feedback.model.js')
var Ticket = require('../models/ticket.model.js')
var Tk_history = require('../models/ticket_history.model.js')
var Notify = require('../models/notify.model.js')

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
                Ticket.findById(change.documentKey._id, function(err, ticket){
                    if(err){
                        console.error(err)
                        return
                    }
                    var now = new Date()
                    Notify.insertMany({
                        ticket_id: ticket.id,
                        time: now.toISOString(),
                        category: 'new',
                        status: false,
                        username: "admin"
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
                    Notify.insertMany({
                        ticket_id: change.fullDocument.id,
                        time: now.toISOString(),
                        category: 'assigned',
                        status: false,
                        username: change.updateDescription.updatedFields.assignee
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

                break
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