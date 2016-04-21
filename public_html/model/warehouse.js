"use strict"
var Consignment = require('./consignment.js');
var Warehouse= function (){
    this.consignments=[];
}
Warehouse.prototype.addNewConsignment = function (consignment){
    this.consignments.push(consignment)
}
Warehouse.prototype.calculateValue = function () {
    var value = parseInt(0);
    for (var i = 0; i < this.consignments.length; i++) {
        for (var j = 0; j < this.consignments[i].listOfGoods.length; j++) {
            var count = parseInt(this.consignments[i].listOfGoods[j].amount);
            var price = parseInt(this.consignments[i].listOfGoods[j].price);
            value += (count * price);
        }
    }
    return value;
    
}

module.exports = Warehouse;