
/* This .js handle all the callback for the client in jQuery
 Create the 29 jully 2015 by Yoann Fuks */


var me = "";

socket.on('connect', function() {
  if ($.cookie('chat'))
    socket.emit('newusr', $.cookie('chat'));
}); 


/* This function handle the sending of a new user to serv */
$('#button').click(function(){
		if ($('#lg_username').val() == '')
			return false;
		$('h6').remove();
  	  socket.emit('newusr', $('#lg_username').val());
});

/* This function print an error if the serv send an error to the client*/
socket.on('errorlog', function(){
$('.error-msg').append("<h6>Login allready taken</h6>");
});

/* This function handle when an User connection is recieved */
socket.on('login', function(usr){
    if (usr == $('#lg_username').val())
  	{
      $('.container1').hide(1000);
      $('#lg_username').val('');
      me = usr;
      if ($('#lg_remember')[0].checked)
        $.cookie('chat', usr);
    }
    else if (usr == $.cookie('chat'))
    {
      $('.container1').hide();
    }
    // If the user isn't allready print
  	if (!document.getElementById(usr))
    {
      if ($.cookie('chat') === usr || me == usr)
      {
        $('.Users-body').append("<div class=\"cell\" id=\"" + usr + "\" style=\"color:red\">" + usr + "</div>");
      }
      else
      {
        $('.Users-body').append("<div class=\"cell\" id=\"" + usr + "\">" + usr + "</div>");
      }
    }
});

/* This function send a new message when the button is click */
$('.chat-send').click(function(){
if ($('#mssg').val() == '')
	return false;

  socket.emit('newmsg', $('#mssg').val());
  $('#mssg').val('');
});

/* This function handle exit */
$('.exit').click(function(){
    socket.emit('usrdeco', $.cookie('chat'));
  $.removeCookie('chat');
  $('.container1').show();
});

/* This function handle Enter and Esc for the message input */
$('#mssg').keyup(function (e) {
 var key = e.which;
 if(key == 13)//Enter
  {
    $('.chat-send').trigger('click');
    return false;
  }
  if (key == 27)//Esc
  {
    $('#mssg').val('');
  }
});

/* This function handle when a new msg arrive from the serv */
socket.on('newmsg', function(msg){
  var d = new Date();
  d.setTime( d.getTime() - d.getTimezoneOffset()*60*1000);
  var h = d.getUTCHours();
  var m = d.getUTCMinutes();
$('.chat-body').append("<div class=\"cell\"><div class=\"time\">" + h + ":" + m + "</div><div class=\"msg\">" + msg + "</div></div>");
});

/* This function remove a user from the list when the client receive the usrdeco*/
socket.on('usrdeco', function(usr){
$('#' + usr).remove();
});