
const fs = require('fs');
const {camarasName, resetStrName, commentReplace } = require('../utils');

class Index {
    constructor(models) {
        this.template = fs.readFileSync('app/auto-template/model-sequelize-auto/lib/code-auto/generate/tpl/tpl-controller.js', 'UTF-8');
        this.savePath = './app/controller';
        this.models = models;
    }
    generate() {
        const { models } = this;
        for(var m in models) {
            // make the first character upperCase
            let replaceEntity =  {
                __tablename__: m,
                __servicename__: camarasName(m),
                __Tablename__: resetStrName(m, true),
                __ENTITYNAME__: resetStrName(m)
            }

            // 有ParentId,是树结构
            // if(models[replaceEntity.__ENTITYNAME__].rawAttributes.ParentId) {
            //     let c = [
            //         `// 转换为树结构`,
            //         `\t\tentityList.rows = JSON.parse(JSON.stringify(entityList.rows));`,
            //         `\t\tentityList.rows = tools.arrayToTree(entityList.rows);`
            //     ]
            //     replaceEntity["// where 条件"] = "// where 条件:树结构不分页\n\t\tpagination = null;\n"
            //     replaceEntity["// isTreeReplacer"] = c.join('\n');
            //     replaceEntity["// require"]  = `const tools = require('../utils/index');`;
            // }
         
            let controlerCon = commentReplace(this.template, replaceEntity);
            fs.writeFileSync(`${this.savePath}/${replaceEntity.__Tablename__}.js`, controlerCon);

        }
    }
}

module.exports = Index;

 