var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Graph = mongoose.model('Graph');
var Document = mongoose.model('Document');
var User = mongoose.model('User');
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
  User.findOne({ username: req.payload.username }).exec(function (err, user) {
    if (err) { return next(err); }
    if (!user) { return next(new Error("can't find user")); }

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
  User.findOne({ username: req.payload.username, document: doc._id }).exec(function (err, user) {
    if (err) { return next(err); }
    if (!user) { return next(new Error("can't find user")); }

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
  User.findOne({ username: req.payload.username, document: doc._id }).exec(function (err, user) {
    if (err) { return next(err); }
    if (!user) { return next(new Error("can't find user")); }

    Graph.findOneAndRemove({_id: req.graph}, function(err, graph) {
      if (err) { return next(err); }

      res.json(graph);
    });
  });
});

module.exports = router;
