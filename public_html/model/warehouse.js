"use strict"
var Consignment = require('./consignment.js');
var Warehouse= function (){
    this.consignment=[];
}
Warehouse.prototype.addNewConsignment = function (consignment){
    this.consignment.push(consignment)
}

module.exports = Warehouse;