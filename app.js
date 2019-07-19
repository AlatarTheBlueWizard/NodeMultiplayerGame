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
	socket.id = Math.random();
	SOCKET_LIST[socket.id] = socket;

	socket.on('signIn',function(data){

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