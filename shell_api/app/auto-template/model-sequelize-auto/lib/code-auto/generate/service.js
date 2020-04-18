
const fs = require('fs');
const {camarasName, resetStrName, commentReplace } = require('../utils');

class Index {
    constructor(models) {
        this.template = fs.readFileSync('app/auto-template/model-sequelize-auto/lib/code-auto/generate/tpl/tpl-service.js', 'UTF-8');
        this.savePath = './app/service';
        this.models = models;
    }
    generate() {
        const { models } = this;
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
            if(models[__Tablename__] && models[__Tablename__].rawAttributes && models[__Tablename__].attributes) {
                let schemas = models[__Tablename__].rawAttributes;
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

            let replaceEntity =  {
                __tablename__: __tablename__,
                __servicename__: __servicename__,
                __Tablename__: __Tablename__,
                _Foreign_Tables_: _Foreign_Tables_.join(','),
                __joinSearch_selectVal__: querySearch.select.join(','),
                __joinSearch_from__: querySearch.from.join(','),
                __joinSearch_join__: querySearch.leftJion.join(' \n')
            }
        
            let controlerCon = commentReplace(this.template, replaceEntity);
            fs.writeFileSync(this.savePath + "/" + __tablename__ + ".js", controlerCon);
        }
    }
}

module.exports = Index;

 