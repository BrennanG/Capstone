var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Assignment = mongoose.model('Assignment');
var Section = mongoose.model('Section');
var Teacher = mongoose.model('Teacher');
var Student = mongoose.model('Student');
var Document = mongoose.model('Document');
var jwt = require('express-jwt');
var auth = jwt({secret: 'SECRET', userProperty: 'payload'});

// get an assignment by ID
router.param('assignment', function(req, res, next, id) {
  var query = Assignment.findById(id);

  query.exec(function (err, assignment) {
    if (err) { return next(err); }
    if (!assignment) { return next(new Error("can't find assignment")); }

    req.assignment = assignment;
    return next();
  });
});

// POST a single assignment
router.post('/', auth, function(req, res, next) {
  Teacher.findOne({username: req.payload.username, sections: req.body.section._id}).exec(function (err, teacher) {
    if (err) { return next(err); }
    if (!teacher) { return next(new Error("can't find teacher")); }

    Section.findOne({_id: req.body.section._id}).exec(function (err, section) {
      if (err) { return next(err); }
      if (!section) { return next(new Error("can't find section")); }

      var assignment = new Assignment({title: req.body.title, description: req.body.description, teachers: [teacher], section: req.body.section, submissions: []});
      assignment.save(function(err, assignment) {
        if (err) { return next(err); }

        section.assignments.push(assignment);
        section.save(function(err, section) {
          if (err) { return next(err); }

          res.json(assignment);
        });
      });
    });
  });
});

// GET a single assignment by ID
router.get('/:assignment', auth, function(req, res, next) {
  Teacher.findOne({username: req.payload.username}).exec(function (err, teacher) {
    if (err) { return next(err); }
    if (!teacher) { return next(new Error("can't find teacher")); }

    Assignment.findOne({teachers: teacher._id, _id: req.assignment}).exec(function (err, assignment) {
      if (err) { return next(err); }
      if (!assignment) { return next(new Error("can't find assignment")); }

      assignment.populate('submissions', function(err, assignment) {
        if (err) { return next(err); }

        res.json(assignment);
      });
    });
  });
});

// PUT an new submission
router.put('/:assignment/submission', auth, function(req, res, next) {
  Student.findOne({username: req.payload.username}).exec(function (err, student) {
    if (err) { return next(err); }
    if (!student) { return next(new Error("can't find student")); }

    Section.findOne({students: student._id, assignments: req.assignment}).exec(function (err, section) {
      if (err) { return next(err); }
      if (!section) { return next(new Error("can't find section")); }

      Assignment.findOne({_id: req.assignment}).exec(function (err, assignment) {
        if (err) { return next(err); }
        if (!assignment) { return next(new Error("can't find assignment")); }

        Document.findOne({_id: req.body.document}).exec(function (err, document) {
          if (err) { return next(err); }
          if (!document) { return next(new Error("can't find document")); }

          assignment.submissions.push(req.body.document);
          assignment.save(function(err, assignment) {
            if (err) { return next(err); }

            document.updateStatus("submitted");
            document.updateSubmittedTo(assignment._id);
            res.json(assignment);
          });
        });
      });
    });
  });
});

module.exports = router;
