var express = require('express')
var app = express()
var timeout = require('connect-timeout')
var bodyParser = require('body-parser')
var port = 5000
var md5 = require('md5')
var mongoose = require('mongoose')
var cookieParser = require('cookie-parser')
var path = require('path')

require('dotenv').config()

mongoose.connect(process.env.MONGODB_URL, { useNewUrlParser: true })

var scriptRoute = require('./router/script.route.js')
var authRoute = require('./router/scritp.route.js')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
	extended : true
}))
app.use(timeout(10000))

app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'ejs');

function haltOnTimedout(req, res, next){
  if (!req.timedout) next();
}

app.use(express.static(__dirname + '/public'))
global.__basedir = __dirname
app.use(cookieParser(process.env.SEC_COOKIE))

app.get('', (req, res) => {
	res.sendFile('public/index.html' , { root : __dirname})
})

app.listen(port, () => {
	console.log('Server is listening on port: ' + port)
})

app.use('/script', scriptRoute)
app.use('/auth', authRoute)
app.use(haltOnTimedout)
