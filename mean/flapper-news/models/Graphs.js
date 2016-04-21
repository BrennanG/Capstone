var mongoose = require('mongoose');

var GraphSchema = new mongoose.Schema({
  nodes: [String],
  edges: [String]
});

GraphSchema.methods.updateNetwork = function(data, cb) {
  this.nodes = data.nodes;
  this.edges = data.edges;
  this.save(cb);
};

mongoose.model('Graph', GraphSchema);
