/*var USE_DB = true;
var mongojs = USE_DB ? require("mongojs") : null;
var uri = 'mongodb+srv://admin:ad@mygame-4y1xa.mongodb.net/test?retryWrites=true&w=majority';
var db = USE_DB ? mongodb(uri, ['account','progress']) : null;*/
//account:  {username:string, password:string}
//progress:  {username:string, items:[{id:string,amount:number}]}
var USE_DB = true;
var collections = ["account","progress"];
var mongojs = require('mongojs');
var db = USE_DB ? mongojs("127.0.0.1:27017/"+myGame, collections) : null;

Database = {};
Database.isValidPassword = function(data,cb){
    if(!USE_DB)
        return cb(true);
	db.account.find({username:data.username,password:data.password},function(err,res){
		if(res)
			cb(true);
		else
			cb(false);
	});
}
Database.isUsernameTaken = function(data,cb){
    if(!USE_DB)
        return cb(false);
	db.account.find({username:data.username},function(err,res){
		if(res)
			cb(true);
		else
			cb(false);
	});
}
Database.addUser = function(data,cb){
    if(!USE_DB)
        return cb();
	db.account.insert({username:data.username,password:data.password},function(err){
        Database.savePlayerProgress({username:data.username,items:[]},function(){
            cb();
        })
	});
}
Database.getPlayerProgress = function(username,cb){
    if(!USE_DB)
        return cb({items:[]});
	db.progress.find({username:username},function(err,res){
		cb({items:res.items});
	});
}
Database.savePlayerProgress = function(data,cb){
    cb = cb || function(){}
    if(!USE_DB)
        return cb();
    db.progress.update({username:data.username},data,{upsert:true},cb);
}