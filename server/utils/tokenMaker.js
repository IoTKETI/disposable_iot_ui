var jwt = require('jsonwebtoken');
var jwtConfig = global.CONFIG.jwt;

exports.createAccessToken = (data) => {
    return new Promise((resolve, reject) => {
        jwt.sign({
            u_e : data.email,   // 사용자 Email
            u_n : data.name,
        },
          jwtConfig.SECRET,{
            issuer : jwtConfig.JWT_ISSUER,
            subject : jwtConfig.ACCESS_SUBJECT,
            expiresIn : jwtConfig.ACCESS_EXP
        },(err, encoded) => {
            if(err){
                reject(err);
            }else{
                resolve(encoded);
            }
        })
    })
}
exports.createRefreshToken = (data) => {
    return new Promise((resolve, reject) => {
        jwt.sign(
            {
                issuedDate : Date.now().toString,
                u_e : data.email,
                u_n : data.name,
            },
            jwtConfig.SECRET,
            {
                issuer : jwtConfig.JWT_ISSUER,
                subject : jwtConfig.REFRESH_SUBJECT,
                expiresIn : jwtConfig.REFRESH_EXP
            }
            ,(err, encoded) => {
                if(err){
                    reject(err);
                }else{
                    resolve(encoded);
                }
            }
        )
    })
}