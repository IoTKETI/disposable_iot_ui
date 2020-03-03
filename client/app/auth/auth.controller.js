(function(){
  'use strict';


  angular
    .module('iotvtool')
    .controller('authController', AuthController)
  ;



  AuthController.$inject = ['$scope', '$state', '$stateParams', 'authService', 'notificationService' ];


  function AuthController($scope, $state, $stateParams, authService, notificationService) {

    $scope.formData = {
      "login": {
        "email": "",
        "password": ""
      },

      "signup": {
        "name": "",
        "email": "",
        "password": "",
        "password2": ""
      },

      "change": {
        "password": "",
        "password2": ""
      },

      "reset": {
        "email": ""
      }
    }

    $scope.init = _init;
    $scope.login = _login;
    $scope.signup = _signup;
    $scope.passwordResetRequest = _passwordResetRequest;
    $scope.changePassword = _changePassword;
    $scope.checkPasswordStrength = _checkPasswordStrength;
    $scope.disableSignupButton = _disableSignupButton;
    $scope.disableChangeButton = _disableChangeButton;
    $scope.showUserAgreementModal = _showUserAgreementModal;



    function _init() {

    }

    function _login() {
      var formData = $scope.formData['login'];

      formData.email = (formData.email === undefined) ? '' : formData.email.trim();
      if(!formData.email) {
        notificationService.showErrorMessage('Invalid email. retry');
        return;
      }

      if(!formData.password) {
        notificationService.showErrorMessage('Invalid password. retry');
        return;
      }

      authService.login(formData.email, formData.password)
        .then(function(user){
          $state.go('orchestrator');
        })
        .catch(function(err){
          notificationService.showErrorMessage(err.data);

          $state.go('login');
        });
    } //  end of function _login()


    function _signup() {
      var formData = $scope.formData['signup'];

      formData.name = (formData.name === undefined) ? '' : formData.name.trim();
      if(!formData.name) {
        notificationService.showErrorMessage('Invalid username. retry');
        return;
      }

      formData.email = (formData.email === undefined) ? '' : formData.email.trim();
      if(!formData.email) {
        notificationService.showErrorMessage('Invalid email. retry');
        return;
      }

      if(!formData.password) {
        notificationService.showErrorMessage('Invalid password. retry');
        return;
      }


      if(!formData.password2) {
        notificationService.showErrorMessage('Invalid repeat password . retry');
        return;
      }


      if(formData.password !== formData.password2) {
        notificationService.showErrorMessage('Password miss match. retry');
        return;
      }


      authService.signup(formData.name, formData.email, formData.password)
        .then(function(user){

          $state.go('login');
        })
        .catch(function(err){
          notificationService.showErrorMessage(err);
          $state.go('signup');
        });

    } //  end of function _singup()

    function _passwordResetRequest() {
      var formData = $scope.formData['reset'];

      formData.email = (formData.email === undefined) ? '' : formData.email.trim();
      if(!formData.email) {
        notificationService.showErrorMessage('Invalid email. retry');
        return;
      }

      authService.requestResetPassword(formData.email)
        .then(function(user){
          $state.go('main.dashboard');
        })
        .catch(function(err){

          $state.go('login');
        });
    }

    function _changePassword() {
      var formData = $scope.formData['change'];

      authService.changePassword($stateParams.token, formData.password, formData.password2)
        .then(function(user){
          $state.go('main.dashboard');
        })
        .catch(function(err){

          $state.go('login');
        });
    }




    function _checkPasswordStrength(formName) {
      var formData = $scope.formData[formName];

      var result = authService.checkPassword(formData.password);
      $scope.validPassword = result[0];
      $scope.passwordValidationMessage = result[1];
    }

    function _disableSignupButton() {

      if(!$scope.validPassword)
        return true;

      var formData = $scope.formData['signup'];
      formData.name = formData.name.trim();
      if(!formData.name) {
        return true;
      }

      formData.email = formData.email.trim();
      if(!formData.email) {
        return true;
      }

      if(!formData.password) {
        return true;
      }

      if(!formData.password2) {
        return true;
      }

      if(formData.password !== formData.password2) {
        return true;
      }

      return false;
    }

    function _disableChangeButton() {

      if(!$scope.validPassword)
        return true;

      var formData = $scope.formData['change'];
      if(!formData.password) {
        return true;
      }

      if(!formData.password2) {
        return true;
      }

      if(formData.password !== formData.password2) {
        return true;
      }

      return false;
    }


    function _showUserAgreementModal(type) {

      // ModalService.showModal({
      //   templateUrl: "_auth/auth.agree.modal.html",
      //   controller: "authAgreeModalController",
      //   inputs: {type: type}
      // }).then(function(modal) {
      //   modal.element.modal();
      //   modal.close.then(function(result) {
      //     if(result) {
      //
      //     }
      //   });
      // });
    }
  }



})();
