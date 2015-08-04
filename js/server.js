var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

/* List of user */
var	users = [];

/* The serv send the index.html when it connect */
app.use(express.static(__dirname + '/../'));
app.get('/', function(req, res){
	var path = require("path");
	res.sendFile(path.join(__dirname, '..', 'index.html'));
});

io.on('connection', function(socket){
  var me = "";

  io.emit('connect');
  /* Send all the users allready connected when the user arrive to the page */
  for (var k in users)
  {
    io.emit('login', users[k]);
  }
  /* Check if the client who try to connecton don't allready exist*/
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
	}
  });

  socket.on('newmsg', function(msg){
  	io.emit('newmsg', "<div class=\"sender\">" + me + "</div><b><span class=\"glyphicon glyphicon-chevron-right btn-xs\"></span></b> " + msg);
  });

  socket.on('disconnect', function(){
    if (me)
    {
      users.splice(users.indexOf(me),1);
      io.emit('usrdeco', me);
      console.log("User disconnect: " + me);
      me = "";
    }
  });

  socket.on('usrdeco', function(usr){
    io.emit('usrdeco', usr);
    users.splice(users.indexOf(usr),1);
    console.log("User disconnect: " + usr);
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});