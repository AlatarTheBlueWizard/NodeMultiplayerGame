var initPack = {player:[],bullet:[]};
var removePack = {player:[],bullet:[]};

//Entity object
Entity = function(param) {
	var self = {
		x:250,
		y:250,
		spdX:0,
		spdY:0,
		id:"",
		map:'forest',
	}
	if(param) {
		if(param.x)
			self.x = param.x;
		if(param.y)
			self.y = param.y;
		if(param.map)
			self.map = param.map;
		if(param.id)
			self.id = param.id;
	}

	self.update = function(){
		self.updatePosition();
	}
	self.updatePosition = function(){
		self.x += self.spdX;
		slef.y += self.spdY;
	}
	self.getDistance = function(pt){
		return Math.sqrt(Math.pow(self.x-pt.x,2) + Math.pow(self.y-pt.y,2));
	}
	return self;
}

//Entity frame handler
Entity.getFrameUpdateData = function(){
	var pack = {
		initPack:{
			player:initPack.player,
			bullet:initPack.bullet,
		},
		removePack:{
			player:removePack.player,
			bullet:removePack.bullet,
		},
		updatePack:{
			player:Player.update(),
			bullet:Bullet.update(),
		}
	};
	initPack.player = [];
	initPack.bullet = [];
	removePack.player = [];
	removePack.bullet = [];
	return pack;
}

//player data and object
Player = function(param){
	var self = Entity(param);
	self.number = "" + Math.floor(10 * Math.random());
	self.username = param.username;
	self.pressingRight = false;
	self.pressingLeft = false;
	self.pressingUp = false;
	self.pressingDown = false;
	self.pressingAttack = false;
	self.mouseAngle = 0;
	self.maxSpd = 10;
	self.hp = 10;
	self.hpMax = 10;
	self.score = 0;
	self.inventory = new Inventory(param.progress.items,param.socket,true);

	//super update
	var super_update = self.update;
	self.update = function(){
		super_update();
		if(self.pressingAttack){
			self.shootBullet(self.mouseAngle);
		}
	}
	//bullet config
	self.shootBullet = function(angle){
		if(Math.random() < 0.1)
			self.inventory.addItem("potion",1);
		Bullet({
			parent:self.id,
			angle:angle,
			x:self.x,
			y:self.y,
			map:self.map,
		});
	}
	//speed update config
	self.updateSpd = function(){
		if(self.pressingRight)
			self.spdX = self.maxSpd;
		else if(self.pressingLeft)
			self.spdX = -self.maxSpd;
		else
			self.spdX = 0;

		if(self.pressingUp)
			self.spdY = -self.maxSpd;
		else if(self.pressingDown)
			self.spdY = self.maxSpd;
		else
			self.spdY = 0;
	}
	//retrieve entity data
	self.getInitPack = function(){
		return {
			id:self.id,
			x:self.x,
			y:self.y,
			number:self.number,
			hp:self.hp,
			hpMax:self.hpMax,
			score:self.score,
			map:self.map,
		};
	}
	//retrieve updated data
	self.getUpdatePack = function(){
		return {
			id:self.id,
			x:self.x,
			y:self.y,
			hp:self.hp,
			score:self.score,
			map:self.map,
		};
	}

	//set id to specific player in list
	Player.list[self.id] = self;
	//push new player to entity
	initPack.player.push(self.getInitPack());
	return self;
}

//list of players in game
Player.list = {};
Player.onConnect = function(socket,username,progress){
	var map = 'forest';
	if(Math.random() < 0.5)
		map = 'field';
	var player = Player({
		username:username,
		id:socket.id,
		map:map,
		socket:socket,
		progress:progress,
	});
	//refresh inventory on player connect
	player.inventory.refreshRender();

	//key press config
	socket.on('keyPress',function(data){
		if(data.inputId === 'left')
			player.pressingLeft = data.state;
		else if(data.inputId === 'right')
			player.pressingRight = data.state;
		else if(data.inputId === 'up')
			player.pressingUp = data.state;
		else if(data.inputId === 'down')
			player.pressingDown = data.state;
		else if(data.inputId === 'attack')
			player.pressingAttack = data.state;
		else if(data.inputId === 'mouseAngle')
			player.mouseAngle = data.state;
	});

	//map change config
	socket.on('changeMap',function(data){
		if(player.map === 'field')
			player.map = 'forest';
		else
			player.map = 'field';
	});

	//chat message config
	socket.on('sendMsgToServer',function(data){
		for(var i in SOCKET_LIST){
			SOCKET_LIST[i].emit('addToChat',player.username + ': ' + data);
		}
	});

	//personal chat message config
	socket.on('sendPmToServer',function(data){
		var recipientSocket = null;
		for(var i in Player.list)
			if(Player.list[i].username === data.username)
				recipientSocket = SOCKET_LIST[i];
		if(recipientSocket === null)
			socket.emit('addToChat','The player ' + data.username + ' is not online.');
		else {
			recipientSocket.emit('addToChat','From ' + player.username + ':' + data.message);
			socket.emit('addToChat','To ' + data.username + ':' + data.message);
		}
	});

	//emit message config
	socket.emit('init',{
		selfId:socket.id,
		player:Player.getAllInitPack(),
		bullet:Bullet.getAllInitPack(),
	})
}

//all data config for players
Player.getAllInitPack = function(){
	var players = [];
	for(var i in Player.list)
		players.push(Player.list[i].getInitPack());
	return players;
}

//player disconnect config
Player.onDisconnect = function(socket){
	let player = Player.list[socket.id];
	if(!player)
		return;
	Database.savePlayerProgress({
		username:player.username,
		items:player.inventory.items,
	});
	delete Player.list[socket.id];
	removePack.player.push(socket.id);
}

//player update config
Player.update = function(){
	var pack = [];
	for(var i in Player.list){
		var player = Player.list[i];
		player.update();
		pack.push(player.getUpdatePack());
	}
	return pack;
}