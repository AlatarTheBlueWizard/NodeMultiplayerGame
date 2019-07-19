var USE_DB = true;
var mongojs = USE_DB ? require("mongojs") : null;
var db = USE_DB ? mongojs('', ['account','progress']) : null;

//account table: {username:string, password:string}
//progress table: {username:string, items:[{id:string,amount:number}]}

