var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var	users = [];
var	me = "";

app.use(express.static(__dirname + '/../'));
app.get('/', function(req, res){
	var path = require("path");
	res.sendFile(path.join(__dirname, '..', 'index.html'));
});

io.on('connection', function(socket){
  socket.on('newusr', function(usr){

  	var	found = false;

  	for (var k in users) 
  	{
  		if (users[k] == usr)
  		{
  			socket.emit('errorlog');
  			found = true;
  		}
  	}
  	if (found == false)
  	{
  		me = usr;
    	console.log('New User: ' + usr);
	    io.emit('login', usr);
	    users.push(usr);
	    console.log(users);
	}
  });

  socket.on('newmsg', function(msg){
  	io.emit('newmsg', msg);
  });

  socket.on('quit', function() {
  	delete users[me];
	console.log(users);
  });

});

http.listen(3000, function(){
  console.log('listening on *:3000');
});