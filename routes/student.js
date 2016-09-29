var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Student = mongoose.model('Student');
var passport = require('passport');
var jwt = require('express-jwt');
var auth = jwt({secret: 'SECRET', userProperty: 'payload'});

router.post('/register', function(req, res, next){
  if(!req.body.username || !req.body.password){
    return res.status(400).json({message: 'Please fill out all fields'});
  }

  var student = new Student();
  student.username = req.body.username;
  student.setPassword(req.body.password);
  student.documents = [];

  student.save(function (err){
    if(err){ return next(err); }

    return res.json({token: student.generateJWT()})
  });
});

router.post('/login', function(req, res, next){
  if(!req.body.username || !req.body.password){
    return res.status(400).json({message: 'Please fill out all fields'});
  }

  passport.authenticate('student-local', function(err, student, info){
    if(err){ return next(err); }

    if(student){
      return res.json({token: student.generateJWT()});
    } else {
      return res.status(401).json(info);
    }
  })(req, res, next);
});

router.put('/documents/remove', auth, function(req, res, next){
  Student.findOneAndUpdate({username: req.body.student}, {$pull: {documents: req.body.documentId}}, function(err, data){
    if(err) {
      return res.status(500).json({'error' : 'error in deleting documentId'});
    }

    res.json(data);
  });
});

module.exports = router;
