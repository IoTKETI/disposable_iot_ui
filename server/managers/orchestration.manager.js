'use strict';

const logger = require('logger').createLogger();
const httpWrapper = require('../utils/httpWrapper');
const UserModel = require("../models/user.model.js");
const OrchestrationModel = require("../models/orchestration.model.js");


////////////// LOCAL FUNCTIONS //////////////////////////////

// 클라우드에 서비스 템플릿 배포(deploy)를 위한 데이터 변환 내부함수
function makeServiceTemplateData(item) {
  return new Promise( function(resolve, reject) {
    try {    
      var stData = new Object(); 
      var stDataServices = new Array();
      var stDataMicroServices = new Array();
      var stDataTasks = new Array();

      // service template 기본정보 설정
      stData.id = item.id;
      stData.name = item.name;
      stData.creator = item._id.toString();
      stData.description = item.description;
      stData.createTime = item.createdAt.toString();

      // service, micro service, task 분리
      item.nodes.forEach(function (node) {
        if (node.nodeType === 'Service') {
          stDataServices.push(node);
        } else if (node.nodeType === "MicroService") {
          stDataMicroServices.push(node);
        } else {
          stDataTasks.push(node);
        }    
      });

      // service, micro service, task 연결
      stData.service = new Array();
      // service
      stDataServices.forEach(function(s) {
        s.nodeData.microservices = new Array();
        // micro service
        stDataMicroServices.forEach(function(ms) {
          ms.nodeData.tasks = new Array();
          // micro service의 연결 링크들 비교
          ms.links.forEach(function(l) {
            if (s.nodeId === l.to) {
              s.nodeData.microservices.push(ms.nodeData);
            }
          });
          // task가 micro service에 포함되었는지 확인
          stDataTasks.forEach(function(t) {
            // task의 연결 링크들 비교
            t.links.forEach(function(l) {
              if (ms.nodeId === l.to) {
                ms.nodeData.tasks.push(t.nodeData);
              }
            });
          });
        });
        stData.service.push(s.nodeData);
      });

      resolve(stData);
    } catch(ex) {
      logger.error(ex);
      reject(ex);
    }
  }); 
}


////////////// EXTERNAL FUNCTIONS //////////////////////////////

// 클라우드에 저장된 Orchestration 목록을 조회하는 외부함수
function _getOrchestrationList(email) {
  return new Promise( function(resolve, reject) {
    try {     
      UserModel.findOneByUserEmail(email)
        .then((owner)=>{
          return OrchestrationModel.list(owner);
        })
        .then((orchestrationList)=>{
          resolve(orchestrationList);
        })
        .catch((err)=>{
          logger.error(err);
          reject(err);
        });
    } catch(ex) {
      logger.error(ex);
      reject(ex);
    }
  });      
}


// 로컬 DB에 Orchestration Item을 얻기 위한 외부함수
function _getOrchestrationItem(email, id) {
  return new Promise( function(resolve, reject) {

    try {
      UserModel.findOneByUserEmail(email)
        .then((owner)=>{
          return OrchestrationModel.findOneById(owner, id);
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

  });      
}


// 로컬 DB에 Orchestration Item 생성을 위한 외부함수
function _createOrchestrationItem(email, item) {
  return new Promise( function(resolve, reject) {

    try {
      UserModel.findOneByUserEmail(email)
        .then((owner)=>{
          return OrchestrationModel.create(owner, item);
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

  });      
}


// 로컬 DB에 저장된 Orchestration Item 업데이트를 위한 외부함수
function _updateOrchestrationItem(email, id, item) {
  return new Promise( function(resolve, reject) {

    try {
      UserModel.findOneByUserEmail(email)
        .then((owner)=>{
          return OrchestrationModel.update(owner, id, item);
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

  });      
}


// 로컬 DB에 저장된 Orchestration Item을 삭제하기 위한 외부함수
function _deleteOrchestrationItem(email, id) {
  return new Promise( function(resolve, reject) {

    try {
      UserModel.findOneByUserEmail(email)
        .then((owner)=>{
          return OrchestrationModel.delete(owner, id);
        })
        .then((result)=>{
          resolve(id);
        })
        .catch((err)=>{
          logger.error(err);
          reject(err);
        });
    } catch(ex) {
      logger.error(ex);
      reject(ex);
    }

  });      
}


// 클라우드에 Orchestration Item을 Deploy하기 위한 외부함수
function _deployOrchestrationItem(email, id) {
  return new Promise( function(resolve, reject) {

    try {
      UserModel.findOneByUserEmail(email)
        .then((owner)=>{
          return OrchestrationModel.findOneById(owner, id);
        })
        .then((orchestrationItem)=>{
          return makeServiceTemplateData(orchestrationItem);
        })
        .then((serviceTemplate)=> {
          console.log(JSON.stringify(serviceTemplate));
          var query = {
            item: serviceTemplate
          };
          httpWrapper.createResource(`deployService/task`, query)
          .then((result) => {
            resolve(result);      
          })
          .catch(err => {
            reject(err);
          })
        })
        .catch((err)=>{
          logger.error(err);
          reject(err);
        });
    } catch(ex) {
      logger.error(ex);
      reject(ex);
    }

  });      
}


// EXPORT FUNCTIONS ////////////////////////////////////////////////////////
module.exports.getOrchestrationList = _getOrchestrationList;
module.exports.getOrchestrationItem = _getOrchestrationItem;
module.exports.createOrchestrationItem = _createOrchestrationItem;
module.exports.updateOrchestrationItem = _updateOrchestrationItem;
module.exports.deleteOrchestrationItem = _deleteOrchestrationItem;
module.exports.deployOrchestrationItem = _deployOrchestrationItem;
