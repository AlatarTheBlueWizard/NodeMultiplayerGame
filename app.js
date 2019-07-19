//require databse, entity, and inventory files
require('./Database');
require('./Entity');
require('./client/Inventory');

// modules needed for express and http
var express = require('express');
var app = express();
var serv = require('http').Server(app);
 
// app listening on port 2000
app.set('port', (process.env.PORT || 2000));
app.get('/',function(req, res) {
    res.sendFile(__dirname + '/client/index.html');
});
app.use('/client',express.static(__dirname + '/client/'));
 
serv.listen(app.get('port'), function(req, res) {
	console.log('Game is running on port', app.get('port'));
});

// list of socket connections
var SOCKET_LIST = {};
var DEBUG = true;
 
//multiplayer functionalty (sockets)
var io = require('socket.io')(serv,{});
io.sockets.on('connection',function(socket){
socket.on('signIn',function(data){ //{username,password}
		Database.isValidPassword(data,function(res){
			if(!res)
				return socket.emit('signInResponse',{success:false});
			Database.getPlayerProgress(data.username,function(progress){
				Player.onConnect(socket,data.username,progress);
				socket.emit('signInResponse',{success:true});
			})
		});
	});
	
	//sign up config
	socket.on('signUp',function(data){
		Database.isUsernameTaken(data,function(res){
			if(res){
				socket.emit('signUpResponse',{success:false});		
			} else {
				Database.addUser(data,function(){
					socket.emit('signUpResponse',{success:true});					
				});
			}
		});		
	});
	
	//disconnect config
	socket.on('disconnect',function(){
		delete SOCKET_LIST[socket.id];
		Player.onDisconnect(socket);
	});
	
	//config for messaging
	socket.on('evalServer',function(data){
		if(!DEBUG)
			return;
		var res = eval(data);
		socket.emit('evalAnswer',res);		
	});
});
 
setInterval(function(){
    var packs = Entity.getFrameUpdateData();
    for(var i in SOCKET_LIST){
        var socket = SOCKET_LIST[i];
        socket.emit('init',initPack);
        socket.emit('update',pack);
        socket.emit('remove',removePack);
    } 
},1000/25); //game runs at 25 frames per second