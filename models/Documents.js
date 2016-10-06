var mongoose = require('mongoose');

var DocumentSchema = new mongoose.Schema({
  title: String,
  student: {type: mongoose.Schema.Types.ObjectId, ref: 'Student'},
  graph: {type: mongoose.Schema.Types.ObjectId, ref: 'Graph'}
});

mongoose.model('Document', DocumentSchema);
