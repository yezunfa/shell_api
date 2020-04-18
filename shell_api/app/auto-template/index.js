const {
    app,
    assert,
  } = require('egg-mock/bootstrap');

// const argv = require('yargs').help(false).argv;

const fs = require('fs');
const serviceTpl = fs.readFileSync('app/auto-template/tpl-service.js', 'UTF-8');
const serviceTestTpl = fs.readFileSync('app/auto-template/tpl-service.test.js', 'UTF-8');
const servicePath = './app/service';
const serviceTestPath = './test/service';
const pagePath = './app/view/page'
const mockFaker = require('./mock-faker');
const Sequelize = require('sequelize');
let CODE = require('./code/index');
const pageTPL = {
    create: fs.readFileSync('app/auto-template/view/create.xtpl', 'UTF-8'),
    detail: fs.readFileSync('app/auto-template/view/detail.xtpl', 'UTF-8'),
    edit: fs.readFileSync('app/auto-template/view/edit.xtpl', 'UTF-8'),
    manage: fs.readFileSync('app/auto-template/view/manage.xtpl', 'UTF-8'),
    selectDialog: fs.readFileSync('app/auto-template/view/selectDialog.xtpl', 'UTF-8'),
}

const apiPrefx = 'api';

const controllerPath = './app/controller';
const controllerTpl = fs.readFileSync('app/auto-template/controller/tpl.js', 'UTF-8');

const router = {
    path: './app/router',
    apiTpl: fs.readFileSync('app/auto-template/router/api.js', 'UTF-8'),
    pageTpl: fs.readFileSync('app/auto-template/router/page.js', 'UTF-8'),
}

const newTplTable = "cnh_coinaccount_balance"; // 后面生成的表

// 取得需生成的model
const getModels = (app) => {
   
   // 只生成指定表的
   return { 
    cnh_coinaccount_balance: app.model.models['cnh_coinaccount_balance']
   };
   // return app.model.models;

}

const resetStrName = (str, firstLowerCase) => {
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


const camarasName =  (str) => {
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

const isFunStr = (str)=> {
    let isFun = false;
    if(typeof str === "string" ) {
        try{
            eval(str);
            isFun = true;
            } catch(ex) {
        }
    }
    return isFun;
}

const getMockData = function(field){
    // if(field.field === 'Valid' || field.field === 'Status') {
    //     return 1;
    // }
    if(field.type instanceof Sequelize.STRING) {
        let str = mockFaker.Field.title();
        if(field.type && field.type.options && field.type.options.length && str.length > field.type.options.length) {
            str = str.substring(0, field.type.options.length);
            
        }
        return str;
    }
    if(field.type instanceof Sequelize.INTEGER) {
       
        if(field.type.options && field.type.options.length){
            if(field.type.options.length === 1) {
                return 1;
            }
          
            if(field.unique) {
               return "Math.ceil((Math.random()*10000000))";  //生成随机数(尽量唯一)
            }
            return mockFaker.Field.number(field.type.options.length)
        }
        return mockFaker.Field.number()
    }

    if(field.type instanceof Sequelize.DATE) {
        return mockFaker.Field.timeNow();
    }

    // todo
    if(field.type instanceof Sequelize.TIME) {
        return 132323233;
    }

    if(field.type instanceof Sequelize.FLOAT) {
        return 12.3;
    }

    if(field.type instanceof Sequelize.DECIMAL) {
        return mockFaker.Field.number(3,2)
    }

    if(field.type instanceof Sequelize.TEXT) {
        return mockFaker.Field.text()
    }

    return "mock";
}


const commentReplace = function(str, replaceEntity) {
    let s = str;
    for(var k in replaceEntity) {
       let reg = new RegExp(k,"g");
       s = s.replace(reg, replaceEntity[k]);
    }
    return s;
}

const getDefaultValue = (schemas) =>{
    let dValue = {};
    for(var f in schemas) {
        let fieldDefined = schemas[f];
        if(fieldDefined.defaultValue) {
            dValue[f] = fieldDefined.defaultValue;
        }
        // boolean 如果不设置默认，就设置为 0
        if(fieldDefined.type instanceof Sequelize.INTEGER && fieldDefined.type.options.length === 1) {
            if(typeof dValue[f] === 'undefined' ||  dValue[f] === null) {
                dValue[f] = false;
            };
            if(dValue[f]+'' === '0') {
                dValue[f] = false;
            }
            if(dValue[f]+'' === '1') {
                dValue[f] = true;
            }
        }
        //  是否有效是radio 来实现
        if( f === 'Valid' ) {
            dValue[f] = dValue[f] ? 1 : 0;  
        }
    }
    return dValue;
}





before(() => {
    if(!fs.existsSync(servicePath)) {
        fs.mkdirSync(servicePath);
    }
    if(!fs.existsSync(serviceTestPath)) {
        fs.mkdirSync(serviceTestPath);
    }

})

describe('get All models', () => {
  
    it('generate servcie.js', async () => {
        let models = getModels(app);
        const ctx = app.mockContext({});
        for(var m in models) {
            // make the first character upperCase
            let __tablename__ = m;
            let __servicename__ = camarasName(m);
            let __Tablename__ = resetStrName(__tablename__);

            let querySearch = {
                select: [`${__tablename__}.*`],
                from: [`from ${__tablename__}`],
                leftJion: []
            }
            let _Foreign_Tables_ = [];
            if(ctx.model[__Tablename__] && ctx.model[__Tablename__].rawAttributes && ctx.model[__Tablename__].attributes) {
                let schemas = ctx.model[__Tablename__].rawAttributes;
                for(var field in schemas) {
                    if(schemas[field].references) {
                        let jionTable = schemas[field].references.model;
                        let foreignKey = schemas[field].references.key;
                       
                        if(!_Foreign_Tables_.includes(jionTable)) {
                            _Foreign_Tables_.push(jionTable);
                            querySearch.select.push(`${jionTable}_1.Name as ${field}_Name`); //约定名称或标题统一用 Name,title也定义为Name todo: model中取
                            querySearch.leftJion.push(`left join ${jionTable} as  ${jionTable}_1  on ${__tablename__}.${field} = ${jionTable}_1.${foreignKey}`);

                        } else {
                            // 同表关系的话,重命名为 table_2 来left join
                            querySearch.select.push(`${jionTable}_2.Name as ${field}_Name`); //约定名称或标题统一用 Name,title也定义为Name todo: model中取
                            querySearch.leftJion.push(`left join ${jionTable} as ${jionTable}_2  on ${__tablename__}.${field} = ${jionTable}_2.${foreignKey}`);
                        }
                        
                    }
                }
            }

            let fileCon = serviceTpl.replace(/__Tablename__/g, __Tablename__);
            fileCon = fileCon.replace(/__tablename__/g, __tablename__);
            fileCon = fileCon.replace(/__servicename__/g, __servicename__);
            fileCon = fileCon.replace(/_Foreign_Tables_/g, _Foreign_Tables_.join(','));

            // joinSearch查询
            fileCon = fileCon.replace(/__joinSearch.selectVal__/g, querySearch.select.join(','));
            fileCon = fileCon.replace(/__joinSearch.from__/g, querySearch.from.join(','));
            fileCon = fileCon.replace(/__joinSearch.join__/g, querySearch.leftJion.join(' \n'));
        
            fs.writeFileSync(servicePath + "/" + __tablename__ + ".js", fileCon);
        }
    });


    it('generate controller', async () => {
        const models = getModels(app);
        const ctx = app.mockContext({});
 
        for(var m in models) {
            // make the first character upperCase
            let replaceEntity =  {
                __tablename__: m,
                __servicename__: camarasName(m),
                __Tablename__: resetStrName(m, true),
                __ENTITYNAME__: resetStrName(m)
            }

            // 有ParentId,是树结构
            if(ctx.model[replaceEntity.__ENTITYNAME__].rawAttributes.ParentId) {
                let c = [
                    `// 转换为树结构`,
                    `\t\tentityList.rows = JSON.parse(JSON.stringify(entityList.rows));`,
                    `\t\tentityList.rows = tools.arrayToTree(entityList.rows);`
                ]
                replaceEntity["// where 条件"] = "// where 条件:树结构不分页\n\t\tpagination = null;\n"
                replaceEntity["// isTreeReplacer"] = c.join('\n');
                replaceEntity["// require"]  = `const tools = require('../utils/index');`;
            }
         

            let controlerCon = commentReplace(controllerTpl, replaceEntity);
            fs.writeFileSync(`${controllerPath}/${replaceEntity.__Tablename__}.js`, controlerCon);

        }
    });

    it('generate api router', async () => {
        const models = app.model.models;
        const ctx = app.mockContext({});
        const space = '\t\t';
        let routerPageCon = [];
        routerPageCon.push(`${space} // common api router`);
        for(var m in models) {
            // routerPageCon.push('\n');
            // make the first character upperCase
            let replaceEntity =  {
                __tablename__: m,
                __servicename__: camarasName(m),
                __Tablename__: resetStrName(m, true),
                __ENTITYNAME__: resetStrName(m)
            }


            routerPageCon.push(`${space}// api router for ${replaceEntity.__tablename__}`);
            routerPageCon.push(`${space}app.router.post('/${apiPrefx}/${replaceEntity.__tablename__}/create', app.controller.${replaceEntity.__Tablename__}.createByApi);`);
            routerPageCon.push(`${space}app.router.post('/${apiPrefx}/${replaceEntity.__tablename__}/edit', app.controller.${replaceEntity.__Tablename__}.editByApi);`);
            routerPageCon.push(`${space}app.router.post('/${apiPrefx}/${replaceEntity.__tablename__}/remove', app.controller.${replaceEntity.__Tablename__}.removeByApi);`);
            routerPageCon.push(`${space}app.router.post('/${apiPrefx}/${replaceEntity.__tablename__}/delete', app.controller.${replaceEntity.__Tablename__}.deleteByApi);`);
            routerPageCon.push(`${space}app.router.get('/${apiPrefx}/${replaceEntity.__tablename__}/detail/:Id', app.controller.${replaceEntity.__Tablename__}.getByApi);`);

            if(newTplTable.indexOf(m) > -1) {
                routerPageCon.push(`${space}app.router.get('/${apiPrefx}/${replaceEntity.__tablename__}/getlatest', app.controller.${replaceEntity.__Tablename__}.getLatestApi);`);
            }
            
            routerPageCon.push(`${space}app.router.get('/${apiPrefx}/${replaceEntity.__tablename__}/search', app.controller.${replaceEntity.__Tablename__}.searchByApi);`);

        }
        let fileCon = router.apiTpl.replace(/__PAGE_ROUTERS__/g, routerPageCon.join('\n'));
        fs.writeFileSync(`${router.path}/api.js`, fileCon);
    });
});