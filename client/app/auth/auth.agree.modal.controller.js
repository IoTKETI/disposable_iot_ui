(function(){
  'use strict';


  angular
    .module('iotvtool')
    .controller('authAgreeModalController', AuthAgreeModalController)
  ;


  AuthAgreeModalController.$inject = ['$scope', '$state', 'type', 'close'];


  function AuthAgreeModalController($scope, $state, type, close) {

    $scope.type = type;
    $scope.typeName = type == 'eua' ? "이용약관" : "개인정보 관리방침";

    $scope.dismissModal = _dismissModal;

    function _dismissModal() {
      close(null, 200); // close, but give 200ms for bootstrap to animate
    }

  }



})();
