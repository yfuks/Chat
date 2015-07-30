var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var	users = [];

app.use(express.static(__dirname + '/../'));
app.get('/', function(req, res){
	var path = require("path");
	res.sendFile(path.join(__dirname, '..', 'index.html'));
});

io.on('connection', function(socket){
  socket.on('newusr', function(usr){
    console.log('New User: ' + usr);
    io.emit('newusr', usr);
    users.push(usr);
  });
  socket.on('newmsg', function(msg){
  	io.emit('newmsg', msg);
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});