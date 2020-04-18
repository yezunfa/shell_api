'use strict';

/**
 * SysMenuSysOperationService
 * useage: ctx.service.sys_menu_sys_operation
 */
const { sqlHelper } = require('../utils/index');
const Service = require('egg').Service;

class SysMenuSysOperationService extends Service {

    /**
     * create a new sys_menu_sys_operation
     * @param {Object} entity model sys_menu_sys_operation
     * @return {Object} entity a model Entity
     */
    async create(entity) {
        try {
            const result = await this.ctx.model.SysMenuSysOperation.create(entity);
            return result;
        } catch (err) {
            throw err;
        }
    }

    /**
     *  get a sys_menu_sys_operation by Id
     * @param {String} Id guid
     * @return {Object} entity a model Entity
     */
    async getById(Id) {
        try {
            const result = await this.ctx.model.SysMenuSysOperation.findOne({
                where: {
                    Id
                }
            });
            return result ? result.dataValues : null
        } catch (err) {
            throw err;
        }
    }

    /**
     *  get a sys_menu_sys_operation by condtion
     * @param {Object} where condition
     * @return {Object} entity a model Entity
     */
    async getByCondition(where) {
        if(!where || typeof where !== 'object') {
            throw new Error('param error');
        }
        try {
            const result = await this.ctx.model.SysMenuSysOperation.findOne({
                where: where
            });
            return result.dataValues || result;
        } catch (err) {
            throw err;
        }
    }

    /**
     * getLatest record from sys_menu_sys_operation
     */
    async getLatest() {
        const result = await this.ctx.model.SysMenuSysOperation.findOne({
            order: [["CreateTime", 'DESC']]
        });
        return result;
    }


    /**
     * edit a sys_menu_sys_operation
     * @param {Object} entity model sys_menu_sys_operation
     * @return {Object} entity a model Entity
     */
    async edit(entity) {
        try {
            const result = await this.ctx.model.SysMenuSysOperation.update(entity.dataValues || entity, {
                where: {
                    Id: entity.Id
                }
            });
            return result;
        } catch (err) {
            throw err;
        }
    }

    /**
     * remove a record from sys_menu_sys_operation
     * @param {Object} entity a model Entity
     * @return {Object} affact count
     */
    async remove(entity) {
        try{
            entity.Valid = 0;
            return await this.ctx.service.sysMenuSysOperation.edit(entity);
        } catch (err) {
            throw err;
        }
    }

    /**
     * delete a record from sys_menu_sys_operation
     * @param {Object} entity a model Entity
     * @return {Object} affact count
     */
    async delete(entity) {
        try {
            const result = await this.ctx.model.SysMenuSysOperation.destroy({
                where: {
                    Id: entity.Id
                }
            });
            return result;
        } catch (err) {
            throw err;
        }
    }


    /**
     * search in SysMenuSysOperation and left jion with {  }
     * @param {Object} pagination page 
     * @param {Object} where where
     * @param {Object} order order by  
     * @returns {Object} list 
     */
    async search(pagination, where, order) {
        let page = pagination ? pagination.current : 1;
        let pageSize = pagination ? pagination.pageSize : 10;

        // default query
        let whereCon = {
            Valid: {
                '$gt': 0
            }
        }
        if(where && typeof where === "object") {
            whereCon = Object.assign(whereCon, where)
        }

        //default order
        let orderCon = [['CreateTime','Desc']];
        if(order &&  order.length) {
            orderCon = order.concat(orderCon);
        }

        const querySql = (isCount) => {
            let selectVal =  "count(*) as count";
            let sql = "";
            if(isCount) {
                sql = sqlHelper.buildWhereCondition(whereCon, 'sys_menu_sys_operation');
            } else {
                selectVal = "sys_menu_sys_operation.*";
                sql = sqlHelper.buildCondition(pagination, whereCon, orderCon, 'sys_menu_sys_operation');
            }

            sql = `select ${selectVal}
                from sys_menu_sys_operation
                
                ${sql}
            `;

            return sql;
        }

        const countResult = await this.ctx.model.query(querySql(true), {
            type: this.ctx.model.Sequelize.QueryTypes.SELECT
        });

        const rowsResult = await this.ctx.model.query(querySql(), {
            type: this.ctx.model.Sequelize.QueryTypes.SELECT
        });

        return {
            page,
            pageSize,
            count: countResult.length ? countResult[0]["count"] : 0,
            rows: rowsResult
        }
    }
}

module.exports = SysMenuSysOperationService;
