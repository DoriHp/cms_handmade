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
var flash = require('connect-flash')

const fs = require('fs')
const readline = require('readline')
const {google} = require('googleapis')
const TOKEN_PATH = 'token.json'
const CREDENTIAL_FILE = 'credentials.json'

// If modifying these scopes, delete token.json.
const SCOPES = [
  'https://mail.google.com/'
]

fs.readFile(CREDENTIAL_FILE, (err, content) => {
  if(err) throw err
  checkToken(JSON.parse(content))
})

// check token exist in token file
function checkToken(credential) {
  let clientSecret = credential.installed.client_secret;
  let clientId = credential.installed.client_id;
  let redirectUrl = credential.installed.redirect_uris[0];
  let oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUrl);

  fs.readFile(TOKEN_PATH, (err, token) => {
    if(err) return getNewToken(oauth2Client)
    oauth2Client.setCredentials(JSON.parse(token))
  })
}

function getNewToken(oauth2Client) {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl)
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oauth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err)
      oauth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log('Token stored to', TOKEN_PATH)
      });
    });
  });
}

require('dotenv').config()

mongoose.connect(process.env.MONGODB_URL_2, { useNewUrlParser: true }, function(error){
  if(error) throw error
})

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

app.use(flash())
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

app.get('/login' ,(req, res) => {
	res.render('login', {locate: 'Trang đăng nhập', message: req.flash('error')})
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
        User.findOne({username: username}, function(err, user) {
        	if(err) return done(err)
        	if(!user) return done(null, false, {message: 'Thông tin đăng nhập không đúng!'})
            bcrypt.compare(password, user.password, function (err, result) {
                if (err) { return done(err) }
                if(!result) {
                    return done(null, false, { message: 'Thông tin đăng nhập không đúng!' });
                }
                return done(null, user)
            })
        })
    }
))

// Endpoint to login
app.post('/login', passport.authenticate('local', 
	{ successReturnToOrRedirect: '/', failureRedirect: '/login' , failureFlash: true}))

// Endpoint to logout
app.get('/logout', function(req, res){
  req.logout()
  res.redirect('/login')
})

// Main page
// app.get('*' , ensureLoggedIn('/login'), isAdmin, (req, res, next) => {  
//   next()
// })
app.get('', function(req, res){
	res.render('index', {locate: 'Main page', user: 'admin', data:{
    new_user: 100,
    new_mes: 1000,
    new_auto_mes: 999,
    new_feedback: 200
  }})
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
var message241Route = require('./routes/message241.route.js')
var userRoute  = require('./routes/user.route.js')
var managerRoute = require('./routes/manager.route.js')
var schedule = require('./controller/auto_exec.js')
schedule.update_linkChat()
app.use('/script', scriptRoute)
app.use('/message241', message241Route)
app.use('/user', userRoute)
app.use('/manager', managerRoute)
app.use(haltOnTimedout)
