'use strict';

const UserModel = require('../models/user.model');
const AuthModel = require('../models/auth-token.model');
const tokenMaker = require('../utils/tokenMaker');


module.exports.saveRefreshToken = (email, refreshToken) => {
  return new Promise((resolve, reject) => {
    UserModel.findOne({
      email : email
    }).exec()
      .then(userInfo => {
        return new AuthModel({
          userid : userInfo,
          refreshToken : refreshToken
        }).save();
      })
      .then((result) => {
        resolve(result);
      })
      .catch(err => {
        reject(err);
      })
  })
}


module.exports.removeRefreshToken = (email, refreshToken) => {
  return new Promise((resolve, reject) => {
    UserModel.findOne({
      email : email
    }, {_id : true
    }).exec()
      .then(userInfo => {
        return AuthModel.deleteOne({
          userid : userInfo
        }).exec()
      })
      .then(result => {
        resolve(result);
      })
      .catch(err => {
        reject(err);
      })
  })
}


module.exports.reissueAccessToken = (refreshToken) => {
  return new Promise((resolve, reject) => {
    AuthModel.findOne({
      refreshToken : refreshToken
    }, {userid : true}).exec()
      .then(user => {
        return UserModel.findOne({_id : user.userid}).exec()
      })
      .then(userInfo => {
        return tokenMaker.createAccessToken(userInfo);
      })
      .then(accessToken => {
        resolve(accessToken);
      })
      .catch(err => {
        reject(err);
      })
  })
}