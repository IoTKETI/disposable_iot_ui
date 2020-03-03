"use strict";

var mongoose = require('mongoose');
var mongoose_timestamp = require('mongoose-timestamp');


var Schema = new mongoose.Schema({
  userid : {type : mongoose.SchemaTypes.ObjectId, required : true},
  refreshToken : {type : mongoose.SchemaTypes.String, required : true}
});


Schema.plugin(mongoose_timestamp);


module.exports = mongoose.model('auth_token', Schema);