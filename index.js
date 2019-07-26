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
var responseTime = require('response-time')
var User = require('./models/user.model.js')
var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn
var flash = require('connect-flash')
var fs = require('fs')
var readline = require('readline')
var request = require('request')
var saltRounds = 10
var client = require('./controller/redis.client.js')
var compression = require('compression')
var logger = require('./config/logger.js')

// If modifying these scopes, delete token.json.
require('dotenv').config()

mongoose.connect(process.env.MONGODB_URL_2, { useNewUrlParser: true }, function(error){
  if(error){
    throw error
    logger.error("Failed in connection to MongoDB server \n" + error)
    logger.error(Error('Bị lỗi từ hệ thống'))
  }else {
    logger.info("Connected to MongoDB server.")
  }
})

var app = express(),
server = require('http').createServer(app),
io = require('./config/socketio.js')(server)

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
	extended : true
}))

app.use(compression())
app.use(timeout(60000))
app.use(responseTime())

// Setup View engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//Halt on timeout
function haltOnTimedout(req, res, next){
  if (!req.timedout){
    next()
  }else{
    res.status(503).send("Connection timeout!Please retry later")
  }
}

//Use static file
app.use(express.static(__dirname + '/public'))
global.__basedir = __dirname
app.use(cookieParser(process.env.SEC_COOKIE))

//Session for user
app.use(session({
	secret: process.env.SESSION_KEY,
	resave: true,
	saveUninitialized: true
  // cookie: { maxAge: 6000000 }
	// cookie: { secure: true }
}))

app.use(flash())
app.use(passport.initialize())
app.use(passport.session())

//start server
var port = 5000
server.listen(port, () => {
	console.log('Server is listening on port: ' + port)
  logger.info('Server has started! Listening on port ' + port)
})

//Serve file in public image folder
app.get('/public/image/:filename', (req, res) => {
	res.sendFile(__basedir + '/public/upload/' + req.params.filename)
})

app.get('/login' ,(req, res) => {
	res.render('login', {breadcrumb: [{href: "/login", locate: 'Trang đăng nhập'}], message: req.flash('error')})
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
    function(username, password, done) {
      User.findOne({username: username}, function(err, user) {
      	if(err){
          logger.error("Lỗi khi xác thực thông tin người dùng \n" + err)
          logger.error(Error("Truy vấn không tìm thấy kết quả phù hợp"))
          return done(err)
        }
      	if(!user) return done(null, false, {message: 'Thông tin đăng nhập không đúng!'})
          bcrypt.compare(password, user.password, function (err, result) {
            if (err) { return done(err) }
            if(!result) {
              logger.error("Lỗi khi xác thực thông tin người dùng. Dữ liệu đăng nhập không đúng")
              logger.error(Error("Truy vấn không tìm thấy kết quả phù hợp"))
              return done(null, false, { message: 'Thông tin đăng nhập không đúng!' })
            }
            logger.info("Người dùng " + user.username + " đã đăng nhập vào hệ thống.")
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
//Đảm bảo tất cả các endpoint đều phải xác thực
app.get('*' , ensureLoggedIn('/login'), (req, res, next) => {  
  next()
})
app.get('/404', function(req, res, next){
  next()
})

app.get('/403', function(req, res, next){
  res.render('403page', {url: req.url, breadcrumb:[{href: req.url, locate: "Bạn không có quyền truy cập trang này!"}], user: {username: "Bảo"}})
})

app.get('', function(req, res){
  async function getPageInfo(){
    await request(`https://graph.facebook.com/${process.env.PAGE_ID}/?fields=fan_count,name,picture,rating_count,link&access_token=${process.env.PAGE_ACCESS_TOKEN}`, function(error, response, body){
      if(error){
        console.log(error)
        logger.error("Lỗi khi request tới Facebook graph API \n" + error)
        logger.error(Error("Bị lỗi từ hệ thống"))
        return
      }
      if(response.statusCode == 200){
        client.setex('page_info', 3600, body)
        res.render('index', {breadcrumb: [{href: '/', locate: 'Dashboard'}] ,user: req.user, data:{
          new_user: 100,
          new_mes: 1000,
          new_auto_mes: 999,
          new_feedback: 200
        }, page: JSON.parse(body)})
      }
    })
  }

  client.get('page_info', (err, result) => {
    if (result) {
      logger.info(`Client send request ${req.method} ${req.url}`)
      res.render('index', {breadcrumb: [{href: '/', locate: 'Dashboard'}] ,user: req.user, data:{
          new_user: 100,
          new_mes: 1000,
          new_auto_mes: 999,
          new_feedback: 200
        }, page: JSON.parse(result)})
    } else {
      getPageInfo(req, res)
    }
  })
})

// function isAdmin(req, res, next) {
// 	if (req.isAuthenticated() && req.user.role == 'admin') {
// 		next()
//   }
// }

// function isUser(req, res, next){
// 	if(req.isAuthenticated() && req.user.role == 'user') {
// 		next()
// 	}
// }

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
app.use(function(req, res, next){
  logger.error(`Client gửi request ${req.method} tới route không tồn tại: ${req.url}`)
  res.status(404)
  res.format({
    html: function () {
      res.render('404page', { url: req.url,breadcrumb:[{href: req.url, locate: "Page not found!"}], user: {username: "Bảo"} })
    }
  })
})

