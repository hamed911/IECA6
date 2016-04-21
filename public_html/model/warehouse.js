"use strict"
var Consignment = require('./consignment.js');

var Warehouse= function (){
    this.consignments=[];
    this.availableGoods={};
};
Warehouse.prototype.addNewConsignment = function (consignment){
    this.consignment.push(consignment);
    this.updateAvailableGoodsContent(consignment);
};

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

Warehouse.prototype.showIngredients = function (){
    var res={};
    for(var i =0; i<this.consignments.length; i++){
        for(var j=0; j< this.consignments[i].listOfGoods.length; j++){
            if( this.consignments[i].listOfGoods[j].name in res){
                res[this.consignments[i].listOfGoods[j].name][0] += this.consignments[i].listOfGoods[j].amount;
                res[this.consignments[i].listOfGoods[j].name][1] += 
                        this.consignments[i].listOfGoods[j].amount*this.consignments[i].listOfGoods[j].price;
            }else {
                res[this.consignments[i].listOfGoods[j].name]=
                    [this.consignments[i].listOfGoods[j].amount,this.consignments[i].listOfGoods[j].amount*this.consignments[i].listOfGoods[j].price];
            }
        }
    }
    res.sort(function sorter(a,b){
        a
    });
    console.log(res);
};

module.exports = Warehouse;