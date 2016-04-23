"use strict"
var User = function (username,password){
    this.username=username;
    this.password = password;
    this.activeTime = null;
    this.countOfWrongLogin = 0;
    //{"SUN" : [{"reference" : 12, "meal" : khooraki}]
    this.reservedMeal ={};
};

User.prototype.reserve = function(day,reference,meal){
    console.log("Reserve In User: "+ this.reservedMeal)
    if( this.reservedMeal[day] === undefined)
        this.reservedMeal[day] =[];
    this.reservedMeal[day].push({
        "reference" : reference,
        "meal" : meal
    });
    console.log("Reserve In User: "+ this.reservedMeal)
};

module.exports=User;