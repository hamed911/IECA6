"use splitstrict"
var Meal = require("./meal.js");

var DiningService = function (){
    this.currWeek={};
    this.lastWeek={};
};

var weekday = ["SAT","SUN","MON","TUE","WED"];

DiningService.prototype.createMenu = function (splitstr){
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
    if(Object.keys(obj).length === 0)
        throw new Error("Last week's menu is undefined");
    this.currWeek = this.lastWeek;
    this.showCurrentWeekMenu(this.currWeek);
};

DiningService.prototype.showCurrentWeekMenu = function (menu){
    if(menu === null)
        throw new Error("no available menu to show");
    for(var i=0; i<weekday.length; i++){
        console.log(weekday[i]);
        var meals = menu[weekday[i]];
        if(meals === undefined || meals.length ===0)
            console.log("-");
        else
            for(var j=0; j<meals.length; j++)
                console.log("- "+ meals[j].name +" ("+meals[j].price+")");
    }
};


module.exports = DiningService;