var mongoose = require('mongoose');

var DocumentSchema = new mongoose.Schema({
  title: String,
  graph: {type: mongoose.Schema.Types.ObjectId, ref: 'Graph'}
});

mongoose.model('Document', DocumentSchema);
