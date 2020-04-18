let Sequelize = require('sequelize');
let { DataTypes } = Sequelize; // eval use it

let generateServie = require('./generate/service');
let generateController = require('./generate/controller');
let generateRouter= require('./generate/router');

let AutoCode = (tableText) => {
    let models = {};
    for(let tableName in tableText) {
        let tableStr = tableText[tableName];

        // todo: 优化，不应从文本中获取obj string 然后用eval执行
        let entityStr = `models['${tableName}'] = { ${ tableStr.split(', {')[1]} `;
        try{
            eval(entityStr);
        } catch(ex) {
            console.log(`${tableName}, 转换为model异常${typeof DataTypes}`, ex);
        }
    }

    // 生成Service层代码
    // (new generateServie(models)).generate();

    // 生成Controller层代码
    // (new generateController(models)).generate();

    // 生成router层代码
    // (new generateRouter(models)).generate();
}

module.exports = AutoCode
