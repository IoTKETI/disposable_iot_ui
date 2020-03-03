"use strict";

var express = require('express');
var router = express.Router();
var userManager = require('../managers/user.manager');
var tokenDecoder = require('../utils/jwtDecoder')
var tokenMaker = require('../utils/tokenMaker');


// Create User
router.post('/', function(req, res, next){
  if(!req.body.password || !req.body.email){
    res.status(400).json({
      message : "회원가입을 위한 양식을 충족시키지 못했습니다."
    });
    return;
  }
  var userInfo = {
    email : req.body.email,
    name : req.body.name,
    password : req.body.password,
  }
  userManager.registerUser(userInfo)  
  .then(result => {
    res.status(201).json({
      message : "사용자 생성에 성공했습니다."
    });
  })
  .catch(err => {
    res.status(500).json({
      message : "사용자 생성 중 장애가 발생했습니다."
    })
    /**
     * Log에 에러 기록
     */
    console.error(err);
  })

})


router.put('/', tokenDecoder.authTokenMiddleware, (req, res, next) => {
  
  var info = req.body;
  var param = req.decoded;
  if(!info){
    res.status(400).send(new Error("변경된 사용자 정보가 없습니다.")); return;
  }
  userManager.modifiedDataFilter(info)
    .then(data => {
      return userManager.saveModifiedUserInfo(param, data);
    })
    .then(result => {
      return tokenMaker.createAccessToken(result);
    })
    .then(acToken => {
      res.setHeader('iotvtoolAcToken', acToken);
      res.status(200).json({
        message : '사용자 정보 변경을 완료했습니다.'
      });
    })
    .catch(err => {
      res.status(400).send(err);
    })
})


// Delete user(회원 탈퇴)
router.delete('/:email', function(req, res, next){
  if(!req.params.email){
    res.status(400)
  }
  userManager.deleteUser(req.params.email)
    .then(result => {
      res.status(200).json({
        message : `${result.ok}개의 삭제요청이 처리 되었습니다.`
      })
    })
    .catch(err => {
      /**
       * 로그에 에러 기록
       */
      console.log(err);
    })
})


// Update user's infomation
router.put('/', function(req, res, next){
})


// Check email is available
router.get('/:email/check', function(req, res, next){
  if(!req.params.email){
    res.status(400).json({
      message : "검사 대상이 요청되지 않았습니다."
    })
  }
  userManager.checkEmail(req.params)
    .then(result => {
      res.status(200).send(result);
    })
    .catch(err => {
      console.error(err);
    })
})


module.exports = router;