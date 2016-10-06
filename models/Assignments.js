var mongoose = require('mongoose');

var AssignmentSchema = new mongoose.Schema({
  title: String,
  description: String,
  teachers: [{type: mongoose.Schema.Types.ObjectId, ref: 'Teacher'}],
  section: {type: mongoose.Schema.Types.ObjectId, ref: 'Section'},
  submissions: [{type: mongoose.Schema.Types.ObjectId, ref: 'Document'}]
});

mongoose.model('Assignment', AssignmentSchema);
