var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Student = mongoose.model('Student');
var Teacher = mongoose.model('Teacher');
var Section = mongoose.model('Section');
var passport = require('passport');
var jwt = require('express-jwt');
var auth = jwt({secret: 'SECRET', userProperty: 'payload'}); // TODO: When deployed, this "SECRET" string should be replaced with an environment variable

router.post('/register', function(req, res, next){
  if(!req.body.email || !req.body.password){
    return res.status(400).json({message: 'Please fill out all fields'});
  }

  Student.findOne({email: req.body.email}, function(err, student) {
    if (err) { return next(err); }
    if (student) { return res.status(400).json({message: 'An account with that email already exists.'}); }

    Teacher.findOne({email: req.body.email}, function(err, teacher) {
      if (err) { return next(err); }
      if (teacher) { return res.status(400).json({message: 'An account with that email already exists.'}); }

      var student = new Student();
      student.email = req.body.email;
      student.setPassword(req.body.password);

      student.save(function (err){
        if(err){ return next(err); }

        return res.json({token: student.generateJWT()})
      });
    });
  });
});

router.post('/login', function(req, res, next){
  if(!req.body.email || !req.body.password){
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

router.get('/email', auth, function(req, res, next){
  Student.findOne({email: req.payload.email, _id: req.payload._id}, function(err, student){
    if (err) { return res.status(500).json({'error' : 'error in checking for the email in Students'}); }

    if (student) { res.json({found: 'true'}); }
    else { res.json({found: 'false'}); }
  });
});

// Remove a document from the student's documents list
router.put('/documents/remove', auth, function(req, res, next){
  Student.findOneAndUpdate({email: req.payload.email, _id: req.payload._id}, {$pull: {documents: req.body.documentId}}, function(err, data){
    if(err) {
      return res.status(500).json({'error' : 'error in deleting documentId'});
    }

    res.json(data);
  });
});

// Add a section to the student's sections list
router.put('/sections/add', auth, function(req, res, next) {
  Section.findOne({ teachers: req.payload._id, _id: req.body.section._id }).exec(function (err, section) {
    if (err) { return next(err); }
    if (!section) { return res.status(400).json({message: "Can't find section"}); }

    Student.findOne({ email: req.body.email }).exec(function (err, student) {
      if (err) { return next(err); }
      if (!student) { return res.status(400).json({message: "Can't find student"}); }

      student.sections.push(section);
      student.save(function(err, student) {
        if (err) { return next(err); }

        res.json(student);
      });
    });
  });
});

// GET all sections belonging to the student
router.get('/sections', auth, function(req, res, next) {
  Student.findOne({ email: req.payload.email, _id: req.payload._id })
  .populate({path: 'sections', populate: {path: 'assignments'}}).exec(function (err, student) {
    if (err) { return next(err); }
    if (!student) { return res.status(400).json({message: "Can't find student"}); }

    res.json(student.sections);
  });
});

module.exports = router;
