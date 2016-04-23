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
    if( this.reservedMeal[day] === undefined)
        this.reservedMeal[day] =[];
    this.reservedMeal[day].push({
        "reference" : reference,
        "meal" : meal
    });
};

module.exports=User;