var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Teacher = mongoose.model('Teacher');
var passport = require('passport');
var jwt = require('express-jwt');
var auth = jwt({secret: 'SECRET', userProperty: 'payload'});

router.post('/register', function(req, res, next){
  if(!req.body.email || !req.body.password){
    return res.status(400).json({message: 'Please fill out all fields'});
  }

  var teacher = new Teacher();
  teacher.email = req.body.email;
  teacher.setPassword(req.body.password);
  teacher.sections = [];

  teacher.save(function (err){
    if(err){ return next(err); }

    return res.json({token: teacher.generateJWT()})
  });
});

router.post('/login', function(req, res, next){
  if(!req.body.email || !req.body.password){
    return res.status(400).json({message: 'Please fill out all fields'});
  }

  passport.authenticate('teacher-local', function(err, teacher, info){
    if(err){ return next(err); }

    if(teacher){
      return res.json({token: teacher.generateJWT()});
    } else {
      return res.status(401).json(info);
    }
  })(req, res, next);
});

router.get('/email', auth, function(req, res, next){
  Teacher.findOne({email: req.payload.email, _id: req.payload._id}, function(err, teacher){
    if (err) { return res.status(500).json({'error' : 'error in checking for the email in Teachers'}); }

    if (teacher) { res.json({found: 'true'}); }
    else { res.json({found: 'false'}); }
  });
});

router.put('/sections/remove', auth, function(req, res, next){
  Teacher.findOneAndUpdate({ email: req.payload.email, _id: req.payload._id }, {$pull: {sections: req.body.sectionId}}, function(err, data){
    if(err) {
      return res.status(500).json({'error' : 'error in deleting secionId'});
    }

    res.json(data);
  });
});

module.exports = router;
