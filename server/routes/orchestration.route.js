"use strict";

const express = require('express');
const router = express.Router();
const jwtDecoder = require('../utils/jwtDecoder');
const orchestrationManager = require('../managers/orchestration.manager.js')


/* GET orchestration list */
router.get('/', jwtDecoder.authTokenMiddleware, function(req, res, next) {
  var email = req.decoded.u_e;

  orchestrationManager.getOrchestrationList(email)
    .then(function(orchestrationList){
      //  Success
      res.status(200).send(orchestrationList);

    }, function(err){
      //  Fail
      res.status(500).send(err.message);
    })
});


/* GET orchestration item */
router.get('/:id', jwtDecoder.authTokenMiddleware, function(req, res, next) {
  var email = req.decoded.u_e;
  var id = req.params.id;

  orchestrationManager.getOrchestrationItem(email, id)
    .then(function(orchestrationItem){
      //  Success
      res.status(200).send(orchestrationItem);

    }, function(err){
      //  Fail
      res.status(500).send(err.message);
    })
});


/* POST create orchestration item */
router.post('/', jwtDecoder.authTokenMiddleware, function(req, res, next) {
  var email = req.decoded.u_e;
  var item = req.body;

  orchestrationManager.createOrchestrationItem(email, item)
    .then(function(orchestrationItem){
      //  Success
      res.status(200).send(orchestrationItem);

    }, function(err){
      //  Fail
      res.status(500).send(err.message);
    })
});


/* PUT update orchestration item */
router.put('/:id', jwtDecoder.authTokenMiddleware, function(req, res, next) {
  var email = req.decoded.u_e;
  var id = req.params.id;
  var item = req.body;

  orchestrationManager.updateOrchestrationItem(email, id, item)
    .then(function(orchestrationItem){
      //  Success
      res.status(200).send(orchestrationItem);

    }, function(err){
      //  Fail
      res.status(500).send(err.message);
    })
});


/* DELETE orchestration item */
router.delete('/:id', jwtDecoder.authTokenMiddleware, function(req, res, next) {
  var email = req.decoded.u_e;
  var id = req.params.id;

  orchestrationManager.deleteOrchestrationItem(email, id)
    .then(function(orchestrationItemId){
      //  Success
      res.status(200).send(orchestrationItemId);

    }, function(err){
      //  Fail
      res.status(500).send(err.message);
    })
});


/* PUT deploy orchestration item */
router.put('/deploy/:id', jwtDecoder.authTokenMiddleware, function(req, res, next) {
  var email = req.decoded.u_e;
  var id = req.params.id;

  orchestrationManager.deployOrchestrationItem(email, id)
    .then(function(orchestrationItem){
      //  Success
      res.status(200).send(orchestrationItem);

    }, function(err){
      //  Fail
      res.status(500).send(err.message);
    })
});


module.exports = router;
