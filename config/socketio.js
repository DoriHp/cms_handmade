var Script = require('../models/script.model.js')
var Feedback = require('../models/feedback.model.js')
var Ticket = require('../models/ticket.model.js')
var Tk_history = require('../models/ticket_history.model.js')

module.exports = function(server){
    var io = require('socket.io')(server);
    var clientList = [];
    
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

    const changeStream_fb = Feedback.watch({fullDocument: 'updateLookup'})
    changeStream_fb.on('change', function (change) {
        console.log('Feedback document change with type is ' + change.operationType)

        switch(change.operationType) {
            case "insert":
                Feedback.findById(change.documentKey._id, function(err, feedback){
                    if(err)
                        console.log(err)
                    
                    clientList.forEach((client) => {
                        console.log('emit event "recieve new feedback" to client ' + feedback._id)
                        client.socket.emit('recieve new feedback',  {feedback: feedback})
                    })
                });
                break;
            case "update":
                Feedback.findById(change.documentKey._id, function(err, feedback){
                    if(err)
                        console.log(err)
                    clientList.forEach((client) => {
                        console.log('emit event "update feedback" to client ' + client.id)
                        client.socket.emit('update feedback', {feedback: feedback})
                    })
                })
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
                        console.log(err)
                        return
                    }
                    var now = new Date()
                    Tk_history.insertMany({
                        ticket_id: ticket.id,
                        update_time: now.toISOString(),
                        update_by: "System",
                        change_description: ""
                    }, function(err, result){
                        if(err)
                            console.log('Error when update ticket history')
                    })                    
                    clientList.forEach((client) => {
                        console.log('emit event "recieve new ticket" to client ' + ticket._id)
                        client.socket.emit('recieve new ticket',  {ticket: ticket})
                    })
                });
                break;
            case 'update':
                Ticket.findById(change.documentKey._id, function(err, ticket){
                    if(err)
                        console.log(err);
                    
                    clientList.forEach((client) => {
                        console.log('emit event "update ticket" to client ' + client.id)
                        client.socket.emit('update ticket', {ticket: ticket})
                    })
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

}