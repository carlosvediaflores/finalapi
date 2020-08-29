var express = require("express");
var sha1 = require("sha1");
var router = express.Router();
var USER = require("../database/user");
var MUSIC = require("../database/music");
var JWT = require("jsonwebtoken");
//Lista de usuarios
//CRUD
var midleware = require("./midleware");
router.get("/user", midleware, (req, res) => {
    var filter = {};
    var params = req.query;
    var select = "";
    var aux = {};
    var order = {};
    if (params.nick != null) {
        var expresion = new RegExp(params.nick);
        filter["nick"] = expresion;
    }
    if (params.filters != null) {
        select = params.filters.replace(/,/g, " ");
    }
    if (params.agegt != null) {
        var gt = parseInt(params.agegt);
        aux["$gt"] =  gt;
    }
    if (params.agelt != null) {
        var gl = parseInt(params.agelt);
        aux["$lt"] =  gl;
    }
    if (aux != {}) {
        filter["age"] = aux;
    }
    if (params.order != null) {
        var data = params.order.split(",");
        var number = parseInt(data[1]);
        order[data[0]] = number;
    }
    USER.find(filter).
    select(select).
    sort(order).
    exec((err, docs) => {
        if (err) {
            res.status(500).json({msn: "Error en el servidor"});
            return;
        }
        res.status(200).json(docs);
        return;
    });
});
router.post, midleware, ("/user", (req, res) => {
    var userRest = req.body;
    //creamos validacion para el password
    if (userRest.password == null) {
        res.status(300).json({msn: "El password es necesario pra continuar con el registro"});
        return;
    }
    if (userRest.password.length < 6) {
        res.status(300).json({msn: "Es demasiado corto"});
        return;
    }
    if (!/[A-Z]+/.test(userRest.password)) {
        res.status(300).json({msn: "El password necesita una letra Mayuscula"});
        
        return;
    }
    if (!/[\$\^\@\&\(\)\{\}\#]+/.test(userRest.password)) {
        res.status(300).json({msn: "Necesita un caracter especial"});
        return;
    }
    userRest.password = sha1(userRest.password);
    var userDB = new USER(userRest);
    userDB.save((err, docs) => {
        if (err) {
            var errors = err.errors;
            var keys = Object.keys(errors);
            var msn = {};
            for (var i = 0; i < keys.length; i++) {
                msn[keys[i]] = errors[keys[i]].message;
            }
            res.status(500).json(msn);
            return;
        }
        res.status(200).json(docs);
        return;
    })
});
router.put, midleware, ("/user", async(req, res) => {
    var params = req.query;
    var bodydata = req.body;
    if (params.id == null) {
        res.status(300).json({msn: "El parámetro ID es necesario"});
        return;
    }
    var allowkeylist = ["nick", "email", "age"];
    var keys = Object.keys(bodydata);
    var updateobjectdata = {};
    for (var i = 0; i < keys.length; i++) {
        if (allowkeylist.indexOf(keys[i]) > -1) {
            updateobjectdata[keys[i]] = bodydata[keys[i]];
        }
    }
    USER.update({_id:  params.id}, {$set: updateobjectdata}, (err, docs) => {
       if (err) {
           res.status(500).json({msn: "Existen problemas en la base de datos"});
            return;
        } 
        v
    });

});
router.delete, midleware, ("/user", (req, res) => {
    var params = req.query;
    if (params.id == null) {
        res.status(300).json({msn: "El parámetro ID es necesario"});
        return;
    }
    USER.remove({_id: params.id}, (err, docs) => {
        if (err) {
            res.status(500).json({msn: "Existen problemas en la base de datos"});
             return;
         } 
         res.status(200).json(docs);
    });
});
router.post("/login", async(req, res) => {
    var body = req.body;
    if (body.nick == null) {
        res.status(300).json({msn: "El nick es necesario"});
             return;
    }
    if (body.password == null) {
        res.status(300).json({msn: "El password es necesario"});
        return;
    }
    var results = await USER.find({nick: body.nick, password: sha1(body.password)});
    //console.log(results);
    if (results.length == 1) {  
        var token = JWT.sign({
            exp: Math.floor(Date.now() / 1000) + (60 * 2),
            data: results[0].id
          }, 'seminariokeyscret');
        res.status(200).json({msn: "Bienvenido " + body.nick + " al sistema", token:token});
        return;
    }
    res.status(200).json({msn: "Credenciales incorrectas"});
});
router.post, midleware, ("/createplaylist", async(req, res) => {
    var params = req.query;
    if (params.id == null) {
        res.status(300).json({msn: "El id es necesario"});
             return;
    }
    var id = params.id;
    var docs = await USER.find({_id: id});
    if (docs.length > 0) {
        var playlist = docs[0].playlist;
    } else {
        var playlist = new Array();
    }
    var bodydata = req.body;
    var keys = Object.keys(bodydata);
    var onePlaylist = {"nombre": bodydata.nombre, fecha: new Date(), music: []};

    for (var i = 0; i < keys.length; i++) {
        if (keys[i].match(/musica/g)) {
            var idmusic = bodydata[keys[i]];
            var musica = await MUSIC.findOne({_id: idmusic});
            if (musica) {
                onePlaylist.music.push(musica);
            }
        }
    }
    playlist.push(onePlaylist);
    var result = await USER.update({_id: id}, {$set: {"playlist": playlist}});
    res.status(200).json(result);
});
router.get, midleware, ("/getplaylist", async(req, res) => {
    req.params;
    var params = req.query;
    if (params.id == null) {
        res.status(300).json({msn: "El id es necesario"});
             return;
    }
    var id = params.id;
    var docs = await USER.find({_id: id});
    if (docs.length > 0) {
        var playlist = docs[0].playlist;
        res.status(200).json(playlist);
        return;
    }
    res.status(200).json({msn: "El usuario no existe"});
});
module.exports = router;