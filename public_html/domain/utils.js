
var Utils = function (){
    
};

Utils.prototype.sortObjectByDate = function(o) {
    var sorted = {};
    var keys = [];
    var a = {};

    for (var key in o) {
        if (o.hasOwnProperty(key)) {
            var d = key.split('-');
            var date = new Date();
            date.setDate(d[0]);
            date.setMonth(d[1]);
            date.setYear(d[2]);
           
            a[date.getTime()] = key;
        }
    }
    keys = Object.keys(a).sort();

    for (var i = 0; i < keys.length; i++) {
        sorted[a[keys[i]]] = o[a[keys[i]]];
    }

    return sorted;
};

Utils.prototype.sortObjectByName = function (o) {
    var sorted = {},
    key, a = [];

    for (key in o) {
        if (o.hasOwnProperty(key)) {
            a.push(key);
        }
    }

    a.sort();

    for (key = 0; key < a.length; key++) {
        sorted[a[key]] = o[a[key]];
    }
    return sorted;
};

Utils.prototype.zeroPadding = function pad(num, size) {
    var s = num+"";
    while (s.length < size) s = "0" + s;
    return s;
};

Utils.prototype.numberWithCommas = function(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

Utils.prototype.spaceAlignment = function (str,tabnumber){
    if(str.length/7>1 && tabnumber>str.length/7){
        tabnumber-= str.length/7;
    }
    str="";
    while(tabnumber>0){
        str+="\t";
        tabnumber--;
    }
    return str;
};

Utils.prototype.numberOfTabsForTableAlignment = function (name){
    return Math.ceil( name.length/7);
}

Utils.prototype.isJsonEmpty = function (obj){
    return Object.keys(obj).length === 0;
};

module.exports = Utils;