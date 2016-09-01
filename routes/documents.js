var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var Document = mongoose.model('Document');

// GET all documents
router.get('/', function(req, res, next) {
  Document.find(function(err, documents) {
    if (err) { return next(err); }

    res.json(documents);
  });
});

// POST a single document
router.post('/', function(req, res, next) {
  var document = new Document(req.body);

  document.save(function(err, document) {
    if (err) { return next(err); }

    res.json(document);
  });
});

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

// GET a single document by ID
router.get('/:document', function(req, res, next) {
  req.document.populate('graph', function(err, document) {
    if (err) { return next(err); }

    res.json(document);
  });
});

// DELETE a document by ID
router.delete('/:document', function(req, res, next) {
  Document.findOneAndRemove({_id: req.document._id}, function(err, document) {
    if (err) { return next(err); }

    res.json(document);
  });
});

module.exports = router;
