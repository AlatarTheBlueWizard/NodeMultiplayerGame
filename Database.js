var USE_DB = true;
var mongojs = USE_DB ? require("mongojs") : null;
var mongoose = USE_DB ? require("mongoose") : null;
//var db = USE_DB ? mongojs('localhost:27017/myGame', ['account','progress']) : null;
//var db = USE_DB ? 'mongodb+srv://admin:ad@mygame-4y1xa.mongodb.net/test?retryWrites=true&w=majority';//, ['account','progress'] : null;
var uri = "mongodb+srv://admin:ad@mygame-4y1xa.mongodb.net/test?retryWrites=true&w=majority";
retryWrites = true;
mongoose.connect(uri, {useNewUrlParser: true});
var db = mongoose.connection;
//account:  {username:string, password:string}
//progress:  {username:string, items:[{id:string,amount:number}]}

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