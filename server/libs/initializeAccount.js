var userModel = require('../models/user.model');
var encrypter = require('../utils/encrypter');

module.exports.initAccount = function(){

  var admin = {
    email : `iotvtool@keti.re.kr`,
    password : `keti12#$`,
    name : 'KETI',
  };

  userModel.findOne({
    type : admin.type
  },(err, res) => {
    if(err){
      LOGGER.error(err);
    }else if(!res){
      createAccount(admin);
    }
  })
}

function createAccount(user){
  encrypter.encryptSHA512(user.password)
    .then(encrypted => {
      return new userModel({
        email : user.email,
        name : user.name,
        password : encrypted.encryptPassword,
        salt : encrypted.salt
      }).save()
    })
    .then(() => {
      LOGGER.debug(`SERVER create an ${user.email} account`);
    })
    .catch(err => {
      LOGGER.error(err);
    })
}