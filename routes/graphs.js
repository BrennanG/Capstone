var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Graph = mongoose.model('Graph');
var Document = mongoose.model('Document');
var Student = mongoose.model('Student');
var jwt = require('express-jwt');
var auth = jwt({secret: 'SECRET', userProperty: 'payload'});


// get a graph by ID
router.param('graph', function(req, res, next, id) {
  var query = Graph.findById(id);

  query.exec(function (err, graph) {
    if (err) { return next(err); }
    if (!graph) { return next(new Error("can't find graph")); }

    req.graph = graph;
    return next();
  });
});

// POST a single graph
router.post('/', auth, function(req, res, next) {
  var graph = new Graph(req.body.graph);
  Student.findOne({ username: req.payload.username }).exec(function (err, student) {
    if (err) { return next(err); }
    if (!student) { return next(new Error("can't find student")); }

    graph.save(function(err, graph) {
      if (err) { return next(err); }

      res.json(graph);
    });
  });
});

// PUT an updated graph network data
router.put('/:graph/network', auth, function(req, res, next) {
  var doc = Document.findOne({graph: req.graph}).exec(function (err, document) {
    if (err) { return next(err); }
    if (!doc) { return next(new Error("can't find graph")); }

    return document;
  });
  Student.findOne({ username: req.payload.username, document: doc._id }).exec(function (err, student) {
    if (err) { return next(err); }
    if (!student) { return next(new Error("can't find student")); }

    req.graph.updateNetwork(req.body, function(err, graph) {
      if (err) { return next(err); }

      res.json(graph);
    });
  });
});

// DELETE a graph by ID
router.delete('/:graph', auth, function(req, res, next) {
  var doc = Document.findOne({graph: req.graph}).exec(function (err, document) {
    if (err) { return next(err); }
    if (!doc) { return next(new Error("can't find graph")); }

    return document;
  });
  Student.findOne({ username: req.payload.username, document: doc._id }).exec(function (err, student) {
    if (err) { return next(err); }
    if (!student) { return next(new Error("can't find student")); }

    Graph.findOneAndRemove({_id: req.graph}, function(err, graph) {
      if (err) { return next(err); }

      res.json(graph);
    });
  });
});

module.exports = router;
