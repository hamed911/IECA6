"use strict"
var Warehouse = require('./model/warehouse.js');
var User = require('./model/user.js');
var Goods = require('./model/goods.js');
var Consignment = require('./model/consignment.js');
var RepositoryLoader = require("./model/repositoryLoader.js");
var repositoryLoader = new RepositoryLoader();
var DiningService = require("./model/diningService.js");
var diningService = new DiningService();
var Utils = require('./domain/utils.js');
var myUtils = new Utils();

var usersList = repositoryLoader.loadUsers();
var warehouse = repositoryLoader.loadWarehouse();
var recipes = repositoryLoader.loadRecipes();

var session = null;
var authenticationStatus = Object.freeze({ W_USER:-1, W_PASS: 0, LOGIN: 1, BLOCK: 2 });

var stdin = process.openStdin();

stdin.addListener("data", function(d) { 
    inputHandle(d.toString().trim());       
});

function inputHandle(command) {
    var str = command.split(" ");
    var order = str[0];
    
    if (str.length === 3 && order === "login") {
        login(str);
    }
    else if (str.length === 1 && order === "logout") {
        logout();
    }
    else if (str.length === 2 && order === "show" && str[1] === "ingredients"){
        showIngredient();
    }
    else if (str.length === 2 && order === "show" && str[1] === "recipes"){
        showRecipes();
    }
    else if (str.length === 2 && order === "confirm" && str[1] === "menu"){
        showRecipes();
    }
    else if (str.length >=3 && order === "estimate"){
        estimateMeal(str[1],command.toString().substr(10+str[1].length));
    }
    else if (order == "shipment") {
        shipment(str,command);
    }
    else if (order == "menu") {
        createOrUpdateCurrentMenu(str,command);
    }
    else
        console.log('Invalid command!');
}

function login(str) {

    if (session != null) {
        console.log('The other user is already login, so you should logout first!');
        return;
    }
    var result;

    result = authenticate(str[1], str[2]);

    if (result == authenticationStatus.LOGIN) {
        console.log('Wellcome ' + str[1] + '!');
        session = str[1];
    }
    else if (result == authenticationStatus.W_USER) {
        console.log('Account with this username does not exist!');
        return;
    }
    else if (result == authenticationStatus.W_PASS) {
        var user = getUser(str[1]);
        user.countOfWrongLogin += 1;
       
        if (user.countOfWrongLogin >= 3) {
            var d = new Date();
            user.activeTime = d.getTime();
            console.log('---> ' + d);
            console.log('Invalide password, your account was blocked for 2 minutes..');
            
        }
        else
            console.log('Invalide password, please try again...');
    }
    else if (result == authenticationStatus.BLOCK) {
        var d = new Date();
        var time = (120000 - (parseInt(d.getTime()) - parseInt(getUser(str[1]).activeTime)) ) / 1000;
        console.log('Your account is blocked for '+ time +' seconds later!');
    }
}

function logout() {
    if (session != null) {
        console.log('Goodbye ' + session + '!');
        session = null;
    }
    else
        console.log('First login!');
}

function authenticate(user, pass) {
    var usr = false;
    for (var i = 0; i < usersList.length; i++) {
        if (usersList[i].username == user)
        {
            usr = true;
            if (usersList[i].password == pass) {
                //console.log(usersList[i].activeTime);
                if (usersList[i].activeTime == null || parseInt(usersList[i].activeTime) + 120000 <= parseInt(new Date().getTime())) {
                    usersList[i].countOfWrongLogin = 0;
                    usersList[i].activeTime = null;
                    return authenticationStatus.LOGIN;
                }
                else
                    return authenticationStatus.BLOCK;
            }
        }
    }
    if (usr)
        return authenticationStatus.W_PASS;
    return authenticationStatus.W_USER;
}

function getUser(name) {
    for (var i = 0; i < usersList.length; i++) {
        if (usersList[i].username == name) {
            return usersList[i];
        }
    }
    return null;
}

function determineTabNumber(ingredients){
    var tabnum=0;
    for(var name in ingredients)
        if(myUtils.numberOfTabsForTableAlignment(name)>tabnum)
            tabnum = myUtils.numberOfTabsForTableAlignment(name);
    return tabnum;
};

function showIngredient(){
    var ingredients= warehouse.getGoodsStatus();
    var tabnum=determineTabNumber(ingredients);
    var i=1;
    for( var goods in ingredients){
        if(ingredients.hasOwnProperty(goods)){
            console.log(myUtils.zeroPadding(i,2)+"\t"+goods+myUtils.spaceAlignment(goods,tabnum)+ingredients[goods][0]+"\t"+myUtils.numberWithCommas(ingredients[goods][1]))
            i++;
        }
    }
}

function showRecipes(){
    for(var i=0; i<recipes.length; i++){
        console.log(myUtils.zeroPadding(i+1,2)+"\t"+recipes[i].name);
        var total=0;
        var error="";
        var str="";
        for( var j=0; j<recipes[i].ingredients.length; j++){
            var estimate = warehouse.goodsEstimatedCost(recipes[i].ingredients[j].name,recipes[i].ingredients[j].amount);
            if(estimate===undefined)
                error+=recipes[i].ingredients[j].name+",";
            str+=recipes[i].ingredients[j].name+": "+recipes[i].ingredients[j].amount;
            if(j!=recipes[i].ingredients.length-1)
                str+=", ";
            total+=estimate;
        }
        console.log("\t"+str);
        if(error.length>0 && isNaN(total))
            console.log("Unable to estimate cost of "+error)
        else
            console.log("\t"+myUtils.numberWithCommas( total));
        
    }
}

function estimateMeal(amount,meal){
   console.log("ingredient\trequired\tavailable\tpurchase price"); 
   var knownMeal = false;
   var total =0;
    for(var i=0; i<recipes.length; i++){
        if(recipes[i].name ===meal){
            knownMeal=true;
            var tabNumnber = determineTabNumber(recipes[i].ingredients);
            if(tabNumnber< myUtils.numberOfTabsForTableAlignment("ingredient"))
                tabNumnber = myUtils.numberOfTabsForTableAlignment("ingredient");
            for( var j=0; j<recipes[i].ingredients.length; j++){
                var goods = warehouse.getAvailableGoods(recipes[i].ingredients[j].name);
                var available;
                var purchasePrice;
                if(!goods){
                    available=undefined;
                    purchasePrice=undefined;
                }else{
                    available=goods[1];
                    purchasePrice= recipes[i].ingredients[j].amount*amount>available?
                        (recipes[i].ingredients[j].amount*amount-available)*goods[0]:0;
                    total+=purchasePrice;
                    purchasePrice=myUtils.numberWithCommas(purchasePrice);
                }
                console.log(recipes[i].ingredients[j].name+myUtils.spaceAlignment(recipes[i].ingredients[j].name,tabNumnber)+
                        recipes[i].ingredients[j].amount*amount+"\t\t"+available+"\t\t"+purchasePrice);
            }
        }
    }
    if(!knownMeal)
        console.log("There is no recipe for the respective meal.");
    console.log("\t\t\t\t\t\t"+myUtils.numberWithCommas(total));
}

function shipment(str, command) {
    if (session == "admin") {
        if (str.length < 2) {
            console.log('Empty shipment is not valid.');
            return;
        }

        command = command.split("shipment ").pop();
        //str = command.split(/\[|\]| |\,|\"/).filter(Boolean);
        str = command.split(/\[|\]|\, |\"|\,/).filter(Boolean);
        console.log(str);
        
        if (str.length % 3 != 0) {
            console.log('Invalid arguments!');
            return;
        }
        var shipment;
        for (var i = 0; i < str.length; i = i + 3) {
            if (i == 0) {
                var list = [];
                list.push(new Goods(str[i], str[i + 1], str[i + 2]));
                var date = new Date();
                var myDate = date.getDate() + '-' + date.getMonth() + '-' + date.getFullYear();
                
                shipment = new Consignment(myDate, list);
            }
            else {
                if (!shipment.isExist(str[i]))
                    shipment.addIntoGoods(str[i], str[i + 1], str[i + 2]);
                else {
                    console.log(str[i] + ': already exists!\nShipment was not accepted.');
                    return;
                }
            }
        }
        
        warehouse.addNewConsignment(shipment);
        var value = warehouse.calculateValue();
        //repositoryLoader.writeWarehouse(warehouse);
        console.log('present warehouse value: ' + myUtils.numberWithCommas(value));
        
    }
    else
        console.log('This command is valid just for admin!');
}

function createOrUpdateCurrentMenu(str, command) {
    if (str.length < 2) {
        console.log('Empty menu is not valid.');
        return;
    }
    if(str[1]==="-repeat"){
        try{
            diningService.repeatPreviousWeekMenu();
        }catch (ex){
            console.log(ex);
        }
    }else{
        command = command.split("menu ").pop();
        str = command.split(/\[|\]|\, |\"|\,/).filter(Boolean);
        if (str.length % 3 != 0) {
            console.log('Invalid arguments!');
            return;
        }
        try{
            diningService.createMenu(str);
        }catch (ex){
            console.log(ex);
        }
    }
}

function confirmMenu (){
    try{
        diningService.confirmMenu();
    }catch (ex){
        console.log(ex)
    }
    
}