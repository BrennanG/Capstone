var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Document = mongoose.model('Document');
var Student = mongoose.model('Student');
var jwt = require('express-jwt');
var auth = jwt({secret: 'SECRET', userProperty: 'payload'});

// get a document by ID
router.param('document', function(req, res, next, id) {
  var query = Document.findById(id);

  query.exec(function (err, document) {
    if (err) { return next(err); }
    if (!document) { return next(new Error("can't find document")); }

    req.document = document;
    return next();
  });
});

// GET all documents
router.get('/', auth, function(req, res, next) {
  Student.findOne({ username: req.payload.username }).exec(function (err, student) {
    if (err) { return next(err); }
    if (!student) { return next(new Error("can't find student")); }

    student.populate('documents', function(err, student) {
      if (err) { return next(err); }

      res.json(student.documents);
    });
  });
});

// POST a single document
router.post('/', auth, function(req, res, next) {
  var document = new Document(req.body.document);
  Student.findOne({ username: req.payload.username }).exec(function (err, student) {
    if (err) { return next(err); }
    if (!student) { return next(new Error("can't find student")); }

    document.save(function(err, document) {
      if (err) { return next(err); }

      student.documents.push(document);
      student.save(function(err, document) {
        if (err) { return next(err); }

        res.json(document);
      });
    });
  });
});

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

module.exports = router;
