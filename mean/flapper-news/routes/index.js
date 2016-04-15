var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var Post = mongoose.model('Post');
var Comment = mongoose.model('Comment');
var Document = mongoose.model('Document');
var Graph = mongoose.model('Graph');

// GET home page
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

// GET all posts
router.get('/posts', function(req, res, next) {
  Post.find(function(err, posts) {
    if (err) { return next(err); }

    res.json(posts);
  });
});

// POST a single post
router.post('/posts', function(req, res, next) {
  var post = new Post(req.body);

  post.save(function(err, post) {
    if (err) { return next(err); }

    res.json(post);
  });
});

// get a post by ID
router.param('post', function(req, res, next, id) {
  var query = Post.findById(id);

  query.exec(function (err, post) {
    if (err) { return next(err); }
    if (!post) { return next(new Error("can't find post")); }

    req.post = post;
    return next();
  });
});

// get a comment by ID
router.param('comment', function(req, res, next, id) {
  var query = Comment.findById(id);

  query.exec(function (err, comment) {
    if (err) { return next(err); }
    if (!comment) { return next(new Error("can't find comment")); }

    req.comment = comment;
    return next();
  });
});

// GET a single post by ID
router.get('/posts/:post', function(req, res, next) {
  req.post.populate('comments', function(err, post) {
    if (err) { return next(err); }

    res.json(post);
  });
});

// PUT an upvote for a post by ID
router.put('/posts/:post/upvote', function(req, res, next) {
  req.post.upvote(function(err, post) {
    if (err) { return next(err); }

    res.json(post);
  });
});

// POST a comment to a post
router.post('/posts/:post/comments', function(req, res, next) {
  // Create a new comment and set its post and body values
  var comment = new Comment(req.body);
  comment.post = req.post;

  // Save the comment
  comment.save(function(err, comment) {
    if (err) { return next(err); }

    // Add the comment to the post's comment array
    req.post.comments.push(comment);
    // Save the post
    req.post.save(function(err, post) {
      if (err) { return next(err); }

      res.json(comment);
    });
  });
});

// PUT an upvote for a comment by ID
router.put('/posts/:post/comments/:comment/upvote', function(req, res, next) {
  req.comment.upvote(function(err, post) {
    if (err) { return next(err); }

    res.json(post);
  });
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
