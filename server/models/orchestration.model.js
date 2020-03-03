"use strict";

var mongoose = require('mongoose')
var timestamps = require('mongoose-timestamp');
var shortid = require('shortid');
var logger = require('logger').createLogger();

var Schema = mongoose.Schema;


var OrchestrationModel = new Schema({
  id: {
    type: String,
    default: shortid.generate
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  name: String,
  description: String,
  color: String,
  status: String,
  nodes: [
    Schema.Types.Mixed
  ]
},{ minimize: false });


// create a new user document
OrchestrationModel.statics.create = function(owner, orchestrationItem) {
  var doc = new this({
    owner: owner,
    name: orchestrationItem.name,
    description: orchestrationItem.description,
    color: orchestrationItem.color,
    status: 'READY',
    nodes: orchestrationItem.nodes
  })

  // return the Promise
  return doc.save();
}


// delete a user document
OrchestrationModel.statics.delete = function(owner, id) {
  return this.deleteOne(
    {
      owner: owner,
      id: id
    });
}

// update a user document
OrchestrationModel.statics.update = function(owner, id, orchestrationItem) {
  return new Promise((resolve, reject)=>{
    try {
      this.findOne({ id, owner }).exec()
        .then((doc)=>{
          if(!doc) {
            throw new Error('User document not found');
          }

          if(orchestrationItem.name) doc.name = orchestrationItem.name;
          if(orchestrationItem.description) doc.description = orchestrationItem.description;
          if(orchestrationItem.color) doc.color = orchestrationItem.color;
          if(orchestrationItem.status) doc.status = orchestrationItem.status;
          if(orchestrationItem.nodes) doc.nodes = orchestrationItem.nodes;

          return doc.save();
        })

        .then((doc)=>{
          resolve(doc);
        })

        .catch((err)=>{
          logger.error("Error", err);
          reject(err);
        })
    }
    catch(ex) {
      logger.error("Exception", ex);
      reject(ex);
    }
  });
}


// find a user document
OrchestrationModel.statics.findOneById = function(owner, id) {
  return this.findOne({
    id,
    owner
  }).exec()
}


// get user document list
OrchestrationModel.statics.list = function(owner) {
  return this.find({
    owner
  }).exec()
}


OrchestrationModel.plugin(timestamps);


module.exports = mongoose.model('orchestration', OrchestrationModel);