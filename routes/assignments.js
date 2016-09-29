var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Assignment = mongoose.model('Assignment');
var Section = mongoose.model('Section');
var Teacher = mongoose.model('Teacher');
var jwt = require('express-jwt');
var auth = jwt({secret: 'SECRET', userProperty: 'payload'});

// POST a single assignment
router.post('/', auth, function(req, res, next) {
  Teacher.findOne({username: req.payload.username, sections: req.body.section._id}).exec(function (err, teacher) {
    if (err) { return next(err); }
    if (!teacher) { return next(new Error("can't find teacher")); }

    Section.findOne({_id: req.body.section._id}).exec(function (err, section) {
      if (err) { return next(err); }
      if (!section) { return next(new Error("can't find section")); }

      var assignment = new Assignment({title: req.body.title, description: req.body.description, section: req.body.section, submissions: []});
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

module.exports = router;
