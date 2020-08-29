var express = require('express');
var metadata = require("file-metadata");
var sha1 = require("sha1");
var router = express.Router();
var fileUpload = require("express-fileupload")
var MUSIC = require("../database/music");
var mongoose = require("mongoose");
var midleware = require("./midleware");
router.use(fileUpload({
    fileSize: 50 * 1024 * 1024
}));
router.post, midleware, ("/sendfile", (req, res) => {
    var mp3 = req.files.file;
    var path = __dirname.replace(/\/routes/g, "/mp3");
    var date = new Date();
    var sing  = sha1(date.toString()).substr(1, 5);
    var totalpath = path + "/" + sing + "_" + mp3.name.replace(/\s/g,"_");
    mp3.mv(totalpath, async(err) => {
        if (err) {
            return res.status(300).send({msn : "Error al escribir el archivo en el disco duro"});
        }
        //REVISAR METADATOS
        console.log(totalpath);
        var meta = await metadata(totalpath);
        console.log(meta);
        var obj = {};
        if (meta.durationSeconds != null) {
            obj["duration"] = meta.durationSeconds;
        }
        if (meta.audioBitRate != null) {
            obj["bitrate"] = meta.audioBitRate;
        }
        if (meta.fsSize != null) {
            obj["size"] = meta.fsSize;
        }
        if (meta.displayName != null) {
            obj["title"] = meta.displayName;
        }
        obj["pathfile"] = totalpath;
        obj["hash"] = sha1(totalpath);
        obj["relativepath"] = "/api/1.0/getfile/?id=" + obj["hash"];
        var music = new MUSIC(obj);
        music.save((err, docs) => {
            if (err) {
                res.status(500).json({msn: "ERROR "})
                return;
            }
            res.status(200).json({name: mp3.name});
        });
    });
});
router.get, midleware, ("/getfile", async(req, res, next) => {
    var params = req.query;
    if (params == null) {
        res.status(300).json({
            msn: "Error es necesario un ID"
        });
        return;
    }
    var id = params.id;
    var music =  await MUSIC.find({hash: id});
    if (music.length > 0) {
        var path = music[0].pathfile;
        res.sendFile(path);
        return;
    }
    res.status(300).json({
        msn: "Error en la petición"
    });
    return;
});

router.get, midleware, ("/listmp3", async(req, res) => {
    var filterdata = req.query;
    var filterarray = ["title", "genero", "Album"];
    var title = filterdata["title"];
    var album = filterdata["Album"];
    var genero = filterdata["genero"];
    var filter = {};
    if (title != null) {
        filter["title"] = new RegExp(title, "g");
    }
    if (album != null) {
        filter["Album"] = album;
    }
    if (genero != null) {
        var genaux = genero.split("-");
        var generolist = [];
        for (var i = 0; i < genaux.length; i++) {
            generolist.push({"genero" : genaux[i]});
        }
        filter["$or"] = generolist;
    }
    var limit = 100;
    var skip = 0;
    if (filterdata["limit"]) {
        limit = parseInt(filterdata["limit"]);
    }
    if (filterdata["skip"]) {
        skip = parseInt(filterdata["skip"]);
    }
    var docs = await MUSIC.find(filter).limit(limit).skip(skip);
    res.status(200).json(docs);
});

module.exports = router;