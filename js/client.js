
/* This .js handle all the callback for the client */
/* Create the 29 jully 2015 by Yoann Fuks */
$('#button').click(function(){
		if ($('#lg_username').val() == '')
			return false;
		$('h6').remove();
  	  socket.emit('newusr', $('#lg_username').val());
});
  	  
socket.on('errorlog', function(){
$('.error-msg').append("<h6>Login allready taken</h6>");
});

socket.on('login', function(usr){
  	if (usr == $('#lg_username').val())
  	{
      $('.container1').fadeOut(300, function(){ $(this).remove();});
      $.cookie('chat', usr);
    }
  	if (!document.getElementById(usr))
    {
      $('.Users-body').append("<div class=\"cell\" id=\"" + usr + "\">" + usr + "</div>");
    }
});
  	  
$('.chat-send').click(function(){
if ($('#mssg').val() == '')
	return false;

  socket.emit('newmsg', $('#mssg').val());
  $('#mssg').val('');
});

socket.on('newmsg', function(msg){
$('.chat-body').append("<p>" + msg + "</p>");
});

socket.on('usrdeco', function(usr){
$('#' + usr).remove();
});