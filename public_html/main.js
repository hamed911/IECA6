var fs = require('fs');
var warehouse = require('./warehouse.js');
var User = require('./user.js');

var stdin = process.openStdin();

stdin.addListener("data", function(d) { 
    console.log("you entered: [" + 
        d.toString().trim() + "]");
    termal();
        
});
function termal(){
    console.log('here in termal');
}
console.log(warehouse.bonjol);
var users = JSON.parse(fs.readFileSync('./users.json', 'utf8'));
if(!users)
	console.log('ab ghate chera?');
var i;
for(i=0; i<users.length; i++){
    var user = new User(users[i].username,users[i].password);
    user.introduceYourself();
};
console.log('hello world');