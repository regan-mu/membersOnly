const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
const passport = require("passport");
const session = require("express-session");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const memberOnly = require("./routes/membersOnly");
const Member = require("./models/Member");
require("dotenv").config();

const app = express();
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({ secret: "cats", resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

// Setup passport local strategy
passport.use(new LocalStrategy((email, password, done) => {
  Member.findOne({email: email}).exec((error, user) => {
    if(error) {
      return done(error);
    }
    if (!user) {
      return done(false, null, {message: "Incorrect Email"});
    }
    bcrypt.compare(password, user.password, (err, res) => {
      if (err) {
        return done(err);
      }
      if (!res) {
        return done(null, false, {message: "Incorrect Password"});
      } else {
        return done(null, user);
      }
    });
  });
}));

passport.serializeUser((user, done) => {
    done(null, user.id)
});

passport.deserializeUser((user_id, done) => {
  Member.findById(user_id).exec((err, user) => {
    if (err) {
      return done(err);
    }
    return done(null, user);
  });

});

// Set up current users local variable
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
});

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use("/anonymous", memberOnly);

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
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
