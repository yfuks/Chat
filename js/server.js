/*
This .js handle the server part of the application in Node.js
Create the 29 jully 2015 by Yoann Fuks
*/

var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require('fs');
var removeDiacritics = require('diacritics').remove;

/* List of users */
var	users = [];

/* If a scramble game is currently running */
var scramble = false;

/* List of words for scramble */
var Words = [];
var word_to_find = "";
var word_fk_up = "";

/* TimeOut for the max time of a scramble game */
var TimeOut;

/* The serv send the index.html when it connect */
app.use(express.static(__dirname + '/../'));
app.get('/', function(req, res){
	var path = require("path");
	res.sendFile(path.join(__dirname, '..', 'index.html'));
});

/* Load all the words for the scramble game */
fs.readFile(__dirname + '/../resources/words.txt', 'utf8', function (err, data) {
  if (err)
    throw err;
  Words = data.split('\n');
});

/* This function handle when a client connect to the serv */
io.on('connection', function(socket){
  var me = "";

  io.emit('connect');

  /* Send all the users allready connected when the user arrive to the page */
  for (var k in users)
  {
    io.emit('login', users[k]);
  }

  /* When a user try to sign in */
  socket.on('newusr', function(usr){
  	var	found = false;
  
    /* Check if the client who try to sign in don't allready exist */
  	for (var k in users) 
  	{
  		if (users[k] == usr)
  		{
  			socket.emit('errorlog');
  			found = true;
  		}
  	}
    /* create user */
  	if (found == false)
  	{
      me = usr;
    	console.log('New User: ' + usr);
	    io.emit('login', usr);
	    users.push(usr);
  	}
  });

  /* When a client send a new message */
  socket.on('newmsg', function(msg){
    if (msg == "/scramble" && !scramble)
    {
      /* Pick a random word */
      word_to_find = Words[~~(Math.random() * Words.length)];
      word_fk_up = word_to_find;

      /* mix it */
      while (word_fk_up == word_to_find)
        word_fk_up = word_to_find.split('').sort(function(){return 0.5-Math.random()}).join(' ');

      /* Send a message to all client with the word to found*/
      io.emit('newmsg', "<div class=\"sender\" style=\"color:red\">[SCRAMBLE]</div> Nouvelle partie par @<span style=\"color:red\">" + me + "</span>: " + word_fk_up);
      console.log("Word to find : " + word_to_find);
      scramble = true;

      /* Send a fail message if no one find the answer after 1 min */
      TimeOut = setTimeout(function () {
        if (scramble == true)
        {
          io.emit('newmsg', "<div class=\"sender\" style=\"color:red\">[SCRAMBLE]</div> Partie terminée, vous êtes des gros nuls, la bonne réponse était : <span style=\"color:blue\">" + word_to_find + "</span>");
          scramble = false;
        }
      }, 60 * 1000);
    }
    else if (scramble && removeDiacritics(msg).toLowerCase().trim() == word_to_find.toLowerCase())
    {
      /* Send the victory message, end the game and remove the game-loosing callback */
      scramble = false;
      io.emit('newmsg', "<div class=\"sender\" style=\"color:red\">[SCRAMBLE]</div> Partie terminée, remportée par @<span style=\"color:red\">" + me + "</span>: <span style=\"color:blue\">" + word_to_find + "</span>");
      clearTimeout(TimeOut);
    }
    else if (msg == "/scramble")
      socket.emit('errorcmd', "<div class=\"sender\" style=\"color:red\">[SCRAMBLE]</div> Partie en cours, mot à trouver : <span style=\"color:blue\">" + word_fk_up + "</span>");
    else if (msg[0] == '/')
      socket.emit('errorcmd', "<div class=\"sender\" style=\"color:red\">[SERVEUR]</div> Command unknow : <span style=\"color:blue\">" + msg + "</span>");
    else if (scramble && msg.trim().indexOf(' ') < 0 && msg.trim().length == word_to_find.length)
      io.emit('newmsg', "<div class=\"sender\">" + me + "</div><b><span class=\"glyphicon glyphicon-chevron-right btn-xs\"></span></b><span style=\"color:green\">" + msg + "</span>");
    else
      io.emit('newmsg', "<div class=\"sender\">" + me + "</div><b><span class=\"glyphicon glyphicon-chevron-right btn-xs\"></span></b> " + msg);
  });

  /* When the user diconnect from the serv */
  socket.on('disconnect', function(){
    if (me)
    {
      /* Remove the user from the list and send to all client that the user is disconnected */
      users.splice(users.indexOf(me),1);
      io.emit('usrdeco', me);
      console.log("User disconnect: " + me);
      me = "";
    }
  });

  /* When an user disconnect */
  socket.on('usrdeco', function(usr){
    io.emit('usrdeco', usr);
    users.splice(users.indexOf(usr),1);
    console.log("User disconnect: " + usr);
  });
});

/* The serv listen on port 3000 */
http.listen(3000, function(){
  console.log('listening on *:3000');
});