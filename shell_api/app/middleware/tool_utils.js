'use strict';
let Decimal = require('decimal.js');
const { isSqlInjectStr } = require('../utils/sql-helper');

module.exports = (option, app) => {
    const DataTypes = app.Sequelize;
    const models = app.model.models;
    return async function (ctx, next) {
        ctx.getSequenceNo = function(options) {
            return ctx.service.utils.redis.getSequenceNo(options);
        }
        ctx.validateAndFormat = function (entity, modelName) {
            if (typeof entity === 'object') {
                if(!modelName) {
                    for (var field in entity) {
                        if (entity[field] && typeof entity[field] === 'string') {
                            // 防止脚本注入
                            entity[field] = entity[field].replace(/\<\s{0,}script\s{0,}\>/g, ctx.helper.escape(`<script>`));
                            entity[field] = entity[field].replace(/\<\s{0,}\/{1,}\s{0,}script\s{0,}\>/g, ctx.helper.escape(`</script>`));

                            if(isSqlInjectStr(entity[field])) {
                                throw new Error("禁止文本中存在sql注入相关脚本!!" + entity[field]);
                            }
                        }
    
                    }
                    return entity;
                }

                let model = models[modelName];
                let schema = model.rawAttributes;
                let newEntity = {};
                for (var field in schema) {
                    newEntity[field] = entity[field];

                    if (newEntity[field] && typeof newEntity[field] === 'string') {
                        // 防止脚本注入
                        newEntity[field] = newEntity[field].replace(/\<\s{0,}script\s{0,}\>/g, ctx.helper.escape(`<script>`));
                        newEntity[field] = newEntity[field].replace(/\<\s{0,}\/{1,}\s{0,}script\s{0,}\>/g, ctx.helper.escape(`</script>`));

                        if(isSqlInjectStr(entity[field])) {
                            throw new Error("禁止文本中存在sql注入相关脚本!!" + entity[field]);
                        }
                    }

                    // 验证
                    let fieldDefined = schema[field];
                    if (!fieldDefined.allowNull && (typeof newEntity[field] === 'undefined' || newEntity[field] === null)) {
                        throw new Error((fieldDefined.comment || fieldDefined.fieldName) + "不能为空:" + field)
                    }

                    if(fieldDefined.allowNull && newEntity[field] === '') {
                        newEntity[field] = null;
                    }
                    if(fieldDefined.type instanceof DataTypes.DATE &&  newEntity[field] === '') {
                        newEntity[field] = null;
                    }
                    
                    if(fieldDefined.type instanceof DataTypes.DECIMAL) {
                        console.log(newEntity[field], field);
                        if(typeof newEntity[field] === 'undefined' || newEntity[field] === null || newEntity[field] === '') { 
                            newEntity[field] = null;
                        } else {
                            newEntity[field] = new Decimal(newEntity[field]).toNumber();
                        }
                       
                    }
                    // boolean
                    if (fieldDefined.type instanceof DataTypes.INTEGER && fieldDefined.type.options.length === 1) {
                        if (newEntity[field] === 'true' || newEntity[field] === true) {
                            newEntity[field] = 1;
                        } else if (newEntity[field] === 'false' || newEntity[field] === false) {
                            newEntity[field] = 0;
                        } else if (typeof fieldDefined.defaultValue !== 'undefined') {
                           
                            newEntity[field] = parseInt(fieldDefined.defaultValue);
                        } else {
                            newEntity[field] = 0;
                        }
                    } else if(fieldDefined.type instanceof DataTypes.INTEGER && fieldDefined.type.options.length > 1) {
                        newEntity[field] = parseInt(newEntity[field]);
                    }
                }
                console.log(JSON.stringify(newEntity, null, 2));
                return newEntity;
            } else {

                throw new Error("参数无效!")
            }
        }

        // 从数据库出来的对象
        ctx.formatEntiy = function (entity, modelName) {
            if (typeof entity === 'object') {
                let model = models[modelName];
                let schema = model.rawAttributes;
           
                for(var field in entity) {
                  if(typeof entity[field] !== 'undefined' && schema[field]) {
                    let fieldDefined = schema[field];
                    // boolean
                    if (field !== 'Valid' && fieldDefined.type instanceof DataTypes.INTEGER && fieldDefined.type.options.length === 1) {
                      entity[field] = entity[field] ? true : false;
                    }
                  }
                }
                return entity;
            } else {
              throw new Error("参数无效!")
            }
        }
        await next();
    };
};
