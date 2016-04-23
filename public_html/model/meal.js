"use strict"

var Meal = function (name, price){
    this.name = name;
    this.price = price;
    this.reservedAmount = 0;
    this.netCost =0;
};

Meal.prototype.doReservation = function (){
    this.reservedAmount++;
}

Meal.prototype.increaseNetCost = function (cost){
    this.netCost +=cost;
};

module.exports = Meal;