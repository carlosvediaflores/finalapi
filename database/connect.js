var mongoose = require("mongoose");
mongoose.connect("mongodb://0.0.0.0:27017/musicdatabase", {useNewUrlParser: true});
var db  = mongoose.connection;
db.on("error", () => {
    console.log("ERRO no se puede conectar al servidor");
});
db.on("open", () => {
    console.log("Conexion exitosa");
});
module.exports = mongoose;                                                      