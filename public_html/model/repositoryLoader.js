"use strict"
var fs = require('fs');
var User = require('./user.js');
var Goods = require('./goods.js');
var Warehouse = require('./warehouse.js');
var Consignment = require('./consignment.js');
var Recipe = require('./recipe.js');
var Ingredient = require('./ingredient.js')

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

/**
 * 
 * @returns {Array of recipe}
 */
RepositoryLoader.prototype.loadRecipes = function (){
    var recepies = [];
    try{
        var plainRecepies = JSON.parse(fs.readFileSync('./recipes.json', 'utf8'));
    }catch (ex){
        console.log("Error in reading \'recipes.json\'");
        return null;
    }
    for(var i=0; i<plainRecepies.length; i++){
        (function (){
            try{
                if(plainRecepies[i].name===null || plainRecepies[i].name===undefined)
                    throw new Error("Invalid recepie name. Index : "+i);
                if(plainRecepies[i].recipe===null || plainRecepies[i].recipe==undefined)
                    throw new Error("recipe did not find. Index : "+i);
                var ingredients = [];
                (function (){
                    for(var j=0; j<plainRecepies[i].recipe.length; j++){
                        if(plainRecepies[i].recipe[j].ingred ==null || plainRecepies[i].recipe[j].ingred=== undefined)
                            continue;
                        if(plainRecepies[i].recipe[j].ingred.name ==null || plainRecepies[i].recipe[j].ingred.name=== undefined)
                            throw new Error("Invalid ingredient's name. Index: "+i+" Item: "+j);
                        if(plainRecepies[i].recipe[j].amount===null || plainRecepies[i].recipe[j].amount===undefined)
                            throw new Error("Invalid ingredient's amount. Index: "+i+" Item: "+j);
                        ingredients.push(new Ingredient(plainRecepies[i].recipe[j].ingred.name,plainRecepies[i].recipe[j].amount));
                    }
                })();
                recepies.push(new Recipe(plainRecepies[i].name,ingredients))
            }catch (ex){
                console.log(ex)
            }
        })();
    }
    return recepies;
};

RepositoryLoader.prototype.writeWarehouse = function (data) {
    var file = './warehouse.json'
    fs.writeFile(file, data, function (err) {
        console.error(err)
    })
}

module.exports=RepositoryLoader;