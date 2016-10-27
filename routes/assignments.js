var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Assignment = mongoose.model('Assignment');
var Section = mongoose.model('Section');
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
  Section.findOne({_id: req.body.section._id, teachers: req.payload._id}).exec(function (err, section) {
    if (err) { return next(err); }
    if (!section) { return next(new Error("can't find section")); }

    var assignment = new Assignment({title: req.body.title, description: req.body.description, teachers: [req.payload._id], section: req.body.section, submissions: []});
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

// GET a single assignment by ID
router.get('/:assignment', auth, function(req, res, next) {
  Assignment.findOne({teachers: req.payload._id, _id: req.assignment}).exec(function (err, assignment) {
    if (err) { return next(err); }
    if (!assignment) { return next(new Error("can't find assignment")); }

    assignment.populate('submissions', function(err, assignment) {
      if (err) { return next(err); }

      res.json(assignment);
    });
  });
});

// PUT an new submission
router.put('/:assignment/submission', auth, function(req, res, next) {
  Section.findOne({students: req.payload._id, assignments: req.assignment}).exec(function (err, section) {
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

module.exports = router;
