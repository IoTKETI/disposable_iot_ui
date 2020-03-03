'use strict';

const logger = require('logger').createLogger();
const httpWrapper = require('../utils/httpWrapper');
const UserModel = require("../models/user.model.js");
const OrchestrationModel = require("../models/orchestration.model.js");

////////////// LOCAL FUNCTIONS //////////////////////////////

////////////// EXTERNAL FUNCTIONS //////////////////////////////

// 클라우드를 통해 Task 목록을 조회하는 외부함수
function _getTaskList(params) {
  return new Promise( function(resolve, reject) {

    httpWrapper.getResource('Tasks', null)
    .then((result) => {
      resolve(result);      
    })
    .catch(err => {
      reject(err);
    })
  });      
}


// 클라우드를 통해 Task 정보를 조회하는 외부함수
function _getTaskItem(params, taskId) {
  return new Promise( function(resolve, reject) {

    httpWrapper.getResource(`tasks/${taskId}`, null)
    .then((result) => {
      resolve(result);      
    })
    .catch(err => {
      reject(err);
    })
  });      
}


// 로컬 DB에 수정된 Task 정보를 업데이트하는 외부함수
function _updateTaskItem(email, orchestrationId, nodeId, taskItem) {
  return new Promise( function(resolve, reject) {

    try {
      UserModel.findOneByUserEmail(email)
      .then((owner)=>{
        return OrchestrationModel.findOneById(owner, orchestrationId);
      })
      .then((orchestrationItem)=>{
        orchestrationItem.nodes.forEach(function (node) {
          if (node.nodeId === nodeId && node.nodeType === 'Device') {
            node.nodeData = taskItem;
          }
        });
        return OrchestrationModel.findOneAndUpdate(
          { _id: orchestrationItem._id},
          { $set: { nodes: orchestrationItem.nodes } },
          { new: true }
        ).exec();
      })
      .then((orchestrationItem)=>{
          resolve(orchestrationItem);  
      })     
      .catch((err)=>{
        logger.error(err);
        reject(err);
      });
    } catch(ex) {
      logger.error(ex);
      reject(ex);
    }
    /*
    var query = {
      item: taskItem
    };

    httpWrapper.updateResource(`tasks/${taskItem.id}`, query)
    .then((result) => {5
      resolve(result);      
    })
    .catch(err => {
      reject(err);
    })
    */
  });      
}


// EXPORT FUNCTIONS ////////////////////////////////////////////////////////
module.exports.getTaskList = _getTaskList;
module.exports.getTaskItem = _getTaskItem;
module.exports.updateTaskItem = _updateTaskItem;
