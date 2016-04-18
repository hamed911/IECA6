var User = function (username,password){
    this.username=username;
    this.password=password;
}
User.prototype.introduceYourself=function(){
    console.log('I am '+this.username);
}

module.exports=User;