
(function(){
  'use strict';

  angular
    .module('iotvtool')
    .service('authService', AuthService);


  AuthService.$inject = ['$http', '$state', 'notificationService', 'localStorageService'];

  var MIN_PASSWORD_LENGTH = 8;

  function AuthService($http, $state, notificationService, localStorageService) {

    var services = {
      "getLoginUser": _getLoginUser,
      "getAuthToken": _getAuthToken,
      "addAccessTokenHeader": _addAccessTokenHeader,

      "login": _login,
      "signup": _signup,
      "logout": _logout,

      "resetPassword": _resetPassword,
      "changePassword": _changePassword,
    };
    return services;


    function _getLoginUser() {
      var authToken = localStorageService.get('authToken');
      if(authToken) {
        return jwt_decode(authToken);
      }
      else {
        //return null;
        _login('iotvtool@keti.re.kr', 'keti12#$')
        .then(function(result){
          if(result.token) {
            return jwt_decode(result.token);
          }
        })
        .catch(function(err){
          console.error(err);
          notificationService.showErrorMessage(err, true);
          return null;
        });
      }
    }

    function _addAccessTokenHeader(httpOptions, doNotForward) {
      var authToken = localStorageService.get('authToken') || null;
      if(authToken == null && !doNotForward) {
        return $state.go('login');
      }
      else {
        if(!httpOptions.headers)
          httpOptions.headers = {};

        httpOptions.headers["x-access-token"] = authToken;
        return httpOptions;
      }
    }

    function _getAuthToken(doNotForward) {

      var authToken = localStorageService.get('authToken');
      if(authToken) {
        return authToken;
      }
      else if(!doNotForward) {

        return $state.go('login');
      }

      return authToken;
    }

    function _login(email, password) {
      return new Promise(function(resolve, reject) {

        try {
          var body = {
            "email": email,
            "password": password
          };

          var httpOptions = {
            url: window.API_BASE_URL + "/auth",
            method: "POST",
            data: body
          };

          $http(httpOptions)

          .then(function(response){
            localStorageService.set('authToken', response.data.token);

            var email = jwt_decode(response.data.token).u_e;

            if(window.SOCKET)
              window.SOCKET.close();

            window.SOCKET = io.connect();
            window.SOCKET.on('connected', function (data) {

              window.SOCKET.emit('start', {email: email});
            });
            window.SOCKET.on('iotvtool', (data)=>{
              notificationService.pushHandler(data);
            });

            resolve(response.data);
          })

          .catch(function(err){
            console.error(err);
            notificationService.showErrorMessage(err, true);
            reject(err);
          });
        }
        catch(ex) {
          console.error(ex);
          reject(ex);
        }

      });
    } //  end of function _login()

    function _resetPassword(email) {
      return new Promise(function(resolve, reject) {

        try {
          var httpOptions = {
            url: window.API_BASE_URL + `/auth/${email}/reset`,
            method: "GET",
          };

          $http(httpOptions)

          .then(function(response){

            resolve(response.data);
          })

          .catch(function(err){
            console.error(err);
            notificationService.showErrorMessage(err, true);
            reject(err);
          });
        }
        catch(ex) {
          console.error(ex);
          reject(ex);
        }

      });
    } //  end of function _login()


    function _changePassword(token, password, password2) {
      return new Promise(function(resolve, reject) {

        var data = {
          token: token,
          password: password,
          password2: password2
        };

        try {
          var httpOptions = {
            url: window.API_BASE_URL + "/auth/change",
            method: "PUT",
            data: data
          };

          $http(httpOptions)

          .then(function(response){
            localStorageService.remove('authToken');

            resolve(response.data);
          })

          .catch(function(err){
            console.error(err);
            notificationService.showErrorMessage(err, true);
            reject(err);
          });
        }
        catch(ex) {
          console.error(ex);
          reject(ex);
        }

      });
    } //  end of function _login()


    function _signup(name, email, password) {
      return new Promise(function(resolve, reject) {

        try {
          var body = {
            "name": name,
            "email": email,
            "password": password
          };

          var httpOptions = {
            url: window.API_BASE_URL + "/user",
            method: "POST",
            data: body
          };

          $http(httpOptions)

            .then(function(response){
              resolve(response.data);
            })

            .catch(function(err){
              console.error(err);
              reject(err);
            });
        }
        catch(ex) {
          console.error(ex);
          notificationService.showErrorMessage(err);
          reject(ex);
        }

      });
    } //  end of function _signup()


    function _logout() {
      try {
        localStorageService.remove('authToken');
        $state.reload();
      }
      catch(ex) {
        notificationService.showErrorMessage(ex);
        localStorageService.remove('authToken');
        $state.reload();
      }
    } //  end of function _logout()

    function _checkPassword(password) {
      var result = '';

      result = __checkAlphabetic(password);
      if (result) {
        return [false, '비밀번호는 숫자 또는 특수문자(!@#$%)를 포함해야 합니다.'];
      }

/*
      result = __checkAlphaNumeric(password);
      if (result) {
        return [false, '비밀번호는 특수문자(!@#$%)를 포함해야 합니다.'];
      }
*/
      result = __checkAlphaNumericSpecial(password);
      if (!result) {
        return [false, '비밀번호는 알파벳 대/소문자, 숫자, 특수문자(!@#$%)만을 포함해야 합니다.'];
      }

      result = __checkLength(password);
      if (result) {
        return [false, '비밀번호의 길이가 충분하지 않습니다.'];
      }

      return [true, '사용 가능한 비밀번호입니다.'];
    } //  end of function _checkPassword()


    function __checkAlphabetic(password) {
      var matched = password.match(/^[a-zA-Z]+$/);

      if (!!matched && matched[0] === password) {
        return true;
      }

      return false;
    }

    function __checkAlphaNumeric(password) {
      var matched = password.match(/^[a-zA-Z0-9]+$/);

      if (!!matched && matched[0] === password) {
        return true;
      }

      return false;
    }

    function __checkAlphaNumericSpecial(password) {
      var matched = password.match(/^[a-zA-Z0-9!@#$%]+$/);

      if (!!matched && matched[0] === password) {
        return true;
      }

      return false;
    }

    function __checkLength(password, minLength) {
      minLength = minLength || MIN_PASSWORD_LENGTH;

      return password.length < minLength;
    }

  } //   end of function AuthService()
})();
