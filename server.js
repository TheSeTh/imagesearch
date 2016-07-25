var express = require("express");
var mongo = require("mongodb").MongoClient;

var app = express();
var port = process.env.PORT || 8080;

app.get('/', function(req,res) {

});

app.listen(port);
