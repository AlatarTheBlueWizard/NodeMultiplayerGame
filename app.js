//File communication, will request files from server (images, etc.)
var express = require('express');
var app = express();
var server = require('http').Server(app);

app.get('/', function(req, res) {
	res.sendFile(__dirname + '/client/index.html');
});

app.use('/client', express.static(__dirname + '/client'));
server.listen(2000); //listening on port 2000
console.log('Server started');

var SOCKET_LIST = {}; //list of sockets being read
var PLAYER_LIST = {}; //list of players

var Player = function(id) {
	var self = {
		x:250,
		y:250,
		id:id,
		number: "" + Math.floor(10 * Math.random()), //distinguishes different players on screen
		pressingRight: false,
		pressingLeft: false,
		pressingUp: false,
		pressingDown: false,
		maxSpeed: 10
	}
	self.updatePosition = function() { //number will react to key the player presses
		if(self.pressingRight)
			self.x += self.maxSpeed;
		if(self.pressingLeft)
			self.x -= seld.maxSpeed;
		if(self.pressingUp)
			self.y -= self.maxSpeed;
		if(self.pressingDown)
			self.y += self.maxSpeed;
	}
	return self;
}

//socket.io configuration
var io = require('socket.io')(server, {});
io.sockets.on('connection', function(socket) {
	socket.id = Math.random(); //unique id for each socket
	SOCKET_LIST[socket.id] = socket; //add socket id to socket list

	var player = Player(socket.id);
	PLAYER_LIST[socket.id] = player;

	//when player disconnects, they will be be visually removed from the server
	socket.on('disconnect', function() {
		delete SOCKET_LIST[socket.id];
		delete PLAYER_LIST[socket.id];
	})

	//allows for keypress data to be received on the server side
	socket.on('keyPress', function(data) {
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

setInterval(function() { //loops through each socket and sends a package containing new x&y positions 
	var pack = []; //contains information for every player that joined
	for(var i in PLAYER_LIST) {
		var player = PLAYER_LIST[i];
		player.updatePosition(); //function that reacts to key press
		pack.push({ //push the position of each player to package on the client
			x:player.x,
			y:player.y,
			number:player.number
		})
	}
	for(var i in SOCKET_LIST) {
		var socket = SOCKET_LIST[i];
		socket.emit('newPositions', pack);
	}
}, 1000/25); //app will run at 25 frames per second