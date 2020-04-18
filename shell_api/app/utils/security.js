'use strict';

/**
 * @加密模块
 * */
//导入模块
var crypto = require('crypto');
/**
 * @aes192加密模块
 * @param str string 要加密的字符串
 * @param secret string 要使用的加密密钥(要记住,不然就解不了密啦)
 * @retrun string 加密后的字符串
 * */
exports.getEncAse192 = function(str, secret) {
    var cipher = crypto.createCipher("aes192", secret); //设置加密类型 和 要使用的加密密钥
    var enc = cipher.update(str, "utf8", "hex");    //编码方式从utf-8转为hex;
    enc += cipher.final("hex"); //编码方式从转为hex;
    return enc; //返回加密后的字符串
}
/**
 * @aes192解密模块
 * @param str string 要解密的字符串
 * @param secret string 要使用的解密密钥(要和密码的加密密钥对应,不然就解不了密啦)
 * @retrun string 解密后的字符串
 * */
exports.getDecAse192 = function(str, secret) {
    var decipher = crypto.createDecipher("aes192", secret);
    var dec = decipher.update(str, "hex", "utf8");//编码方式从hex转为utf-8;
    dec += decipher.final("utf8");//编码方式从utf-8;
    return dec;
}
/**
 * @Hmac-sha1加密模块 (每次加密随机,不可逆)
 * @param str string 要加密的字符串
 * @param secret string 要使用的加密密钥
 * @retrun string 加密后的字符串
 * */
exports.getHmac = function(str, secret) {
    var buf = crypto.randomBytes(16);
    secret = buf.toString("hex");//密钥加密；
    var Signture = crypto.createHmac("sha1", secret);//定义加密方式
    Signture.update(str);
    var miwen=Signture.digest().toString("base64");//生成的密文后将再次作为明文再通过pbkdf2算法迭代加密；
    return miwen;
}

/**
 * @sha1加密模块 (加密固定,不可逆)
 * @param str string 要加密的字符串
 * @retrun string 加密后的字符串
 * */
const Sha1 = function(str) {
    var sha1 = crypto.createHash("sha1");//定义加密方式:md5不可逆,此处的md5可以换成任意hash加密的方法名称；
    sha1.update(str);
    var res = sha1.digest("hex");  //加密后的值d
    return res;
}

/**
 * @sha1加密模块 (加密固定,不可逆)
 * @param str string 要加密的字符串
 * @retrun string 加密后的字符串
 * */
exports.getSha1 = Sha1

/**
 * @生成密码
 * @param userName string 用户名(取手机号)
 * @param password string 密码
 * @retrun string 加密后的字符串
 * */
exports.generatePassword =  function(userName, password) {
    if(!userName || !password) {
        throw new Error('参数错误')
    }
    return Sha1(`${userName}${password}`)
}
