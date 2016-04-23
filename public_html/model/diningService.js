"use splitstrict"
var Meal = require("./meal.js");
var Utils = require('../domain/utils.js');
var myUtils = new Utils();

var DiningService = function (){
    //{"SUN":[Meal]}
    this.currWeek = {};
    this.lastWeek={};
    this.confirm =false;
};

var weekday = ["SAT","SUN","MON","TUE","WED"];

DiningService.prototype.createMenu = function (splitstr){
    if(this.confirm)
        throw new Error("The current week's menu has already confirmed");
    var createdMenu={};
    for (var i = 0; i < splitstr.length; i = i + 3) {
        if(!splitstr[i] in weekday)
            throw new Error(splitstr[i] +" is not a weekday");
        if(createdMenu[splitstr[i]] === undefined)
            createdMenu[splitstr[i]] = [];
        createdMenu[splitstr[i]].push( new Meal(splitstr[i + 1],splitstr[i + 2]));
    }
    this.currWeek = createdMenu;
    this.showCurrentWeekMenu(this.currWeek);
};

DiningService.prototype.repeatPreviousWeekMenu = function (){
    if(this.confirm)
        throw new Error("The current week's menu has already confirmed");
    if(myUtils.isJsonEmpty(this.lastWeek))
        throw new Error("Last week's menu is undefined");
    this.currWeek = this.lastWeek;
    this.showCurrentWeekMenu(this.currWeek);
};

DiningService.prototype.showCurrentWeekMenu = function (menu){
    if(typeof menu === 'undefined')
        menu = this.currWeek;
    if(myUtils.isJsonEmpty(menu))
        throw new Error("no available menu to show");
    for(var i=0; i<weekday.length; i++){
        console.log(weekday[i]);
        var meals = menu[weekday[i]];
        if(meals === undefined || meals.length ===0)
            console.log("-");
        else
            for(var j=0; j<meals.length; j++)
                console.log("- "+ meals[j].name +" ("+myUtils.numberWithCommas( meals[j].price)+")");
    }
};

DiningService.prototype.confirmMenu = function() {
    if(myUtils.isJsonEmpty(this.currWeek))
        throw new Error("No menu is specified for this week");
    if(this.confirm)
        throw new Error("The current week's menu has already confirmed");
    this.confirm = true;
    console.log("menu confirmed successfully.");
};

DiningService.prototype.userCommandShowMenu = function (){
    if(myUtils.isJsonEmpty(this.currWeek))
        throw new Error("No menu is specified for this week");
    if(!this.confirm)
        throw new Error("Admin have not confirmed the current week's menu yet");
    this.showCurrentWeekMenu(this.currWeek);
};

DiningService.prototype.doReservation = function (day,food,actualCost){
    if(myUtils.isJsonEmpty(this.currWeek))
        throw new Error("No menu is specified for this week");
    if(!this.confirm)
        throw new Error("Admin have not confirmed the current week's menu yet");
    if(this.currWeek[day] === undefined)
        throw new Error("Reservation failed. '"+day+"' is not a weekday.");
    var foodIsOffered = false;
    for(var i =0; i<this.currWeek[day].length; i++){
        if( this.currWeek[day][i].name === food){
            this.currWeek[day][i].doReservation();
            this.currWeek[day][i].increaseNetCost(actualCost);
            foodIsOffered=true;
            break;
        }
    }
    if(!foodIsOffered)
        throw new Error("Reservation failed. '"+food+"' is not offered in "+day);
}


module.exports = DiningService;