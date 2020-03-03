'use strict';

const httpWrapper = require('../utils/httpWrapper');
const logger = require('logger').createLogger();


////////////// LOCAL FUNCTIONS //////////////////////////////

////////////// EXTERNAL FUNCTIONS //////////////////////////////

// 클라우드를 통해 Category 목록을 조회하는 외부함수
function _getCategoryList(params) {
  return new Promise( function(resolve, reject) {

    httpWrapper.getResource('categories', null)
    .then((result) => {
      resolve(result);      
    })
    .catch(err => {
      reject(err);
    })
  });      
}


// 클라우드를 통해 Category 정보를 조회하는 외부함수
function _getCategoryItem(params, categoryId) {
  return new Promise( function(resolve, reject) {

    httpWrapper.getResource(`categories/${categoryId}`, null)
    .then((result) => {
      resolve(result);      
    })
    .catch(err => {
      reject(err);
    })
  });      
}


// EXPORT FUNCTIONS ////////////////////////////////////////////////////////
module.exports.getCategoryList = _getCategoryList;
module.exports.getCategoryItem = _getCategoryItem;