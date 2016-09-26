var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Document = mongoose.model('Document');
var User = mongoose.model('User');
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
  User.findOne({ username: req.payload.username }).exec(function (err, user) {
    if (err) { return next(err); }
    if (!user) { return next(new Error("can't find user")); }

    Document.find({
        _id: { $in: user.documents }
     }, function (err, docs) {
       if (err) { return next(err); }

       res.json(docs);
     });
  });
});

// POST a single document
router.post('/', auth, function(req, res, next) {
  var document = new Document(req.body.document);
  User.findOne({ username: req.payload.username }).exec(function (err, user) {
    if (err) { return next(err); }
    if (!user) { return next(new Error("can't find user")); }

    document.save(function(err, document) {
      if (err) { return next(err); }

      user.documents.push(document);
      user.save(function(err, document) {
        if (err) { return next(err); }

        res.json(document);
      });
    });
  });
});

// GET a single document by ID
router.get('/:document', auth, function(req, res, next) {
  User.findOne({ username: req.payload.username, documents: req.document }).exec(function (err, user) {
    if (err) { return next(err); }
    if (!user) { return next(new Error("can't find user")); }

    req.document.populate('graph', function(err, document) {
      if (err) { return next(err); }

      res.json(document);
    });
  });
});

// DELETE a document by ID
router.delete('/:document', auth, function(req, res, next) {
  User.findOne({ username: req.payload.username, documents: req.document }).exec(function (err, user) {
    if (err) { return next(err); }
    if (!user) { return next(new Error("can't find user")); }

    Document.findOneAndRemove({_id: req.document._id}, function(err, document) {
      if (err) { return next(err); }

      res.json(document);
    });
  });
});

module.exports = router;
