require("dotenv").config();
var express = require('express');
var app = express();
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const expressSession = require("express-session")
const passport = require('passport')
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

// Database connection
require("./routes/dataBase.js").connectDatabse();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');



app.use(expressSession({
    resave:false,
    saveUninitialized:false,
    secret:"hello bhai"
  }))

  
  app.use(passport.initialize())
  app.use(passport.session())
  passport.serializeUser(usersRouter.serializeUser())
  passport.deserializeUser(usersRouter.deserializeUser())
  
app.use(logger('tiny'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);



module.exports = app;
