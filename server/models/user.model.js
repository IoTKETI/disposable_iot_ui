"use strict";

var mongoose = require('mongoose');
var mongoose_timestamp = require('mongoose-timestamp');

var UserModel = new mongoose.Schema({
  email : {type : mongoose.SchemaTypes.String, unique : true},
  password : {type : mongoose.SchemaTypes.String}, 
  name : {type : mongoose.SchemaTypes.String},
  salt : {type : mongoose.SchemaTypes.String},
});


// find one user by using user email
UserModel.statics.findOneByUserEmail = function(email) {
  return this.findOne({
    email
  }).exec()
}


// find all users
UserModel.statics.findAllUsers = function() {
  return this.find().exec();
}


UserModel.plugin(mongoose_timestamp);


module.exports = mongoose.model('User', UserModel);