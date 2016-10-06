var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Student = mongoose.model('Student');
var Teacher = mongoose.model('Teacher');
var Section = mongoose.model('Section');
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

// Remove a document from the student's documents list
router.put('/documents/remove', auth, function(req, res, next){
  Student.findOneAndUpdate({username: req.body.student}, {$pull: {documents: req.body.documentId}}, function(err, data){
    if(err) {
      return res.status(500).json({'error' : 'error in deleting documentId'});
    }

    res.json(data);
  });
});

// Add a section to the student's sections list
router.put('/sections/add', auth, function(req, res, next) {
  Teacher.findOne({ username: req.payload.username, sections: req.body.section._id }).exec(function (err, teacher) {
    if (err) { return next(err); }
    if (!teacher) { return res.status(400).json({message: "Can't find teacher"}); }

    Student.findOne({ username: req.body.username }).exec(function (err, student) {
      if (err) { return next(err); }
      if (!student) { return res.status(400).json({message: "Can't find student"}); }

      student.sections.push(req.body.section);
      student.save(function(err, student) {
        if (err) { return next(err); }

        res.json(student);
      });
    });
  });
});

// GET all sections belonging to the student
router.get('/sections', auth, function(req, res, next) {
  Student.findOne({ username: req.payload.username })
  .populate({path: 'sections', populate: {path: 'assignments'}}).exec(function (err, student) {
    if (err) { return next(err); }
    if (!student) { return res.status(400).json({message: "Can't find student"}); }

    res.json(student.sections);
  });
});

module.exports = router;
