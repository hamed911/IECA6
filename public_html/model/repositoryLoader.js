"use strict"
var fs = require('fs');
var User = require('./user.js');
var Goods = require('./goods.js');
var Warehouse = require('./warehouse.js');
var Consignment = require('./consignment.js');

var RepositoryLoader= function(){
};

/*
 * if it would not be able to load from 'users.json' it returns null!
 * @returns {Array|RepositoryLoader.prototype.loadUsers.usersList} 
 */
RepositoryLoader.prototype.loadUsers = function (){
    var usersList = [];
    try{
        var users = JSON.parse(fs.readFileSync('./users.json', 'utf8'));
    }catch (ex){
        console.log("Error in reading \'users.json\'");
        return null;
    }
    users.push({
        "username": "admin",
        "password": "password"
    });
    
    for (var i = 0 ; i < users.length ; i++) {
        var user = new User(users[i].username, users[i].password);
        usersList.push(user);
    };
    return usersList;
};
/**
 * 
 * @returns {warehouse}
 */

RepositoryLoader.prototype.loadWarehouse = function (){
    var warehouse = new Warehouse();
    try{
        var wrhousePlain = JSON.parse(fs.readFileSync('./warehouse.json', 'utf8'));
    }catch (ex){
        console.log("Error in reading \'warehouse.json\'");
        return null;
    }
    for (var key in wrhousePlain) {
        (function (){
            if (wrhousePlain.hasOwnProperty(key)) {
                console.log(key + " -> " + wrhousePlain[key]);
                var listOfGoods =[];
                for(var i=0; i< wrhousePlain[key].length; i++){
                    (function (){
                      if(wrhousePlain[key][i].ingredient!==undefined && wrhousePlain[key][i].ingredient.hasOwnProperty("name"))
                          var name = wrhousePlain[key][i].ingredient.name;
                      var goods = new Goods(name,wrhousePlain[key][i].amount,wrhousePlain[key][i].price);
                      if(!goods.validate()){
                          console.log("Error in converting relevant 'json' to 'Goods': date = "+key + " index = "+i);
                          return;
                      }
                      listOfGoods.push(goods);
                    })();
                }
                warehouse.addNewConsignment(new Consignment(key,listOfGoods));
            }
        })();
    }
    return warehouse;
};

module.exports=RepositoryLoader;