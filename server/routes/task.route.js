"use strict";

const express = require('express');
const router = express.Router();
const jwtDecoder = require('../utils/jwtDecoder');
const taskManager = require('../managers/task.manager.js');


/* GET Task List */
router.get('/', jwtDecoder.authTokenMiddleware, function(req, res, next) {
  var email = req.decoded.u_e;
  taskManager.getTaskList(email)
    .then(function(taskList){
      //  Success
      res.status(200).send(taskList);

    }, function(err){
      //  Fail 
      res.status(500).send(err.message);
    })
});


/* GET Task Item */
router.get('/:taskId', jwtDecoder.authTokenMiddleware, function(req, res, next) {
  var email = req.decoded.u_e;
  var taskId = req.params.taskId;
  taskManager.getTaskItem(email, taskId)
    .then(function(taskItem){
      //  Success
      res.status(200).send(taskItem);

    }, function(err){
      //  Fail 
      res.status(500).send(err.message);
    })
});


/* UPDATE Task Item */
router.put('/', jwtDecoder.authTokenMiddleware, function(req, res, next) {
  var email = req.decoded.u_e;
  var orchestrationId = req.body.orchestrationId;
  var nodeId = req.body.nodeId;
  var taskItem = req.body.taskItem;
  taskManager.updateTaskItem(email, orchestrationId, nodeId, taskItem)
    .then(function(taskItem){
      //  Success
      res.status(200).send(taskItem);

    }, function(err){
      //  Fail 
      res.status(500).send(err.message);
    })
});


module.exports = router;
