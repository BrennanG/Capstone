var mongoose = require('mongoose');

var SectionSchema = new mongoose.Schema({
  title: String,
  teachers: [{type: mongoose.Schema.Types.ObjectId, ref: 'Teacher'}],
  students: [{type: mongoose.Schema.Types.ObjectId, ref: 'Student'}]/*,
  assignments: [{type: mongoose.Schema.Types.ObjectId, ref: 'Assignment'}]*/
});

mongoose.model('Section', SectionSchema);
