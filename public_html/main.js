"use strict"
var Warehouse = require('./model/warehouse.js');
var User = require('./model/user.js');
var RepositoryLoader = require("./model/repositoryLoader.js");
var repositoryLoader = new RepositoryLoader();

var usersList = repositoryLoader.loadUsers();
var warehouse = repositoryLoader.loadWarehouse();

var session = null;

var stdin = process.openStdin();

stdin.addListener("data", function(d) { 
    inputHandle(d.toString().trim());       
});

function inputHandle(command) {
    var str = command.split(" ");
    var order = str[0];
    
    if (str.length == 3 && order == "login") {
        login(str);
    }
    else if (str.length == 1 && order == "logout") {
        logout();
    }
    else
        console.log('Invalid command!');
}

function login(str) {

    if (session != null) {
        console.log('The other user is already login, so you should logout first!');
        return;
    }
    var result;

    result = authenticate(str[1], str[2]);

    if (result == 1) {
        console.log('Wellcome ' + str[1] + '!');
        session = str[1];
    }
    else if (result == -1) {
        console.log('Account with this username does not exist!');
        return;
    }
    else if (result == 0) {
        var user = getUser(str[1]);
        user.countOfWrongLogin += 1;
       
        if (user.countOfWrongLogin >= 3) {
            var d = new Date();
            user.activeTime = d.getTime();
            console.log('---> ' + d);
            console.log('Invalide password, your account was blocked for 2 minutes..');
            
        }
        else
            console.log('Invalide password, please try again...');
    }
    else {
        console.log('Your account is blocked!');
    }
}

function logout() {
    console.log('Goodbye ' + session + '!');
    session = null;
}

function authenticate(user, pass) {
    var usr = false;
    for (var i = 0; i < usersList.length; i++) {
        if (usersList[i].username == user)
        {
            usr = true;
            if (usersList[i].password == pass) {
                //console.log(usersList[i].activeTime);
                if (usersList[i].activeTime == null || parseInt(usersList[i].activeTime) + 120000 <= parseInt(new Date().getTime())) {
                    usersList[i].countOfWrongLogin = 0;
                    usersList[i].activeTime = null;
                    return 1;
                }
                else
                    return 2;
            }
        }
    }
    if (usr)
        return 0;
    return -1;
}

function getUser(name) {
    for (var i = 0; i < usersList.length; i++) {
        if (usersList[i].username == name) {
            return usersList[i];
        }
    }
    return null;
}
