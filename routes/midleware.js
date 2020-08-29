var JWT = require("jsonwebtoken");
var USER = require("../database/user");
var midleware = async(req, res, next) => {
    //Recuperando del header el token
    var token = req.headers["authorization"];
    //console.log(token);
    if(token == null){
        res.status(403).json({error: "No tienes acceso a este lugar, token nulo"});
        return;
    }
    //Verificando el token si es valido o no es valido el token 
    try{
        var decoded = JWT.verify(token, 'seminariokeyscret');
    if(decoded == null){
        res.status(403).json({error: "No tienes acceso a este lugar, token falso"});
        return;
    }
    //Verificacion del tiempo de secion
    if(Date.now() / 1000 > decoded.exp){
        res.status(403).json({error: "El tiempo de token expirado"});
        return;
    }
    //Verificando si ese ID existe en la base de datos
    var iduser = decoded.data;
    var docs = await USER.findOne({_id: iduser});
    if(docs == null){
        res.status(403).json({error: "No tienes acceso a este lugar, el ususario no exixteen bd"});
        return;
    }  
    var roles = docs.roles.map( item => {
        return item;
    });
    var services = req.originalUrl.substr(1, 100);
    if(services.lastIndexOf("?") > -1){
        services = services.substring(0, services.lastIndexOf("?"));
    }
    //console.log(Object.keys(req));
    //console.log(req.method);
    //console.log("Pasando x el servicio Midleware "+services);
    var METHOD = req.method;
    var URL = services; 
    for (var i = 0; i < roles.length; i++){
        if(URL == roles[i].service){
            next();
            return;
        }
    }
    res.status(403).json({error: "No tienes acceso a este servicio"});
        return;
    }catch(TokenExpiredError){
        res.status(403).json({error: "El tiempo de token expirado"});
        return;
    }
    
}
module.exports = midleware;