var express = require('express')
var app = express()
var bodyParser = require('body-parser')
var port = 5000
var md5 = require('md5')
var mongoose = require('mongoose')
var cookieParser = require('cookie-parser')
require('dotenv').config()

mongoose.connect("mongodb://tester:tester123@localhost:27017/express-demo", { useNewUrlParser: true })

var scriptRoute = require('./router/script.route.js')
// var apiRoute = require('./router/student.route.js')
// var authMiddleware = require('./middleware/auth.middleware.js')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
	extended : true
}))

app.use(express.static(__dirname + '/public'))
app.use('/js', express.static(__dirname + '/public/js'));
global.__basedir = __dirname
app.use(cookieParser(process.env.SEC_COOKIE))

app.get('', (req, res) => {
	res.sendFile('public/index.html' , { root : __dirname})
})

app.listen(port, () => {
	console.log('Server is listening on port: ' + port)
})

app.use('/script', scriptRoute)
// app.use('/auth', authMiddleware)