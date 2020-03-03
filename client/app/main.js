(function(){
  'use strict';

  angular
    .module('iotvtool', ['ui.router', 'LocalStorageModule', 'ngMaterial', 'ngMap', 'ngDraggable'])
    .config(config)
    .controller('mainController', MainController)
    .run(run);


    var STATE_TITLE = {
      "orchestrator": {"title": "자동화 작업", "theme": "orchestrator"},
    };


    function config($stateProvider, $urlRouterProvider, $mdThemingProvider, localStorageServiceProvider) {

      $urlRouterProvider.otherwise('/orchestrator');

      $stateProvider
        // Login page
        .state('login', {
          url: '/login',
          templateUrl: './app/auth/login.html'
        })
        // Login page
        .state('signup', {
          url: '/sighup',
          templateUrl: './app/auth/signup.html'
        })
        // Login page
        .state('password-reset', {
          url: '/password-reset',
          templateUrl: './app/auth/password.reset.html'
        })
        // Login page
        .state('password-change', {
          url: '/password-change',
          templateUrl: './app/auth/password.change.html'
        })
        // orchestrator page
        .state('orchestrator', {
          url: '/orchestrator',
          templateUrl: './app/orchestrator/orchestrator.html'
        })
      ;

    localStorageServiceProvider
      .setPrefix('iotvtool');
    localStorageServiceProvider
      .setStorageType('localStorage');

    $mdThemingProvider.theme('default')
      .primaryPalette('blue-grey');
    $mdThemingProvider.theme('orchestrator')
      .primaryPalette('indigo');

    //  INIT ui constants
    window.COLOR_TYPE = [
      {name: 'bluejeans', color: '#5d9cec'},
      {name: 'aqua', color: '#4fc1e9'},
      {name: 'grass', color: '#a0d468'},
      {name: 'sunflower', color: '#ffce54'},
      {name: 'darkgray', color: '#656d78'}
    ];
  };


  //  controller inject
  MainController.$inject = ['$scope', '$state', '$mdSidenav', 'authService', 'notificationService'];

  function MainController($scope, $state, $mdSidenav, authService, notificationService) {

    $scope.init = _init;
    $scope.openLoginUserMenu = _openLoginUserMenu;
    $scope.onLogout = _onLogout;
    $scope.getUserName = _getUserName;
    $scope.currentStateIs = _currentStateIs;
    $scope.currentStateTitle = _currentStateTitle;
    $scope.currentStateTheme = _currentStateTheme;

    function _init() {
      var loginUser = authService.getLoginUser();
      if(loginUser) {
        window.SOCKET = io.connect();
        window.SOCKET.on('connected', function (data) {
          window.SOCKET.emit('start', {email: loginUser.email});
        });
        window.SOCKET.on('iotvtool', function(data){
          notificationService.pushHandler(data);
        });
      }
    }

    function _openLoginUserMenu($mdMenu, ev) {
        $mdMenu.open(ev);
    }

    function _onLogout() {
      authService.logout();
    }

    function _getUserName() {
      var loginUser = authService.getLoginUser();
      if(loginUser) {
        return loginUser.u_n;
      }
      else {
        return "";
      }
    }

    function _currentStateIs(name) {
      return $state.current.name === name;
    }

    function _currentStateTheme() {
      var currentStateName = $state.current.name;
      if(STATE_TITLE[currentStateName]) {
        return STATE_TITLE[currentStateName].theme;
      }
      else {
        return 'default';
      }
    }

    function _currentStateTitle() {
      var currentStateName = $state.current.name;
      if(STATE_TITLE[currentStateName]) {
        return STATE_TITLE[currentStateName].title;
      }
      else {
        return '초소형 IoT 테스트 및 검증용 도구';
      }
    }
  }

  function run($rootScope, $location) {
    window.API_BASE_URL = "";

    var result = JSON5.parse('{message_type : "node.cmd", command_type : "control", request_value : "OFF"}', function (key, value) {
      if (typeof value == "number") {
        value = value % 2 ? "Odd" : "Even";
      }
      return value;
    });
  }

})();

