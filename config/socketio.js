var Script = require('../models/script.model.js');

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
        });
    });
    
    const changeStream = Script.watch({fullDocument: 'updateLookup'});
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
                        console.log('emit event "update script" to client ' + client.id);
                        client.socket.emit('update script', {script: script});
                    });
                });
                break;
            case "delete":
                clientList.forEach((client) => {
                    console.log('emit event "delete script" to client ' + client.id);
                    client.socket.emit('delete script', {_id: change.documentKey._id});
                });
                break;
            default: 
                console.log('Error: Change stream type is ' + change.operationType);
                break;
        }
    });
}