var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session')
var app = express();
var cors = require('cors')
var Handlebars = require('handlebars')
/* Cross Origin Resource Sharing */
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

Handlebars.registerHelper('each', function(context, options) {
  var ret = "";

  for(var i=0, j=context.length; i<j; i++) {
    ret = ret + options.fn(context[i]);
  }

  return ret;
});

var corsOptions = {
  origin: 'http://localhost:3000',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204 
}
app.use(cors(corsOptions));

function loginRequired(req, res, next) {
  sess = req.session;

  if (!sess.user) {
    return res.status(401).render("unauthenticated");
  }
  next();
}

/* Router Pages */
var accountRouter = require('./routes/account');
var dashboardRouter = require('./routes/dashboard');
var documentRouter = require('./routes/document');
var friendsRouter = require('./routes/friends');
var groupsRouter = require('./routes/groups');
var loginRouter = require('./routes/login');
var registerRouter = require('./routes/register');
var defaultRouter = require('./routes/login');
var logoutRouter = require('./routes/logout');
var groupdashboardRouter = require('./routes/groupdashboard');


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(session({ secret: 'topsecretword', saveUninitialized: true, resave: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use('/dashboard', loginRequired, dashboardRouter);
app.use('', defaultRouter);
app.use('/logout', logoutRouter);
app.use('/friends', loginRequired, friendsRouter);
app.use('/account', loginRequired, accountRouter);
app.use('/groups', loginRequired, groupsRouter);
app.use('/login', loginRouter);
app.use('/register', registerRouter);
app.use('/document',loginRequired, documentRouter);
app.use('/groupdashboard', loginRequired, groupdashboardRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
