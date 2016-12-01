var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Section = mongoose.model('Section');
var Teacher = mongoose.model('Teacher');
var Student = mongoose.model('Student');
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

// GET all sections belonging to the teacher
router.get('/', auth, function(req, res, next) {
  Section.find({ teachers: req.payload._id }, function (err, sections) {
    if (err) { return next(err); }

    res.json(sections);
  });
});

// POST a single section
router.post('/', auth, function(req, res, next) {
  Teacher.findOne({ email: req.payload.email, _id: req.payload._id }).exec(function (err, teacher) {
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
  Section.findOne({ teachers: req.payload._id, _id: req.section }).exec(function (err, section) {
    if (err) { return next(err); }
    if (!section) { return next(new Error("can't find section")); }

    section.populate('teachers', function(err, section) {
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
  Section.findOneAndRemove({ _id: req.section._id, teachers: req.payload._id }, function(err, section) {
    if (err) { return next(err); }

    res.json(section);
  });
});

// Add a student to the section's student list
router.put('/:section/students/add', auth, function(req, res, next) {
  Section.findOne({ teachers: req.payload._id, _id: req.section }).exec(function (err, section) {
    if (err) { return next(err); }
    if (!section) { return res.status(400).json({message: "Can't find section"}); }

    Student.findOne({ email: req.body.email }).exec(function (err, student) {
      if (err) { return next(err); }
      if (!student) { return res.status(400).json({message: "Student with email '" + req.body.email + "' does not exist."}); }

      var alreadyEnrolled = section.students.some(function(studentId) {
        return studentId.equals(student._id);
      });
      if (alreadyEnrolled) { return res.status(400).json({message: "The section already contains the student with email '" + req.body.email + "'."}); }

      section.students.push(student);
      section.save(function(err, section) {
        if (err) { return next(err); }

        res.json(section);
      });
    });
  });
});

module.exports = router;
