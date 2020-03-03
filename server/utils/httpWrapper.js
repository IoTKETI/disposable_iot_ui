"use strict";

const Http = require('request-promise');
const logger = require('logger').createLogger();

var TARGET_URL = global.CONFIG.target_url;


/**
 * @method getResource
 * @param {string} resourceUrl URL like (Tasks, categories ...)
 * @param {string} query      query string for task
 * @returns {Promise}
 */
exports.getResource = function(resourceUrl, query) {

  if(!resourceUrl || resourceUrl.length < 1){
    throw new Error("resourceUrl is unusable data! please check your resourceUrl")
  }

  logger.debug( 'GetResource is called with url: ' + resourceUrl + ', query: ' + query);
  return new Promise(function(resolved, rejected) {

    var options = {
      method: 'GET',
      uri: `${TARGET_URL}/${resourceUrl}`,
      headers: {
        "Accept": "application/json",
        "Accept-Charset": "UTF-8"
      },
      json: true,
    }; 
    
    if (query) {
      options.id = query.id;
      options.name = query.name;
    }

    Http(options)
      .then(function(result) {
        logger.debug( 'success to get resource information ' + result );
        //result = result.body;
        resolved(result);
      })
      .catch(function(error) {
        logger.error( 'fail to get resource information ' + error );
        rejected(error);
      });
  });
};


/**
 * @method updateResource
 * @param {string} resourceUrl URL like (Tasks, categories ...)
 * @param {string} query      query string for task
 * @returns {Promise}
 */
exports.updateResource = function(resourceUrl, query) {

  if(!resourceUrl || resourceUrl.length < 1){
    throw new Error("resourceUrl is unusable data! please check your resourceUrl")
  }

  logger.debug( 'updateResource is called with url: ' + resourceUrl + ', query: ' + query);
  return new Promise(function(resolved, rejected) {

    var options = {
      method: 'PUT',
      uri: `${TARGET_URL}/${resourceUrl}`,
      body: query.item,
      headers: {
        "Accept": "application/json",
        "Accept-Charset": "UTF-8"
      },
      json: true,
    }; 

    Http(options)
      .then(function(result) {
        logger.debug( 'success to get resource information ' + result );
        //result = result.body;
        resolved(result);
      })
      .catch(function(error) {
        logger.error( 'fail to get resource information ' + error );
        rejected(error);
      });
  });
};


/**
 * @method createResource
 * @param {string} resourceUrl URL like (Tasks, categories ...)
 * @param {string} query      query string for task
 * @returns {Promise}
 */
exports.createResource = function(resourceUrl, query) {

  if(!resourceUrl || resourceUrl.length < 1){
    throw new Error("resourceUrl is unusable data! please check your resourceUrl")
  }

  logger.debug( 'createResource is called with url: ' + resourceUrl + ', query: ' + query);
  return new Promise(function(resolved, rejected) {

    var options = {
      method: 'POST',
      uri: `${TARGET_URL}/${resourceUrl}`,
      body: query.item,
      headers: {
        "Accept": "application/json",
        "Accept-Charset": "UTF-8"
      },
      json: true,
    }; 

    Http(options)
      .then(function(result) {
        logger.debug( 'success to get resource information ' + result );
        //result = result.body;
        resolved(result);
      })
      .catch(function(error) {
        logger.error( 'fail to get resource information ' + error );
        rejected(error);
      });
  });
};

