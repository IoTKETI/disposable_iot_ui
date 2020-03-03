(function() {
  'use strict';

  angular
    .module('iotvtool')
    .service('apiService', ApiService);


  ApiService.$inject = ['$http', 'notificationService', 'authService'];

  function ApiService($http, notificationService, authService) {

    return {
      // CATEGORY, TASK API
      getCategoryList: _getCategoryList,
      getCategoryItem: _getCategoryItem,
      getTaskList: _getTaskList,
      getTaskItem: _getTaskItem,
      updateTaskItem: _updateTaskItem,
      // ORCHESTRATION API
      getOrchestrationList: _getOrchestrationList,
      getOrchestrationItem: _getOrchestrationItem,
      createOrchestrationItem: _createOrchestrationItem,
      updateOrchestrationItem: _updateOrchestrationItem,
      deleteOrchestrationItem: _deleteOrchestrationItem,
      deployOrchestrationItem: _deployOrchestrationItem,
    };


    function _getCategoryList() {
      return new Promise(function(resolve, reject) {

        try {
          var httpOptions = {
            url: window.API_BASE_URL + '/category',
            method: "GET"
          };
          authService.addAccessTokenHeader(httpOptions);

          $http(httpOptions)
            .then(function(response){
              resolve(response.data);
            })
            .catch(function(err){
              notificationService.showErrorMessage(err);
              reject(err);
            });
        }
        catch(ex) {
          console.error(ex);
          reject(ex);
        }

      });
    }

    function _getCategoryItem(categoryId) {
      return new Promise(function(resolve, reject) {

        try {
          var httpOptions = {
            url: window.API_BASE_URL + `/category/${categoryId}`,
            method: "GET"
          };
          authService.addAccessTokenHeader(httpOptions);

          $http(httpOptions)
            .then(function(response){
              resolve(response.data);
            })
            .catch(function(err){
              notificationService.showErrorMessage(err);
              reject(err);
            });
        }
        catch(ex) {
          console.error(ex);
          reject(ex);
        }

      });
    } 

    function _getTaskList() {
      return new Promise(function(resolve, reject) {

        try {
          var httpOptions = {
            url: window.API_BASE_URL + '/task',
            method: "GET"
          };
          authService.addAccessTokenHeader(httpOptions);

          $http(httpOptions)
            .then(function(response){
              resolve(response.data);
            })
            .catch(function(err){
              notificationService.showErrorMessage(err);
              reject(err);
            });
        }
        catch(ex) {
          console.error(ex);
          reject(ex);
        }

      });
    }

    function _getTaskItem(taskId) {
      return new Promise(function(resolve, reject) {

        try {
          var httpOptions = {
            url: window.API_BASE_URL + `/task/${taskId}`,
            method: "GET"
          };
          authService.addAccessTokenHeader(httpOptions);

          $http(httpOptions)
            .then(function(response){
              resolve(response.data);
            })
            .catch(function(err){
              notificationService.showErrorMessage(err);
              reject(err);
            });
        }
        catch(ex) {
          console.error(ex);
          reject(ex);
        }

      });
    }  


    function _updateTaskItem(orchestrationId, nodeId, taskItem) {
      return new Promise(function(resolve, reject) {

        try {
          var httpOptions = {
            url: window.API_BASE_URL + `/task`,
            method: "PUT",
            data : {
              orchestrationId : orchestrationId,
              nodeId : nodeId,
              taskItem : taskItem
            }
          };
          authService.addAccessTokenHeader(httpOptions);

          $http(httpOptions)
            .then(function(response){
              resolve(response.data);
            })
            .catch(function(err){
              notificationService.showErrorMessage(err);
              reject(err);
            });
        }
        catch(ex) {
          console.error(ex);
          reject(ex);
        }

      });
    }  


    function _getOrchestrationList() {
      return new Promise(function(resolve, reject) {

        try {
          var httpOptions = {
            url: window.API_BASE_URL + '/orchestration',
            method: "GET"
          };
          authService.addAccessTokenHeader(httpOptions);

          $http(httpOptions)
            .then(function(response){
              resolve(response.data);
            })
            .catch(function(err){
              notificationService.showErrorMessage(err);
              reject(err);
            });
        }
        catch(ex) {
          console.error(ex);
          reject(ex);
        }

      });
    }


    function _getOrchestrationItem(orchestrationId) {
      return new Promise(function(resolve, reject) {

        try {
          var httpOptions = {
            url: window.API_BASE_URL + '/orchestration/' + orchestrationId,
            method: "PUT",
            data: orchestrationItem
          };
          authService.addAccessTokenHeader(httpOptions);

          $http(httpOptions)
            .then(function(response){
              resolve(response.data);
            })
            .catch(function(err){
              notificationService.showErrorMessage(err);
              reject(err);
            });
        }
        catch(ex) {
          console.error(ex);
          reject(ex);
        }

      });
    }


    function _createOrchestrationItem(orchestrationItem) {
      return new Promise(function(resolve, reject) {

        try {
          var httpOptions = {
            url: window.API_BASE_URL + '/orchestration',
            method: "POST",
            data: orchestrationItem
          };
          authService.addAccessTokenHeader(httpOptions);

          $http(httpOptions)
            .then(function(response){
              resolve(response.data);
            })
            .catch(function(err){
              notificationService.showErrorMessage(err);
              reject(err);
            });
        }
        catch(ex) {
          console.error(ex);
          reject(ex);
        }

      });
    }


    function _updateOrchestrationItem(orchestrationId, orchestrationItem) {
      return new Promise(function(resolve, reject) {

        try {
          var httpOptions = {
            url: window.API_BASE_URL + '/orchestration/' + orchestrationId,
            method: "PUT",
            data: orchestrationItem
          };
          authService.addAccessTokenHeader(httpOptions);

          $http(httpOptions)
            .then(function(response){
              resolve(response.data);
            })
            .catch(function(err){
              notificationService.showErrorMessage(err);
              reject(err);
            });
        }
        catch(ex) {
          console.error(ex);
          reject(ex);
        }

      });
    }


    function _deleteOrchestrationItem(orchestrationId) {
      return new Promise(function(resolve, reject) {

        try {
          var httpOptions = {
            url: window.API_BASE_URL + '/orchestration/' + orchestrationId,
            method: "DELETE"
          };
          authService.addAccessTokenHeader(httpOptions);

          $http(httpOptions)
            .then(function(response){
              resolve(response.data);
            })
            .catch(function(err){
              notificationService.showErrorMessage(err);
              reject(err);
            });
        }
        catch(ex) {
          console.error(ex);
          reject(ex);
        }

      });
    }


    function _deployOrchestrationItem(orchestrationItem) {
      return new Promise(function(resolve, reject) {

        try {
          var httpOptions = {
            url: window.API_BASE_URL + '/orchestration/deploy/' + orchestrationItem.id,
            method: "PUT"
          };
          authService.addAccessTokenHeader(httpOptions);

          $http(httpOptions)
            .then(function(response){
              resolve(response.data);
            })
            .catch(function(err){
              notificationService.showErrorMessage(err);
              reject(err);
            });
        }
        catch(ex) {
          console.error(ex);
          reject(ex);
        }

      });
    }


  }
})();
