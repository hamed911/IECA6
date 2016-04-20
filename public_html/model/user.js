"use strict"
var User = function (username,password){
    this.username=username;
    this.password = password;
    this.activeTime = null;
    this.countOfWrongLogin = 0;
};

User.prototype.introduceYourself=function(){
    console.log('I am '+this.username);
};

module.exports=User;