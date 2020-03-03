const jwt = require('jsonwebtoken');
var jwtConfig = global.CONFIG.jwt;

exports.authTokenMiddleware = (req, res, next) => {
    const token = req.headers['x-access-token'];
    
    if(!token){
        onError(res, "Nothing exist token");
    }else{
        try{
            new Promise((resolve, reject) => {
                jwt.verify(token, jwtConfig.SECRET, (err, decoded) => {
                    if(err){
                        reject(err);
                    }
                    resolve(decoded);
                });
            })
            .then(result => {
                req.decoded = result;
                next();
            })
            .catch(err => {
                onError(res, err);
            })
        }catch(error){
            onError(res, error);
        }
    }
}


const onError = (res, err) => {
    res.status('401').json({
        message : 'expired token',
        success  : false,
        error : err
    });
}