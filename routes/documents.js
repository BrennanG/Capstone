var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Document = mongoose.model('Document');
var Student = mongoose.model('Student');
var Assignment = mongoose.model('Assignment');
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
  Document.find({student: req.payload._id})
  .populate({path: 'submittedTo'}).exec(function(err, documents) {
    if (err) { return next(err); }

    res.json(documents);
  });
});

// POST a single document
router.post('/', auth, function(req, res, next) {
  Student.findOne({ email: req.payload.email, _id: req.payload._id }).exec(function (err, student) {
    if (err) { return next(err); }
    if (!student) { return next(new Error("can't find student")); }

    var document = new Document({title: req.body.title, graph: req.body.graph, student: student, status: "unsubmitted"});
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
  Document.findOne({_id: req.document, student: req.payload._id}).exec(function (err, document) {
    if (err) { return next(err); }
    if (!document) { return next(new Error("can't find document")); }

    res.json(document);
  });
});

// GET a single submitted document by ID (for teachers)
router.get('/submissions/:document', auth, function(req, res, next) {
  Assignment.findOne({ teachers: req.payload._id, submissions: req.document }).exec(function (err, assignment) {
    if (err) { return next(err); }
    if (!assignment) { return next(new Error("can't find assignment")); }

    Document.findOne({_id: req.document}).exec(function (err, document) {
      if (err) { return next(err); }
      if (!document) { return next(new Error("can't find document")); }

      res.json(document);
    });
  });
});

// PUT an updated graph to the document
router.put('/:document/graph', auth, function(req, res, next) {
  Document.findOne({_id: req.document, student: req.payload._id}).exec(function (err, document) {
    if (err) { return next(err); }
    if (!document) { return next(new Error("can't find document")); }
    if (document.status !== "unsubmitted") { return next(new Error("this document is not allowed to be changed")); }

    document.updateGraph(req.body, function(err, graph) {
      if (err) { return next(err); }

      res.json(graph);
    });
  });
});

// PUT a new title to a document
router.put('/:document/title', auth, function(req, res, next) {
  Document.findOne({_id: req.document, student: req.payload._id}).exec(function (err, document) {
    if (err) { return next(err); }
    if (!document) { return next(new Error("can't find document")); }
    //if (document.status !== "unsubmitted") { return next(new Error("this document is not allowed to be changed")); }

    document.updateTitle(req.body.title, function(err, graph) {
      if (err) { return next(err); }

      res.json(graph);
    });
  });
});

// DELETE a document by ID
router.delete('/:document', auth, function(req, res, next) {
  Document.findOneAndRemove({_id: req.document._id, student: req.payload._id, status: "unsubmitted"}, function(err, document) {
    if (err) { return next(err); }
    if (!document) { return next("document can't be deleted"); }

    res.json(document);
  });
});

module.exports = router;
