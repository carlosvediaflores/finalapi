var mongoose = require("./connect");
var musicSchema = new mongoose.Schema({
    title: {
        type: String,
        default: "NO TITULO",
        required: [true, "El titulo es requerido"]
    },
    subtitle: {
        type: String,
        default: "None data",
        required: [true, "El subtitulo es requeridp"]
    },
    duration: {
        type: String
    },
    bitrate: {
        type: String
    },
    size: {
        type: String
    },
    genero: Array,
    commentaries: [{ body: String, date: Date }],
    likes: [
        {_iduser: 
        {
            type: String,
            default: "None USER",
            required: [true, "EL usuario es necesario"]
        }, 
        date: {
        type: Date,
        default: new Date()
    }}],
    Album: {
        type: String,
        default: "None ALBUM",
        required: [true, "El Album es necesario"]
    },
    year: Number,
    image: {
        type: String, 
        default: "No IMAGE",
        required: [true, "la ruta de la imagen es necesaria"]
    },
    relativepath: {
        type: String
    },
    pathfile: {
        type: String,
        required: [true, "la ruta de la canción es necesaria"]
    },
    hash: {
        type: String,
        required: [true, "la ruta de la canción es necesaria"]
    }
});
var MUSIC = mongoose.model("music", musicSchema);
module.exports = MUSIC;

