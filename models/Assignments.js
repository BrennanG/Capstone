var mongoose = require('mongoose');

var AssignmentSchema = new mongoose.Schema({
  title: String,
  description: String,
  teachers: [{type: mongoose.Schema.Types.ObjectId, ref: 'Teacher'}],
  section: {type: mongoose.Schema.Types.ObjectId, ref: 'Section'},
  submissions: [{student: {type: mongoose.Schema.Types.ObjectId, ref: 'Student'},
                 graph: {type: mongoose.Schema.Types.ObjectId, ref: 'Graph'}}]
});

mongoose.model('Assignment', AssignmentSchema);
