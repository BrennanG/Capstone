var mongoose = require('mongoose');

var DocumentSchema = new mongoose.Schema({
  title: String,
  student: {type: mongoose.Schema.Types.ObjectId, ref: 'Student'},
  //graph: {type: mongoose.Schema.Types.ObjectId, ref: 'Graph'}
  graph: {nodes: [String], edges: [String], undoStack: [String]}
});

DocumentSchema.methods.updateGraph = function(data, cb) {
  this.graph.nodes = data.nodes;
  this.graph.edges = data.edges;
  this.graph.undoStack = data.undoStack;
  this.save(cb);
};

mongoose.model('Document', DocumentSchema);
