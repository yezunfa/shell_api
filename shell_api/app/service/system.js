'use strict';

/**
 * SysrolesyspersonService
 * useage: ctx.service.sysrolesysperson
 */

const Service = require('egg').Service;

class Index extends Service {

    /**
     * 获取D
     */
    async getDictonary() {
 
        const sql = `
            select 
            a.Id, 
            a.Name,
            a.ParentId,
            b.Id as CategoryCode,
            b.Name as CategoryName,
            b.TableFiled as TableFiled,
            a.Code,
            a.Value,
            a.Sort
            
            from sys_dictionary a 
            left join  sys_dictionary b
            on a.ParentId = b.Id
            order by a.ParentId desc, a.Sort Desc
        `;
        const result = await this.ctx.model.query(sql, {
            type: this.ctx.model.Sequelize.QueryTypes.SELECT
        });

        let Dictionary = {};
       
        if(result) {
            let curParentId = null;
            for(let i =0; i< result.length; i+=1) {
                let d = result[i];
                if(d.ParentId) {
                    curParentId = d.ParentId;
                    Dictionary[curParentId] = Dictionary[curParentId] || {};
                    Dictionary[curParentId].CategoryName = d.CategoryName; // 如:任务类型
                    Dictionary[curParentId].CategoryCode= d.CategoryCode; // 如:TaskType
                    Dictionary[curParentId].TableFiled= d.TableFiled; // todo: 用于将来与表单联动, 如 sys_user.Sex,storeTask.Type
                    
                    Dictionary[curParentId][d.Code] = d.Value;
                    Dictionary[curParentId].properties = Dictionary[curParentId].properties || {};
                    
                    let dt = {
                        Name: d.Name,
                        Code: d.Code,
                        Value: d.Value
                    }

                    Dictionary[curParentId].properties[d.Value] = dt;
                    Dictionary[curParentId].list = Dictionary[curParentId].list || [];
                    Dictionary[curParentId].list.push(dt);
                }
            }

            // 为了保证属性顺序
            for(let i =0; i< result.length; i+=1) {
                let d = result[i];
                if(d.ParentId) {
                    curParentId = d.ParentId;
                    let dt = {
                        Name: d.Name,
                        Code: d.Code,
                        Value: d.Value
                    }

                    Dictionary[curParentId].properties[d.Value] = dt;
                    Dictionary[curParentId].list = Dictionary[curParentId].list || [];
                    Dictionary[curParentId].list.push(dt);
                }
            }
        }
 
        return Dictionary;
    }

}


module.exports = Index;


