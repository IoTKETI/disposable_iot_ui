"use strict";

const express = require('express');
const router = express.Router();
const jwtDecoder = require('../utils/jwtDecoder');
const categoryManager = require('../managers/category.manager.js');


/* GET Category List */
router.get('/', jwtDecoder.authTokenMiddleware, function(req, res, next) {
  var email = req.decoded.u_e;
  categoryManager.getCategoryList(email)
    .then(function(categoryList){
      //  Success
      res.status(200).send(categoryList);

    }, function(err){
      //  Fail 
      res.status(500).send(err.message);
    })
});


/* GET Category Item */
router.get('/:categoryId', jwtDecoder.authTokenMiddleware, function(req, res, next) {
  var email = req.decoded.u_e;
  var categoryId = req.params.categoryId;
  categoryManager.getCategoryItem(email, categoryId)
    .then(function(categoryItem){
      //  Success
      res.status(200).send(categoryItem);

    }, function(err){
      //  Fail 
      res.status(500).send(err.message);
    })
});


module.exports = router;
