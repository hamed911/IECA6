"use strict"

var Meal = function (name, price){
    this.name = name;
    this.price = price;
    this.reservedAmount = 0;
};

Meal.prototype.doReservation = function (){
    this.reservedAmount++;
}

module.exports = Meal;