"use strict"
var Consignment = require('./consignment.js');
var Utils = require('../domain/utils.js');
var myUtils = new Utils();

var Warehouse= function (){
    this.consignments=[];
    this.availableGoods={};
};

Warehouse.prototype.addNewConsignment = function (consignment){
    this.consignments.push(consignment);
    /// {name:[recentPrice,totalAmount]
    this.updateAvailableGoodsContent(consignment);
};

Warehouse.prototype.getAvailableGoods = function (goods){
    return this.availableGoods[goods];
}

Warehouse.prototype.addToTotalAmountOfAvailableGoods = function (goods,amount){
    console.log("addToTotalAmount\t"+this.availableGoods);
    this.availableGoods[goods][1] +=amount;
    console.log("addToTotalAmount\t"+this.availableGoods);
}

Warehouse.prototype.goodsEstimatedCost = function (goods,amount){
    var price =0;
    if(this.availableGoods[goods]===undefined)
        return undefined;
    for(var i =0; i<this.consignments.length && amount>0; i++){
        for(var j=0; j< this.consignments[i].listOfGoods.length && amount>0; j++){
            if( this.consignments[i].listOfGoods[j].name ===goods){
                if(amount>this.consignments[i].listOfGoods[j].amount){
                    price+=this.consignments[i].listOfGoods[j].amount*this.consignments[i].listOfGoods[j].price;
                }else{
                    price+=amount*this.consignments[i].listOfGoods[j].price;
                }
                amount -=this.consignments[i].listOfGoods[j].amount;
            }
        }
    }
    if(amount>0){
        price+=this.availableGoods[goods][0]*amount;
    }
    return price;
}

Warehouse.prototype.updateAvailableGoodsContent = function(consignment){
    for(var i=0; i<consignment.listOfGoods.length; i++){
        if(consignment.listOfGoods[i].name in this.availableGoods){
            this.availableGoods[consignment.listOfGoods[i].name][0] = consignment.listOfGoods[i].price;
            this.availableGoods[consignment.listOfGoods[i].name][1] += consignment.listOfGoods[i].amount;
        }else{
            this.availableGoods[consignment.listOfGoods[i].name] = 
                    [consignment.listOfGoods[i].price,consignment.listOfGoods[i].amount]
        }
    }
};

/**
 *  [lastPrice,available amount in warehousr] 
 * @param {type} consignment
 * @returns {undefined}
 */
Warehouse.prototype.getGoodsStatus = function (){
    var res={};
    for(var i =0; i<this.consignments.length; i++){
        for(var j=0; j< this.consignments[i].listOfGoods.length; j++){
            if( this.consignments[i].listOfGoods[j].name in res){
                res[this.consignments[i].listOfGoods[j].name][0] += this.consignments[i].listOfGoods[j].amount*1;
                res[this.consignments[i].listOfGoods[j].name][1] += 
                        this.consignments[i].listOfGoods[j].amount*this.consignments[i].listOfGoods[j].price;
            }else {
                res[this.consignments[i].listOfGoods[j].name]=
                    [this.consignments[i].listOfGoods[j].amount,this.consignments[i].listOfGoods[j].amount*this.consignments[i].listOfGoods[j].price];
            }
        }
    }
    res= myUtils.sortObject(res);
    return res;
};

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
    
};

module.exports = Warehouse;
