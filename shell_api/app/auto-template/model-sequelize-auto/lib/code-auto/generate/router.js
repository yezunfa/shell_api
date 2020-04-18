
const fs = require('fs');
const {camarasName, resetStrName } = require('../utils');

class Index {
    constructor(models) {
        this.template = fs.readFileSync('app/auto-template/model-sequelize-auto/lib/code-auto/generate/tpl/tpl-router.js', 'UTF-8');
        this.savePath = './app/router';
        this.models = models;
    }
    generate() {
        const {models } = this;
        const space = '    ';
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

            const apiPrefx = 'capi';
            routerPageCon.push(`${space}// api router for ${replaceEntity.__tablename__}`);
            routerPageCon.push(`${space}router.post('/${apiPrefx}/${replaceEntity.__tablename__}/create', controller.${replaceEntity.__Tablename__}.createByApi);`);
            routerPageCon.push(`${space}router.post('/${apiPrefx}/${replaceEntity.__tablename__}/edit', controller.${replaceEntity.__Tablename__}.editByApi);`);
            routerPageCon.push(`${space}router.post('/${apiPrefx}/${replaceEntity.__tablename__}/remove', controller.${replaceEntity.__Tablename__}.removeByApi);`);
            routerPageCon.push(`${space}router.post('/${apiPrefx}/${replaceEntity.__tablename__}/delete', controller.${replaceEntity.__Tablename__}.deleteByApi);`);
            routerPageCon.push(`${space}router.get('/${apiPrefx}/${replaceEntity.__tablename__}/detail/:Id', controller.${replaceEntity.__Tablename__}.getByApi);`);
            routerPageCon.push(`${space}router.get('/${apiPrefx}/${replaceEntity.__tablename__}/getlatest', controller.${replaceEntity.__Tablename__}.getLatestApi);`);
            routerPageCon.push(`${space}router.get('/${apiPrefx}/${replaceEntity.__tablename__}/search', controller.${replaceEntity.__Tablename__}.searchByApi);`);

        }
        let fileCon = this.template.replace(/__PAGE_ROUTERS__/g, routerPageCon.join('\n'));
        fs.writeFileSync(`${this.savePath}/commonApi.js`, fileCon);
    }
}

module.exports = Index;

 