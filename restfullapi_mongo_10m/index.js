const express = require("express"),
      mongoskin = require("mongoskin"),
      bodyParser = require("body-parser");

const app = express();

const port = process.env.PORT || 8080;

var db = mongoskin.db("mongodb://@localhost:27017/testdatabase", {safe: true});
var id = mongoskin.helper.toObjetID;

var allowMethods = (req, res, next) => {
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
}

// http://localhost:8080/api/:coleccion/:id
app.param("coleccion", (req, res, next, coleccion) => {
    req.collection = db.collection(coleccion);
});

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(allowMethods);

// POST
app.post("/api/:coleccion", (req, res, next) => {
    req.collection.insert(req.body, {}, (e, result) => {
        if(e) return next();
        res.send(result);
    });
});

app.listen(port, () => {
    console.log(`Servidor corriendo en el puerto ${port}`);
});