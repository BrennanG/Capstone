var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongoose = require('mongoose');
var Student = mongoose.model('Student');
var Teacher = mongoose.model('Teacher');

passport.use('student-local', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  },
  function(email, password, done) {
    Student.findOne({ email: email }, function (err, student) {
      if (err) { return done(err); }
      if (!student) {
        return done(null, false, { message: 'Incorrect login.' });
      }
      if (!student.validPassword(password)) {
        return done(null, false, { message: 'Incorrect login.' });
      }
      return done(null, student);
    });
  }
));

passport.use('teacher-local', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  },
  function(email, password, done) {
    Teacher.findOne({ email: email }, function (err, teacher) {
      if (err) { return done(err); }
      if (!teacher) {
        return done(null, false, { message: 'Incorrect login.' });
      }
      if (!teacher.validPassword(password)) {
        return done(null, false, { message: 'Incorrect login.' });
      }
      return done(null, teacher);
    });
  }
));
