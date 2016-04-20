"use strict"

var Ingredient = function (name,amount){
    this.name = name;
    this.amount = amount;
};
/*  checks whether variables are not null or undefined
 * returns {boolean}
 */
Ingredient.prototype.validate = function (){
    return this.name && this.amount;
};

module.exports = Ingredient;