/*var USE_DB = true;
var mongojs = USE_DB ? require("mongojs") : null;
var db = USE_DB ? mongojs('mongodb+srv://user:pass@mygame-4y1xa.mongodb.net/test?retryWrites=true&w=majority', ['account','progress']) : null;
*/
//account collection: {username:string, password:string}
//progress collection: {username:string, items:[{id:string,amount:number}]}
var USE_DB = true;
var mongodb = USE_DB ? require('mongodb') : null;
var mongojs = USE_DB ? require("mongojs") : null;
var MongoClient = mongodb.MongoClient;
var url = 'mongodb+srv://user:pass@mygame-4y1xa.mongodb.net/test?retryWrites=true&w=majority';
var db = USE_DB ? url : null;

Database = {};
Database.isValidPassword = function(data,cb){
			if(!USE_DB)
				return cb(true);
			db.account.findOne({username:data.username,password:data.password},function(err,res){
				if(res)
					cb(true);
				else
					cb(false);
			});
		}

		Database.isUsernameTaken = function(data,cb){
			if(!USE_DB)
				return cb(false);
			db.account.findOne({username:data.username},function(err,res){
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
			db.progress.findOne({username:username},function(err,res){
				cb({items:res.items});
			});
		}

		Database.savePlayerProgress = function(data,cb){
			cb = cb || function(){}
			if(!USE_DB)
				return cb();
			db.progress.update({username:data.username},data,{upsert:true},cb);
		}
/*MongoClient.connect(url,function(err,db){
	if(err)
		console.log('Unable to connect to the mongoDB server. Error:', err);
	else {
		//Database = {};
		Database.isValidPassword = function(data,cb){
			if(!USE_DB)
				return cb(true);
			db.account.findOne({username:data.username,password:data.password},function(err,res){
				if(res)
					cb(true);
				else
					cb(false);
			});
		}

		Database.isUsernameTaken = function(data,cb){
			if(!USE_DB)
				return cb(false);
			db.account.findOne({username:data.username},function(err,res){
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
			db.progress.findOne({username:username},function(err,res){
				cb({items:res.items});
			});
		}

		Database.savePlayerProgress = function(data,cb){
			cb = cb || function(){}
			if(!USE_DB)
				return cb();
			db.progress.update({username:data.username},data,{upsert:true},cb);
		}
	}
});*/
