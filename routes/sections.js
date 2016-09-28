var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Section = mongoose.model('Section');
var Teacher = mongoose.model('Teacher');
var jwt = require('express-jwt');
var auth = jwt({secret: 'SECRET', userProperty: 'payload'});

// get a section by ID
router.param('section', function(req, res, next, id) {
  var query = Section.findById(id);

  query.exec(function (err, section) {
    if (err) { return next(err); }
    if (!section) { return next(new Error("can't find section")); }

    req.section = section;
    return next();
  });
});

// GET all sections
router.get('/', auth, function(req, res, next) {
  Teacher.findOne({ username: req.payload.username }).exec(function (err, teacher) {
    if (err) { return next(err); }
    if (!teacher) { return next(new Error("can't find teacher")); }

    teacher.populate('sections', function(err, teacher) {
      if (err) { return next(err); }

      res.json(teacher.sections);
    });
  });
});

// POST a single section
router.post('/', auth, function(req, res, next) {
  Teacher.findOne({ username: req.payload.username }).exec(function (err, teacher) {
    if (err) { return next(err); }
    if (!teacher) { return next(new Error("can't find teacher")); }

    var section = new Section({title: req.body.title, teachers: [teacher], students: []});
    section.save(function(err, section) {
      if (err) { return next(err); }

      teacher.sections.push(section);
      teacher.save(function(err, section) {
        if (err) { return next(err); }

        res.json(section);
      });
    });
  });
});
/*
// GET a single document by ID
router.get('/:document', auth, function(req, res, next) {
  Student.findOne({ username: req.payload.username, documents: req.document }).exec(function (err, student) {
    if (err) { return next(err); }
    if (!student) { return next(new Error("can't find student")); }

    req.document.populate('graph', function(err, document) {
      if (err) { return next(err); }

      res.json(document);
    });
  });
});

// DELETE a document by ID
router.delete('/:document', auth, function(req, res, next) {
  Student.findOne({ username: req.payload.username, documents: req.document }).exec(function (err, student) {
    if (err) { return next(err); }
    if (!student) { return next(new Error("can't find student")); }

    Document.findOneAndRemove({_id: req.document._id}, function(err, document) {
      if (err) { return next(err); }

      res.json(document);
    });
  });
});
*/
module.exports = router;
