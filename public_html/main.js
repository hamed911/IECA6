"use strict"
var Warehouse = require('./model/warehouse.js');
var User = require('./model/user.js');
var Goods = require('./model/goods.js');
var Consignment = require('./model/consignment.js');
var RepositoryLoader = require("./model/repositoryLoader.js");
var repositoryLoader = new RepositoryLoader();
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
    else if (str.length ===2 && order === "show" && str[1]==="ingredients"){
        showIngredient();
    }
    else if (order == "shipment") {
        shipment(str,command);
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

function showIngredient(){
    var ingredients= warehouse.getGoodsStatus();
    var tabnum=0;
    for(var name in ingredients)
        if(name.length/7>tabnum)
            tabnum = name.length/7;
    tabnum = Math.ceil(tabnum);
    var i=1;
    for( var goods in ingredients){
        if(ingredients.hasOwnProperty(goods)){
            console.log(myUtils.zeroPadding(i,2)+"\t"+goods+myUtils.spaceAlignment(goods,tabnum)+ingredients[goods][0]+"\t"+myUtils.numberWithCommas(ingredients[goods][1]))
            i++;
        }
    }
}

function shipment(str, command) {
    if (session == "admin") {
        if (str.length < 2) {
            console.log('Empty shipment is not valid.');
            return;
        }

        command = command.split("shipment ").pop();
        str = command.split(/\[|\]| |\,|\"/).filter(Boolean);
        
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
        console.log('present warehouse value: ' + numberWithCommas(value));
        
    }
    else
        console.log('This command is valid just for admin!');
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
