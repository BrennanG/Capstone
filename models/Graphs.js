var mongoose = require('mongoose');

var GraphSchema = new mongoose.Schema({
  nodes: [String],
  edges: [String],
  undoStack: [String]
});

GraphSchema.methods.updateNetwork = function(data, cb) {
  this.nodes = data.nodes;
  this.edges = data.edges;
  this.undoStack = data.undoStack;
  this.save(cb);
};

mongoose.model('Graph', GraphSchema);
