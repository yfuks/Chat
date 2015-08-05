var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require('fs');
var removeDiacritics = require('diacritics').remove;

/* List of user */
var	users = [];
var scramble = false;
var Words = [];
var word_to_find = "";
var word_fk_up = "";

/* The serv send the index.html when it connect */
app.use(express.static(__dirname + '/../'));
app.get('/', function(req, res){
	var path = require("path");
	res.sendFile(path.join(__dirname, '..', 'index.html'));
});

fs.readFile(__dirname + '/../resources/words.txt', 'utf8', function (err, data) {
  if (err)
    throw err;
  Words = data.split('\n');
});


io.on('connection', function(socket){
  var me = "";

  io.emit('connect');
  /* Send all the users allready connected when the user arrive to the page */
  for (var k in users)
  {
    io.emit('login', users[k]);
  }
  /* Check if the client who try to connecton don't allready exist */
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
    if (msg == "/scramble" && !scramble)
    {
      word_to_find = Words[~~(Math.random() * Words.length)];
      word_fk_up = word_to_find;
      while (word_fk_up == word_to_find)
        word_fk_up = word_to_find.split('').sort(function(){return 0.5-Math.random()}).join('');
      io.emit('newmsg', "<div class=\"sender\">[SCRAMBLE]</div> Nouvelle partie par @" + me + ": " + word_fk_up);
      console.log("Word to find : " + word_to_find);
      scramble = true;
    }
    else if (scramble && removeDiacritics(msg).toLowerCase().trim() == word_to_find.toLowerCase())
    {
      scramble = false;
      io.emit('newmsg', "<div class=\"sender\">[SCRAMBLE]</div> Partie terminée, remportée par @" + me + ": " + word_to_find);
    }
    else
    {
      io.emit('newmsg', "<div class=\"sender\">" + me + "</div><b><span class=\"glyphicon glyphicon-chevron-right btn-xs\"></span></b> " + msg);
    }
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