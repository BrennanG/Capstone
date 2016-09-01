var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var Graph = mongoose.model('Graph');

// GET all graphs
router.get('/', function(req, res, next) {
  Graph.find(function(err, graphs) {
    if (err) { return next(err); }

    res.json(graphs);
  });
});

// POST a single graph
router.post('/', function(req, res, next) {
  var graph = new Graph(req.body);

  graph.save(function(err, graph) {
    if (err) { return next(err); }

    res.json(graph);
  });
});

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

// PUT an updated graph network data
router.put('/:graph/network/data', function(req, res, next) {
  req.graph.updateNetwork(req.body, function(err, graph) {
    if (err) { return next(err); }

    res.json(graph);
  });
});

// DELETE a graph by ID
router.delete('/:graph', function(req, res, next) {
  Graph.findOneAndRemove({_id: req.graph}, function(err, graph) {
    if (err) { return next(err); }

    res.json(graph);
  });
});

module.exports = router;
