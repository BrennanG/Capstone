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

    var section = new Section({title: req.body.title, teachers: [teacher], students: [], assignments: []});
    section.save(function(err, section) {
      if (err) { return next(err); }

      teacher.sections.push(section);
      teacher.save(function(err, teacher) {
        if (err) { return next(err); }

        res.json(section);
      });
    });
  });
});

// GET a single section by ID
router.get('/:section', auth, function(req, res, next) {
  Teacher.findOne({ username: req.payload.username, sections: req.section }).exec(function (err, teacher) {
    if (err) { return next(err); }
    if (!teacher) { return next(new Error("can't find teacher")); }

    req.section.populate('teachers', function(err, section) {
      if (err) { return next(err); }

      section.populate('students', function(err, section) {
        if (err) { return next(err); }

        section.populate('assignments', function(err, section) {
          if (err) { return next(err); }

          res.json(section);
        });
      });
    });

  });
});

// DELETE a section by ID
router.delete('/:section', auth, function(req, res, next) {
  Teacher.findOne({ username: req.payload.username, sections: req.section }).exec(function (err, teacher) {
    if (err) { return next(err); }
    if (!teacher) { return next(new Error("can't find teacher")); }

    Section.findOneAndRemove({_id: req.section._id}, function(err, section) {
      if (err) { return next(err); }

      res.json(section);
    });
  });
});

module.exports = router;
