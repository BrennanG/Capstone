var mongoose = require('mongoose');

var GraphSchema = new mongoose.Schema({
  network: { dataSchema: {nodes: Array, edges: Array}, data: {nodes: Array, edges: Array} }//,
  //options: {}
});

GraphSchema.methods.updateNetwork = function(data, cb) {
  this.network.data = data;
  this.save(cb);
};

mongoose.model('Graph', GraphSchema);
