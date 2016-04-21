"use strict"
var Goods = require('./goods.js');

var Consignment= function (date,listOfGoods){
    this.date = date;
    this.listOfGoods = listOfGoods;
}

Consignment.prototype.isExist = function (ingredient) {
    var list = this.listOfGoods;
    
    for (var i = 0; i < list.length; i++) {
        if (list[i].name == ingredient)
            return true;
    }
    return false;
}

Consignment.prototype.addIntoGoods = function (name, amount, price){
    this.listOfGoods.push(new Goods(name, amount, price));
}

module.exports = Consignment;