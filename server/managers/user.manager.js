"use strict";

const encrypter = require('../utils/encrypter');
const UserModel = require('../models/user.model');
const onem2m = require('onem2m_client')();


function __getPassedTimebyHour(stampTime){
  if(!(stampTime instanceof Date)){
    stampTime = new Date(stampTime);
  }
  var diffTime = Math.abs(new Date().getTime() - stampTime.getTime());
  var diffHours = Math.ceil(diffTime / (1000 * 60 * 60)); 
  return diffHours;
}


module.exports.registerUser = (userInfo) => {
  return new Promise((resolve, reject) => {
      encrypter.encryptSHA512(userInfo.password)
        .then(encrypted => {
          return new UserModel({
            email: userInfo.email,
            name: userInfo.name,            
            ae: userInfo.ae,
            password: encrypted.encryptPassword,
            salt : encrypted.salt,
          }).save()
        })
        .then(saved => {
          resolve(saved);
        }) 
        .catch(err => {
          reject(err);
        })
  })
}


module.exports.getAllUsers = () => {
  return new Promise((resolve, reject) => {
    UserModel.find({},{
      email : true, 
      name : true, 
      ae : true, 
    }).exec()
      .then(users => {
        resolve(users);
      })
      .catch(getErr => {
        reject(getErr);
      })
  })
}


module.exports.deleteUser = (params) => {
  return new Promise((resolve, reject) => {
    UserModel.deleteMany({
      email : params
    }).exec()
      .then(deleted => {
        resolve(deleted);
      })
      .catch(delErr => {
        reject(delErr);
      })
  })
}


module.exports.resetPassword = (email, password) => {
  return new Promise((resolve, reject) => {
    UserModel.findOne({
      email : email
    }).exec((err, user) => {
      if(err){
        reject(err);
      }
      encrypter.encryptSHA512(password)
        .then(encrypted => {
          this.password = encrypted.password;
          this.salt = encrypted.salt;

          return this.save();
        })
        .then(saved => {
          resolve(saved);
        })
        .catch(err => {
          reject(err);
        })
    })
  })
}


module.exports.checkPassword = (params) => {
  return new Promise((resolve, reject) => {
    var password = params.password;
    var email = params.email;

    UserModel.findOne({email : email}, (err, res) => {
      if(err){
        reject(err);
        return;
      }
      if(!res){
        reject(new Error("Nothing matched user"));
        return;
      }
      var salt = res.salt;
      var savedPwd = res.password;
      var encryptedPwd = encrypter.getEncrypted(password, salt);

      if(encryptedPwd !== savedPwd){
        reject(new Error("비밀번호 혹은 이메일 주소가 일치하지 않습니다."));
      }else{
        resolve({
          email : res.email,
          name : res.name,
        });
      }
    });
  })
}


module.exports.modifiedDataFilter = (data) => {
  var info = data;
  var promises = [];
  if(info.password){
    var promise1 = new Promise((resolve, reject => {
      encrypter.encryptSHA512(userInfo.password)
      .then(encrypted => {
        resolve(encrypted);
      })
      .catch(err => {
        reject(err);
      })
    }))
    promises.push(promise1);
  }
  if(info.name){
    var promiseName = new Promise((resolve, reject) => {
      resolve({name: info.name});
    });
    promises.push(promiseName);
  }
  if(info.ae){
    var promiseAe = new Promise((resolve, reject) => {
      resolve({ae: info.ae});
    });
    promises.push(promiseAe);
  }
  if(info.license){
    var promiseLicense = new Promise((resolve, reject) => {
      resolve({license: info.license});
    });
    promises.push(promiseLicense);
  }

  return Promise.all(promises);
}


module.exports.saveModifiedUserInfo = (param, data) => {
  return new Promise((resolve, reject) => {
    var aeName = null;
    var saveData = {};    
    var userEmail = param.u_e;
    data.forEach(el => {
      var keys = Object.keys(el);
      keys.forEach(e => {
        if(e == 'encryptPassword') saveData['password'] = el[e];
        if(e == 'ae') {
          aeName = el[e];
          return;
        }
        saveData[e] = el[e];
      })
    });

    UserModel.findOneAndUpdate(
      { email : userEmail },
      { $set: saveData, $addToSet: { ae: aeName } },
      { new: true }
    )
    .then(rs => {
      resolve(rs);
    })
    .catch(err => {
      reject(err);
    })
  })
}


module.exports.checkEmail = (params) => {
  return new Promise((resolve, reject) => {

    var email = params.email;

    UserModel.findOne({ email: email })
      .then(rs => {
        resolve(rs ? false : true); //result가 true면 중복된 메일
      })
      .catch(err => {
        reject(err);
      })
  })
}


module.exports.permitUsers = (params) => {
  return new Promise((resolve, reject) => {
    UserModel.updateMany({
      email : params.userList
    }, {
      $set : {
        status : 'approved'
      }
    }).exec()
      .then(result => {
        resolve(result);
      })
      .catch(permitErr => {
        reject(permitErr);
      })
  })
}


module.exports.disapproveUser = (params, reason) => {
  return new Promise((resolve, reject) => {
    UserModel.updateMany({
      email : params.userList
    }, {
      status : 'disapprove'
    }).exec()
    .then(_ => {
      resolve();
    })
    .catch(err => {
      reject(err);
    })
  })
}


module.exports.checkAE = (body) => {
  return new Promise((resolve, reject) => {
    var ae = body.aeName;
    if(!ae){
      reject(new Error("파라미터에 AE정보가 존재하지 않습니다."));
    }
    var aeObject = {
      "m2m:ae": {
        "rn": ae,
        "api": 'UTM.GCS.USER',
        "lbl": ['UTM', 'UGCS', 'Portal', 'user', body.email],
        "rr": true
      }
    }
    onem2m.Http.createResource(`${CONFIG.mobius_url}`,aeObject)
      .then((res) => {
        var aei = res["m2m:ae"]["rn"];
        resolve(aei);
      }, err => {
        if(err.statusCode === 409){          
          return onem2m.Http.getResource(`${CONFIG.mobius_url}/${ae}`)
        }else{
          reject(err)
        }
      })
      .then(aeResource => {
        var ae = aeResource["m2m:ae"]["rn"];
        resolve(ae);
      })
      .catch(err => {
        reject(err);
      })
  })
}


module.exports.checkRegisteredAE = (aeName) => {
  return new Promise((resolve, reject) => {
    UserModel.findOne({
      ae: {$elemMatch : {ae: aeName}}
    }).exec()
      .then(res => {
        resolve(res);
      })
      .catch(err => {
        reject(err);
      })
  })
}


module.exports.updateUserPassword = (token, password) => {

  var resObj = {
    statusCode: 200,
    message: 'OK',
    data: null
  };

  return new Promise(function(resolve, reject){
    try {
      var _user;
      //  1. find user from given password reset token string
      UserModel.findOne({"resetPassordInfo.token": token}).exec()

        .then(user => {
          if(user != null && user.resetPassordInfo != null) {
            _user = user;
            var time = __getPassedTimebyHour(user.resetPassordInfo.timestamp);

            if(time > 1){
              throw new Error("유효기간이 만료된 토큰입니다.");
            }
            //  TODO: 2. validation for timestamp
            //  2.1. if email exists save reset info(token + timestamp)
            return encrypter.encryptSHA512(password)
          }
          else {
            throw new Error("유효하지 않은 비밀번호 변경요청 입니다.")
          }
        })
        .then(en => {
          _user.salt = en.salt;
          _user.password = en.encryptPassword;
          _user.resetPassordInfo = null;
          _user.save();
          resolve();
        })
        .catch(function(err){
          return reject(err);
        });

    }
    catch(ex) {
      resObj.statusCode = 500;
      resObj.message = '비밀번호 재설정 실패';
      resObj.data = err.message;

      debug('Failed to change password', err.message);
      return reject(resObj);
    }
  });
}