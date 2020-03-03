(function() {
  'use strict';

  angular
    .module('iotvtool')
    .service('notificationService', NotificationService);


  NotificationService.$inject = ['$rootScope', '$state', '$mdToast'];

  function NotificationService($rootScope, $state, $mdToast) {

    var services = {


      "on": _on,
      "off": _off,
      "emit": _emit,
      "broadcast": _broadcast,

      "pushHandler": _pushHandler,

      "showErrorMessage": _showErrorMessage,
      "showInfoMessage": _showInfoMessage
    };
    return services;


    function _on(scope, mesg, handler) {
      scope.$on(mesg, handler);
    }

    function _off(scope, mesg, handler) {
      scope.$off(mesg, handler);
    }

    function _emit(scope, mesg, args) {
      scope.$emit(mesg, args);
    }

    function _broadcast(scope, mesg, args) {
      scope.$broadcast(mesg, args);
    }



    function _pushHandler(mesg) {
      var type = mesg.type;
      var data = mesg.data;

      _broadcast($rootScope, type, data);
    }



    function __getMessage(err) {
      var errorMesg = '';

      if(typeof err === 'string') {
        errorMesg = err;
      }
      else {
        if(err.status) {
          errorMesg = ['[', err.status, ']', ' ', err.statusText, '\r\n'].join('');
        }

        if(err.data) {
          errorMesg += (err.data.message||err.data) + '\r\n';
        }

        if(errorMesg === '')
          errorMesg = err.toString();
      }

      return errorMesg;
    }

    function _showErrorMessage(err, force) {
      var errorMesg = __getMessage(err);

      if(!force && err.status && (err.status == 401||err.status == 403)) {
        $state.go('login');
      }
      else {
        $mdToast.show($mdToast.simple().textContent(errorMesg));
      }
    }

    function _showInfoMessage(err) {
      var errorMesg = __getMessage(err);

      $mdToast.show($mdToast.simple().textContent(errorMesg));
    }
  }

})();
