var express = require("express");
var mongo = require("mongodb").MongoClient;
var request = require("request");

var app = express();
var port = process.env.PORT || 8080;
var url = process.env.MONGOLAB_URI;
var api_key = process.env.BING_KEY;

app.get('/favicon.ico', function(req,res) {
  res.sendStatus(200);
});

app.get('/', function(req,res) {
  mongo.connect(url, function(err,db) {
    if (err) throw err;
    var collection = db.collection('imagesearch');
    collection.find({}, {limit: 10, sort:['_id','-1']}).toArray(function(err,results) {
      var rList = [];
      results.forEach(function(result) {
        rList.push({"terms": result.search_entry});
      },this);
      res.end(JSON.stringify(rList));
    });
    db.close();
  });
});

app.get('/:query', function(req,res) {
  var pag = '';
  var img = [];
  if(req.query.offset===undefined) {
    pag = '10';
  }
  else {
    pag =  req.query.offset.toString();
  }
  mongo.connect(url, function(err,db) {
    if (err) throw err;
    var collection = db.collection('imagesearch');
    collection.insertOne({'search_entry' : req.params.query}, function(err,newEl) {
      if (err) throw err;
      db.close();
    });
  });
  var searchURL = 'https://api.cognitive.microsoft.com/bing/v5.0/images/search?q='+req.params.query+'&count='+ pag;
  var http = request({
    uri: searchURL,
    method: "GET",
    headers: { "Ocp-Apim-Subscription-Key": api_key}
  }, function(err,resp,body) {
    if(err) throw err;
    var a = JSON.parse(body);
    for(var i=0;i<a.value.length;i++) {
      img.push({'url': a.value[i].contentUrl, 'snippet': a.value[i].name, 'thumbnail': a.value[i].thumbnailUrl, 'context': a.value[i].hostPageDisplayUrl});
    }
    res.end(JSON.stringify(img));
  });
});

app.listen(port);
