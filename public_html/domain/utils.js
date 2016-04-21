
var Utils = function (){
    
};

Utils.prototype.sortObject = function(o) {
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

module.exports = Utils;