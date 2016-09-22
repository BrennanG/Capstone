var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Teacher = mongoose.model('Teacher');
var passport = require('passport');
var jwt = require('express-jwt');
var auth = jwt({secret: 'SECRET', userProperty: 'payload'});

router.post('/register', function(req, res, next){
  if(!req.body.username || !req.body.password){
    return res.status(400).json({message: 'Please fill out all fields'});
  }

  var teacher = new Teacher();
  teacher.username = req.body.username;
  teacher.setPassword(req.body.password);
  //teacher.documents = [];

  teacher.save(function (err){
    if(err){ return next(err); }

    return res.json({token: teacher.generateJWT()})
  });
});

router.post('/login', function(req, res, next){
  if(!req.body.username || !req.body.password){
    return res.status(400).json({message: 'Please fill out all fields'});
  }

  console.log('calling passport)');
  passport.authenticate('local', function(err, teacher, info){
    if(err){ return next(err); }

    if(teacher){
      return res.json({token: teacher.generateJWT()});
    } else {
      return res.status(401).json(info);
    }
  })(req, res, next);
});

module.exports = router;
