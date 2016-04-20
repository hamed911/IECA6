"use strict"

var Goods = function (name,amount,price){
    this.name = name;
    this.amount = amount;
    this.price = price;
};
/*  checks whether variables are not null or undefined
 * returns {boolean}
 */
Goods.prototype.validate = function (){
    return this.name && this.amount && this.price;
}

module.exports = Goods;