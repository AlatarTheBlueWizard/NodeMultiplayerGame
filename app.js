//File comm. code, requests files from server (images, etc.)
var express = require('express');
var app = express();
var server = require('http').Server(app);

app.get('/', function(req, res) {
	res.sendFile(__dirname + '/client/index.html');
})
app.use('/client', express.static(__dirname + '/client'));
server.listen(2000); //listens on port 2000
console.log('Server started');

var SOCKET_LIST = {}; //list of sockets being read
var PLAYER_LIST = {}; //list of players

var Player = function(id) {
	var self = {
		x:250,
		y:250,
		id:id,
		number:"" + Math.floor(10 * Math.random()), //used to distinguish diff players
		pressingRight:false,
		pressingLeft:false,
		pressingUp:false,
		pressingDown:false,
		maxSpd:10
	}
	self.updatePosition = function() { //reacts based on user key press
		if(self.pressingRight)
			self.x += self.maxSpd;
		if(self.pressingLeft)
			self.x -= self.maxSpd;
		if(self.pressingUp)
			self.y -= self.maxSpd;
		if(self.pressingDown)
			self.y += self.maxspd;
	}
	return self;
}

//socket io config
var io = require('socket.io')(server,{});
io.sockets.on('connection', function(socket) {
	socket.id = Math.random(); //unique id for each socket
	SOCKET_LIST[socket.id] = socket; //add socket id to socket list
	
	var player = Player(socket.id);
	PLAYER_LIST[socket.id] = player;
	
	//when player disconnects, they will be visually removed from server
	socket.on('disconnect', function(){
		delete SOCKET_LIST[socket.id];
		delete PLAYER_LIST[socket.id];
	})
	
	//allows for keypress data to be receieved on server end
	socket.on('keyPress',function(data){
		if(data.inputId === 'left')
			player.pressingLeft = data.state;
		else if(data.inputId === 'right')
			player.pressingRight = data.state;
		else if(data.inputId === 'up')
			player.pressingUp = data.state;
		else if(data.inputId === 'down')
			player.pressingDown = data.state;
	})
})

setInterval(function(){ //loops through each socket and sends package containing new x & y pos
	var pack = []; //contains info for every player that joined
	for(var i in PLAYER_LIST){
		var player = PLAYER_LIST[i];
		player.updatePosition(); //function that reacts to user key press
		pack.push({ //push pos of each player to pack on client
			x:player.x,
			y:player.y,
			number:player.number
		})
	}
	for(var i in SOCKET_LIST) {
		var socket = SOCKET_LIST[i];
		socket.emit('newPositions',pack);
	}
},1000/25); //will run at 25 frames per second