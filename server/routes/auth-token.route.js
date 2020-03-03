"use strict";

var router = require('express').Router();
var userManager = require('../managers/user.manager');
var tokenDecoder = require('../utils/jwtDecoder');
var tokenMaker = require('../utils/tokenMaker');
var authManager = require('../managers/auth-token.manager');


// User sign in
router.post('/', function(req, res, next){
  if(req.body.email && req.body.password){
    userManager.checkPassword(req.body)
    // Email, password를 비교, 로그인에 성공하면 user정보를 반환 받는다.
      .then(result => {
        var refreshToken = tokenMaker.createRefreshToken(result);
        var accessToken = tokenMaker.createAccessToken(result);

        return Promise.all([refreshToken, accessToken]);
      })
      .then(([refreshToken, accessToken]) => {
        res.setHeader('iotvtoolAcToken', accessToken);
        res.setHeader('iotvtoolReToken', refreshToken);
        
        // expose-headers를 안해주면 angular에서 토큰을 가져오지 못한다.
        res.setHeader('Access-Control-Expose-Headers', 'iotvtoolAcToken, iotvtoolReToken');

        return authManager.saveRefreshToken(req.body.email, refreshToken);
      })
      .then(saved => {
        res.status(200).json({
          message : "로그인에 성공 했습니다.",
          token: saved.refreshToken,
        })
      })
      .catch(err => {
        res.status(401).json({
          message : err.message ? err.message : "아이디 혹은 패스워드가 일치하지 않습니다."
        });
      })
  }else{
    res.status(400).json({
      message : "비정상적인 로그인 요청입니다."
    })
  }
})


// User sign out
router.delete('/', tokenDecoder.authTokenMiddleware, function(req, res, next){
  if(!req.decoded){
    res.status(401).json({
      message : "로그인 세션이 종료되었습니다. 다시 로그인 해주시기 바랍니다."
    });
    return;
  }
  var userInfo = req.decoded;
  if(userInfo.u_t == 3 && req.params.email){
    // 관리자
  }else{
    // 개인 유저
    var email = req.decoded.u_e;
  }
  // 여러 컴퓨터의 경우의 토큰 분별은 아직...
  authManager.removeRefreshToken(email)
    .then(result => {
      res.status(200).json({ message : "정상적으로 로그아웃 되었습니다."})
    })
    .catch(err => {
      res.status(500).json({ message : "로그아웃 도중 장애가 발생했습니다."})
      console.error(err);
    })
})


// Reissue user's accessToken
router.post('/reissue', function(req, res, next){
  if(!req.headers.gcsretoken){
    res.status(400).json({
      message : "RefreshToken이 전달되지 않았습니다."
    });
    return;
  }
  var refreshToken = req.headers.gcsretoken;
  authManager.reissueAccessToken(refreshToken)
    .then(accessToken => {
      res.setHeader("iotvtoolAcToken", accessToken);
      res.status(200).json({
        message : 'AccessToken 발급이 완료되었습니다.'
      });
    })
    .catch(err => {
      res.status(500).json({
        message : "AccessToken 생성 중 장애가 발생했습니다."
      })
      console.error(err);
    })
})


// Reset user's password
router.get('/:user_email/reset', function(req, res, next){
  var email = req.params.user_email;
  userManager.requestToResetPassword(email)
  .then(_ => {
    res.status(200).send();
  })
  .catch(err => {
    res.status(err.statusCode).json(err);
  })
})


// Reset user's password
router.put('/change', function(req, res, next){  
  var token = req.body.token;
  var password = req.body.password;

  if(!token || !password){
    res.status(400).json({
      message : "정확한 데이터가 수신되지 않았습니다. 다시 시도해주세요."
    })
    return;
  }

  userManager.updateUserPassword(token, password)
    .then(() => {
      res.status(200).send();
    })
    .catch(err => {
      res.status(400).json({
        message : err.message
      });
    })
})


module.exports = router;