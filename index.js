var express = require('express')
var timeout = require('connect-timeout')
var bodyParser = require('body-parser')
var mongoose = require('mongoose')
var cookieParser = require('cookie-parser')
var path = require('path')
var session = require('express-session')
var passport = require('passport')
var LocalStrategy = require('passport-local').Strategy
var passport = require('passport')
var bcrypt = require('bcrypt')
var User = require('./models/user.model.js')
var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn

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

// Setup View engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//Halt on timeout
function haltOnTimedout(req, res, next){
  if (!req.timedout) next();
}

//Use static file
app.use(express.static(__dirname + '/public'))
global.__basedir = __dirname
app.use(cookieParser(process.env.SEC_COOKIE))

//Session for user
app.use(session({
	secret: process.env.SESSION_KEY,
	resave: true,
	saveUninitialized: true,
	// cookie: { secure: true }
}))

app.use(passport.initialize())
app.use(passport.session())

//start server
var port = 5000
server.listen(port, () => {
	console.log('Server is listening on port: ' + port)
})

//Serve file in public image folder
app.get('/public/image/:filename', (req, res) => {
	res.sendFile(__basedir + '/public/upload/' + req.params.filename)
})

app.get('/login', (req, res) => {
	res.render('login', {locate: 'Trang đăng nhập'})
})

passport.serializeUser(function(user, done) {
    done(null, user._id)
});

passport.deserializeUser(function(_id, done) {
    User.findById(_id).then(function (user) {
        done(null, user)
    }).catch(function (err) {
        console.log(err)
    })
})

passport.use(new LocalStrategy(
    function (username,password,done) {
        User.findOne({username: username}).then(function (user) {
            bcrypt.compare(password, user.password, function (err,result) {
                if (err) { return done(err) }
                if(!result) {
                    return done(null, false, { message: 'Thông tin đăng nhập không đúng!' });
                }
                return done(null, user);
            })
        }).catch(function (err) {
            return done(err)
        })
    }
))

// Endpoint to login
app.post('/login', passport.authenticate('local', 
	{ successReturnToOrRedirect: '/', failureRedirect: '/login' }))

// Endpoint to logout
app.get('/logout', function(req, res){
  req.logout()
  res.redirect('/login')
})

//Main page
app.get('*' , ensureLoggedIn('/login'), isAdmin,(req, res, next) => {	
	next()
})

app.get('', function(req, res){
	res.render('script_table', {locate: 'Main page'})
})

function isAdmin(req, res, next) {
	if (req.isAuthenticated() && req.user.role == 'admin') {
		next()
}}

function isUser(req, res, next){
	if(req.isAuthenticated() && req.user.role == 'admin') {
		next()
	}
}

var scriptRoute = require('./routes/script.route.js')
var broadcastRoute = require('./routes/broadcast.route.js')
var userRoute  = require('./routes/user.route.js')
app.use('/script', scriptRoute)
app.use('/broadcast', broadcastRoute)
app.use('/user', userRoute)
app.use(haltOnTimedout)
