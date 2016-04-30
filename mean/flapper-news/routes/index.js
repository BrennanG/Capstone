var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var Document = mongoose.model('Document');
var Graph = mongoose.model('Graph');

// GET home page
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

///////////// DOCUMENTS /////////////////

// GET all documents
router.get('/documents', function(req, res, next) {
  Document.find(function(err, documents) {
    if (err) { return next(err); }

    res.json(documents);
  });
});

// POST a single document
router.post('/documents', function(req, res, next) {
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
router.get('/documents/:document', function(req, res, next) {
  req.document.populate('graph', function(err, document) {
    if (err) { return next(err); }

    res.json(document);
  });
});

///////////// GRAPHS /////////////////

// GET all graphs
router.get('/graphs', function(req, res, next) {
  Graph.find(function(err, graphs) {
    if (err) { return next(err); }

    res.json(graphs);
  });
});

// POST a single graph
router.post('/graphs', function(req, res, next) {
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
router.put('/graphs/:graph/network/data', function(req, res, next) {
  req.graph.updateNetwork(req.body, function(err, graph) {
    if (err) { return next(err); }

    res.json(graph);
  });
});

module.exports = router;
