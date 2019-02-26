//const web3Access = require('./public/js/app.js');

//web3Access.startWeb3();

var express = require("express");
var app = express();

app.get('/', function(req, res) {
  if (userIsLoggedIn()) {
    res.sendFile(__dirname + '/public/html/entry.html');
  } else {
    res.sendFile(__dirname + '/public/accessDenied.html');
  }
});

function userIsLoggedIn() {
  return true;
}

app.use(express.static('public'));

app.use('/html', express.static(__dirname + '/public/html'));
app.use('/css', express.static(__dirname + '/public/css'));
app.use('/js', express.static(__dirname + '/public/js'));
app.use('/images', express.static(__dirname + '/public/images'));

var server = app.listen(3000, function(){
    var port = server.address().port;
    console.log("Server started at http://localhost:%s", port);
});