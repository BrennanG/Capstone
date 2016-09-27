var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongoose = require('mongoose');
var Student = mongoose.model('Student');
var Teacher = mongoose.model('Teacher');

passport.use('student-local', new LocalStrategy(
  function(username, password, done) {
    Student.findOne({ username: username }, function (err, student) {
      if (err) { return done(err); }
      if (!student) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      if (!student.validPassword(password)) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, student);
    });
  }
));

passport.use('teacher-local', new LocalStrategy(
  function(username, password, done) {
    Teacher.findOne({ username: username }, function (err, teacher) {
      if (err) { return done(err); }
      if (!teacher) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      if (!teacher.validPassword(password)) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, teacher);
    });
  }
));
