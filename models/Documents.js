var mongoose = require('mongoose');

// When we update a graph, we don't want to change the document

var DocumentSchema = new mongoose.Schema({
  title: String,
  graph: {type: mongoose.Schema.Types.ObjectId, ref: 'Graph'}
});

mongoose.model('Document', DocumentSchema);
