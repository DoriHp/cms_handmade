var express = require('express')
var app = express()
var timeout = require('connect-timeout')
var bodyParser = require('body-parser')
var port = 5000
var md5 = require('md5')
var mongoose = require('mongoose')
var cookieParser = require('cookie-parser')
var path = require('path')
var passport = require('passport');
var expressSession = require('express-session');
var User = require('./models/user.model.js')
var LocalStrategy = require('passport-local').Strategy;
var flash = require('connect-flash');
var Script = require('./models/script.model.js')

require('dotenv').config()

mongoose.connect(process.env.MONGODB_URL, { useNewUrlParser: true })

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
	extended : true
}))
app.use(timeout(10000))
app.use(expressSession({secret: process.env.SESSION_KEY, resave: false, saveUninitialized: false }));
app.use(require('morgan')('combined'));

var engines = require('consolidate');

function haltOnTimedout(req, res, next){
  if (!req.timedout) next();
}

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(express.static(__dirname + '/public'))
global.__basedir = __dirname
app.use(cookieParser(process.env.SEC_COOKIE))

app.get('/', (req, res) => {
	res.sendFile('./public/index.html', {root: __dirname})
})

app.listen(port, () => {
	console.log('Server is listening on port: ' + port)
})

passport.use(new LocalStrategy(
  function(username, password, cb) {
    User.findOne({username : username}, function(err, user) {
      if (err) { 
        return cb(err); }
      if (!user) { 
        return cb(null, false, {message: 'Incorrect username!'}); }
      if (user.password != password) { 
        return cb(null, false, {message: 'Incorect password!'}
			); }
      return cb(null, user);
    });
  }));

passport.serializeUser(function(user, cb) {
  cb(null, user._id);
});

passport.deserializeUser(function(_id, cb) {
  User.findById(_id, function (err, user) {
    if (err) { return cb(err); }
    cb(null, user);
  });
});

app.get('/login', (req, res) => {
	res.sendFile('./public/login.html', {root: __dirname})
})

app.post('/login', 
	passport.authenticate('local', {failureRedirect: '/login'}),
	function(req, res){
		res.redirect('/')
	}
)

app.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/login');
});

var controller = require('./controller/script.controller.js')

app.get('/script', require('connect-ensure-login').ensureLoggedIn(), controller.index)
app.get('/script/add/:intent', require('connect-ensure-login').ensureLoggedIn(),controller.addScript)
app.post('/script/add', controller.saveNewScript)
app.get('/script/properties/:id', controller.getProperties)
app.delete('/script/delete/:_id', controller.delScript)

function isLoggedIn(req, res, next) {
	// Nếu một user đã xác thực, cho đi tiếp
	if (req.isAuthenticated())
	    return next();
	// Nếu chưa, đưa về trang chủ
	req.session.returnTo = req.url
    res.redirect('login');
}

app.use(haltOnTimedout)
