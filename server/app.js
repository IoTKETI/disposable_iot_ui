var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('body-parser');
var mongo = require('./utils/mongodb');

var app = express();

// Router들 불러오기
var authRouter = require('./routes/auth-token.route');
var userRotuer = require('./routes/users.route');
var categoryRouter = require('./routes/category.route');
var taskRouter = require('./routes/task.route');
var orchestrationRouter = require('./routes/orchestration.route');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Prevent too large  payload error 
app.use(logger('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../client')));
app.use(express.static(path.join(__dirname, '../node_modules')));

// Setting routers on Node Server
app.use('/auth', authRouter);
app.use('/user', userRotuer);
app.use('/category', categoryRouter);
app.use('/task', taskRouter);
app.use('/orchestration', orchestrationRouter);

// connect to MongoDB
mongo.connect(global.CONFIG, (err, res) => {
  if(err){
    LOGGER.error(err);
  } else {
    require('./libs/initializeAccount').initAccount();
  }
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500).send();
});

module.exports = app;