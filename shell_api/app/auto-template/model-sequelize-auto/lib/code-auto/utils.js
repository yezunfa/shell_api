exports.resetStrName = (str, firstLowerCase) => {
    let name = str.split('_');
    let result = [];
    for(var i =0; i< name.length; i++) {
        if(firstLowerCase && i === 0) {
            result.push(name[i].toLowerCase());
        } else {
            result.push(name[i].toLowerCase().replace(/( |^)[a-z]/g, (L) => L.toUpperCase()));  
        }
    }
    return result.join('');
}


exports.camarasName =  (str) => {
    let name = str.toLowerCase().split('_');
    let result = [];
    for(var i =0; i< name.length; i++) {
        if(i === 0) {
            result.push(name[i]);
        } else {
            result.push(name[i].toLowerCase().replace(/( |^)[a-z]/g, (L) => L.toUpperCase()));
        }
    }
    return result.join('');
}

exports.commentReplace = function(str, replaceEntity) {
    let s = str;
    for(var k in replaceEntity) {
       let reg = new RegExp(k,"g");
       s = s.replace(reg, replaceEntity[k]);
    }
    return s;
}