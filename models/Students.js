var mongoose = require('mongoose');
var crypto = require('crypto');
var jwt = require('jsonwebtoken');
require('mongoose-type-email');

var StudentSchema = new mongoose.Schema({
  email: {type: mongoose.SchemaTypes.Email, unique: true},
  hash: String,
  salt: String,
  documents: [{type: mongoose.Schema.Types.ObjectId, ref: 'Document'}],
  sections: [{type: mongoose.Schema.Types.ObjectId, ref: 'Section'}]
});

StudentSchema.methods.generateJWT = function() {
  // set expiration to 60 days
  var today = new Date();
  var exp = new Date(today);
  exp.setDate(today.getDate() + 60);

  return jwt.sign({
    _id: this._id,
    email: this.email,
    exp: parseInt(exp.getTime() / 1000),
  }, 'SECRET');
};

StudentSchema.methods.setPassword = function(password){
  this.salt = crypto.randomBytes(16).toString('hex');

  this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');
};

StudentSchema.methods.validPassword = function(password) {
  var hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');

  return this.hash === hash;
};

mongoose.model('Student', StudentSchema);
