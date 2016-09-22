var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongoose = require('mongoose');
var User = mongoose.model('User');
var Teacher = mongoose.model('Teacher');

passport.use(new LocalStrategy(
  function(username, password, done) {
    var invalidPassword = false;
    User.findOne({ username: username }, function (err, user) {
      if (!err && user) {
        if (user.validPassword(password)) {
          return done(null, user);
        }
        else {
          invalidPassword = true;
        }
      }
    });
    Teacher.findOne({ username: username }, function (err, teacher) {
      if (!err && teacher) {
        if (user.validPassword(password)) {
          return done(null, teacher);
        }
        else {
          invalidPassword = true;
        }
      }
    });

    if (invalidPassword) { return done(null, false, { message: 'Incorrect password.' }); }
    else { return done(null, false, { message: 'Incorrect username.' }); }
  }
));
