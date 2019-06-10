var express = require('express')
var timeout = require('connect-timeout')
var bodyParser = require('body-parser')
var mongoose = require('mongoose')
var cookieParser = require('cookie-parser')
var path = require('path')
var User = require('./models/user.model.js')
var Script = require('./models/script.model.js')

require('dotenv').config()

mongoose.connect(process.env.MONGODB_URL, { useNewUrlParser: true })

var app = express(),
server = require('http').createServer(app),
io = require('./config/socketio.js')(server)

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
	extended : true
}))
app.use(timeout(10000))

function haltOnTimedout(req, res, next){
  if (!req.timedout) next();
}

app.use(express.static(__dirname + '/public'))
global.__basedir = __dirname
app.use(cookieParser(process.env.SEC_COOKIE))

app.get('' ,(req, res) => {
	res.sendFile('./public/index.html', {root: __dirname})
})

//start server
var port = 5000
server.listen(port, () => {
	console.log('Server is listening on port: ' + port)
})

var controller = require('./controller/script.controller.js')

app.get('/script', controller.index)
app.get('/script/add/:intent', controller.addScript)
app.post('/script/add', controller.saveNewScript)
app.get('/script/properties/:_id', controller.getProperties)
app.put('/script/update/:_id', controller.updateScript)
app.delete('/script/delete/:_id', controller.delScript)
app.get('/broadcast', controller.sendBroadcastForm)
app.post('/broadcast', controller.execBroadcast)

app.use(haltOnTimedout)
