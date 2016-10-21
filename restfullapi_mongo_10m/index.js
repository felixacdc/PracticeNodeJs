const express = require("express"),
      mongoskin = require("mongoskin"),
      bodyParser = require("body-parser");

const app = express();

const port = process.env.PORT || 5000;

var db = mongoskin.db("mongodb://@localhost:27017/testdatabase", {safe: true});
var id = mongoskin.helper.toObjetID;

var allowMethods = (req, res, next) => {
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    next();
};

var allowCrossTokenHeader = (req, res, next) => {
    res.header("Access-Control-Allow-Headers", "token");
    next();
};

var auth = (req, res, next) => {
    if(req.headers.token == "password123456789")
        return next();
    else
        return next(new Error("No autorizado"));
};

// http://localhost:8080/api/:coleccion/:id
app.param("coleccion", (req, res, next, coleccion) => {
    req.collection = db.collection(coleccion);
    next();
});

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(allowMethods);
app.use(allowCrossTokenHeader);

// POST
app.post("/api/:coleccion", auth, (req, res, next) => {
    req.collection.insert(req.body, {}, (e, result) => {
        if(e) return next(e);
        res.send(result);
    });
});
// GET
app.get("/api/:coleccion", auth, (req, res, next) => {
    req.collection.find({}, {limit: 10, sort: [['_id', -1]]}).toArray((e, results) => {
        if(e) return next(e);
        res.send(results);
    });
});
// GET
app.get("/api/:coleccion/:id", auth, (req, res, next) => {
   req.collection.findOne({_id: id(req.params.id)}, (e, result) => {
       if(e) return next(e);
        res.send(result);
   });
});
// PUT
app.put("/api/:coleccion/:id", auth, (req, res, next) => {
   req.collection.update({_id: id(req.params.id)}, {$set: req.body}, {safe: true, multi: false}, (e, result) => {
       if(e) return next(e);
        res.send((result === 1) ? {resultado: 'ok'} : {resultado: 'ko'});
   });
});
// DELETE
app.delete("/api/:coleccion/:id", auth, (req, res, next) => {
    req.collection.remove({_id: id(req.params.id)}, (e, result) => {
        if(e) return next(e);
        res.send((result === 1) ? {resultado: 'ok'} : {resultado: 'ko'});
    });
});

app.listen(port, () => {
    console.log(`Servidor corriendo en el puerto ${port}`);
});