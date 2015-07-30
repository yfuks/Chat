var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static(__dirname + '/../'));
app.get('/', function(req, res){
	var path = require("path");
	res.sendFile(path.join(__dirname, '..', 'index.html'));
});

/*io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
});*/

io.on('connection', function(socket){
  socket.on('newusr', function(msg){
    console.log('New User: ' + msg);
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});