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

stdin.addListener("data", function (d) {
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
    else if (str.length === 2 && order === "show" && str[1] === "ingredients" && session === "admin"){
        showIngredient();
    }
    else if (str.length === 2 && order === "show" && str[1] === "recipes" && session === "admin") {
        showRecipes();
    }
    else if (str.length ===2 && order === "show" && str[1]==="menu" && session != null){
        showMenu();
    }
    else if (str.length === 2 && order === "confirm" && str[1] === "menu" && session === "admin") {
        confirmMenu();
    }
    else if (str.length >= 3 && order === "estimate" && session === "admin") {
        estimateMeal(str[1], command.split('estimate ' + str[1] + ' ').pop());
    }
    else if (str.length >= 2 && order === "show" && str[1] === "reservations" && session != null) {
        showReservations(str);
    }
    else if (str.length >= 3 && order === "reserve" && session != null) {
        try{
            reserveMeal(str[1], command.split('reserve ' + str[1] + ' ').pop());
        }catch (ex){
            console.log(ex);
        }
    }
    else if (order == "shipment" && session === "admin") {
        shipment(str,command);
    }
    else if (order == "menu" && session === "admin") {
        createOrUpdateCurrentMenu(str,command);
    }
    else if (str.length == 2 && order == "finalize" && str[1] == "reservations" && session === "admin") {
        finalizeReservations();
    }
    else {
        if(session != null)
            console.log('Invalid command!');
        else
            console.log('Login first!');
    }
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
        console.log('Login First!');
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
    var tabnum = 0;
    for(var name in ingredients)
        if(myUtils.numberOfTabsForTableAlignment(name)>tabnum)
            tabnum = myUtils.numberOfTabsForTableAlignment(name);
    return tabnum;
};

function showIngredient(){
    var ingredients = warehouse.getGoodsStatus();
    var tabnum = determineTabNumber(ingredients);
    var i = 1;

    for (var goods in ingredients) {
        if(ingredients.hasOwnProperty(goods)){
            console.log(myUtils.zeroPadding(i,2)+"\t"+goods+myUtils.spaceAlignment(goods,tabnum)+ingredients[goods][0]+"\t"+myUtils.numberWithCommas(ingredients[goods][1]))
            i++;
        }
    }
}

function showRecipes(){
    for (var i = 0; i < recipes.length; i++){
        console.log(myUtils.zeroPadding(i+1,2)+"\t"+recipes[i].name);
        var total=0;
        var error="";
        var str="";
        for (var j = 0; j < recipes[i].ingredients.length; j++){
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
            diningService.createMenu(str,recipes);
        }catch (ex){
            console.log(ex);
        }
    }
}

function showMenu(){
    try{
        diningService.userCommandShowMenu();
    }catch (ex){
        console.log(ex);
    }
}

function confirmMenu (){
    try{
        diningService.confirmMenu();
    }catch (ex){
        console.log(ex)
    }
    
}

function reserveMeal (day,food){
    if(session === null)
        throw new Error("You should login first.");
    var foodExist = false;
    for(var i=0; i<recipes.length; i++){
        if(recipes[i].name === food){
            foodExist = true;
            var actualFoodCost=0;
            for( var j=0; j<recipes[i].ingredients.length; j++){
                if(!warehouse.getAvailableGoods(recipes[i].ingredients[j].name))
                    throw new Error("Reservation failed. '"+recipes[i].ingredients[j].name+"' did not find in warehouse.")
                if( warehouse.getAvailableGoods(recipes[i].ingredients[j].name)[1]<recipes[i].ingredients[j].amount)
                    throw new Error("Due to shortage in '"+recipes[i].ingredients[j].name+"' , your reservation is failed.");    
                var estimate= warehouse.goodsEstimatedCost(recipes[i].ingredients[j].name,recipes[i].ingredients[j].amount);
                if(estimate===undefined)
                    throw new Error("Reservation failed. '"+recipes[i].ingredients[j].name+"' does not exist in warehouse");
                actualFoodCost +=estimate;
            }
            diningService.doReservation(day,food,actualFoodCost);
            for( var j=0; j<recipes[i].ingredients.length; j++)
                warehouse.addToTotalAmountOfAvailableGoods(recipes[i].ingredients[j].name,-1*recipes[i].ingredients[j].amount);
            var user = getUser(session);
            var reference = (new Date()).getTime();
            user.reserve(day,reference,food);
            console.log("reference: "+reference);
            break;
        }
    }
    if(!foodExist)
        console.log("Recipe of '"+food+"' does not exist");
}

function showReservations(str){
    if(session === null)
        console.log("You should login first.");
    else if(session === "admin")
        showReservationsForAdmin(str);
    else {
        var user = getUser(session);
        console.log("reference\tday\tmeal");
        for( var day in user.reservedMeal)
            if(user.reservedMeal.hasOwnProperty(day)){
                for(var i=0; i<user.reservedMeal[day].length; i++)
                    console.log(user.reservedMeal[day][i].reference+"\t"+day+"\t"+user.reservedMeal[day][i].meal);
            }
    }
}

function showReservationsForAdmin(str){
    var weekday = {"SAT":1,"SUN":2,"MON":3,"TUE":4,"WED":5};
    console.log("customer\t\tmeal\t\tday");
    if(str.length ==2){
        for(var i=0; i<usersList.length; i++){
            for(var day in usersList[i].reservedMeal)
                if(usersList[i].reservedMeal.hasOwnProperty(day)){
                    for(var j=0; j<usersList[i].reservedMeal[day].length; j++)
                        console.log(usersList[i].username+"\t\t"+usersList[i].reservedMeal[day][j].meal+"\t\t"+day);
                }
        }
    }else if(str.length>3 && str[2]==="-d" && (str[3] in weekday)){
        for(var i=0; i<usersList.length; i++){
            if(usersList[i].reservedMeal.hasOwnProperty(str[3])){
                for(var j=0; j<usersList[i].reservedMeal[str[3]].length; j++)
                    console.log(usersList[i].username+"\t\t"+usersList[i].reservedMeal[str[3]][j].meal+"\t\t"+str[3]);
            }
        }
    }else
        console.log("Illegal argument for show reservations.")
}

function finalizeReservations() {
    //for (var i = 0; i < usersList.length; i++) {
    //    if (!myUtils.isJsonEmpty(usersList[i].reservedMeal)) {
    //        console.log(usersList[i].reservedMeal);
    //    }
    //}
    //console.log(diningService.currWeek);

    var cost = 0;
    var sold = 0;
    var foods = {};
    for (var day in diningService.currWeek) {
        for (var i = 0; i < diningService.currWeek[day].length; i++) {
            sold += (diningService.currWeek[day][i].price * diningService.currWeek[day][i].reservedAmount);
            cost += (diningService.currWeek[day][i].netCost * 1);

            if (foods[diningService.currWeek[day][i].name] == null) {
                foods[diningService.currWeek[day][i].name] = diningService.currWeek[day][i].reservedAmount;
            }
            else
                foods[diningService.currWeek[day][i].name] += diningService.currWeek[day][i].reservedAmount;
        }
    }

    var profit = sold * 1 - cost * 1;
    var percentProfit = (profit * 100 / cost).toFixed(2);

    for (var n in foods)
        console.log(n + ': ' + foods[n]);

    console.log('cost: ' + myUtils.numberWithCommas(cost));
    console.log('sold: ' + myUtils.numberWithCommas(sold));
    console.log('profit: ' + myUtils.numberWithCommas(profit)+' ('+percentProfit+'%)');

    diningService.confirm = false;
    diningService.lastWeek = diningService.currWeek;
    diningService.currWeek = {};
}