const crypto = require('crypto');

this.recycleCnt = 10000;
this.type = 'sha512';
this.passwordLength = 64

exports.encryptSHA512 = (data) => {
    return new Promise((resolve, reject) => {
        crypto.randomBytes(64, (err, buf) => {
            if(err){
                reject(err);
            }
            //           data,      salt,                   recycle count,  length,      hash algorithm
            crypto.pbkdf2(data, buf.toString('base64'), this.recycleCnt, this.passwordLength, this.type, (err, key) => {
                if(err){
                    reject(err);
                }
                resolve({
                    salt : buf.toString('base64'),
                    encryptPassword : key.toString('base64')
                });
            })
        });
    })
};

exports.getEncrypted = (data, salt) => {
    return crypto.pbkdf2Sync(data, salt, this.recycleCnt, this.passwordLength, this.type).toString('base64');
};