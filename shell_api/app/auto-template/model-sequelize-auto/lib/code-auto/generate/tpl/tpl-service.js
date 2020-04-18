'use strict';

/**
 * __Tablename__Service
 * useage: ctx.service.__tablename__
 */
const { sqlHelper } = require('../utils/index');
const Service = require('egg').Service;

class __Tablename__Service extends Service {

    /**
     * create a new __tablename__
     * @param {Object} entity model __tablename__
     * @return {Object} entity a model Entity
     */
    async create(entity) {
        try {
            const result = await this.ctx.model.__Tablename__.create(entity);
            return result;
        } catch (err) {
            throw err;
        }
    }

    /**
     *  get a __tablename__ by Id
     * @param {String} Id guid
     * @return {Object} entity a model Entity
     */
    async getById(Id) {
        try {
            const result = await this.ctx.model.__Tablename__.findOne({
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
     *  get a __tablename__ by condtion
     * @param {Object} where condition
     * @return {Object} entity a model Entity
     */
    async getByCondition(where) {
        if(!where || typeof where !== 'object') {
            throw new Error('param error');
        }
        try {
            const result = await this.ctx.model.__Tablename__.findOne({
                where: where
            });
            return result.dataValues || result;
        } catch (err) {
            throw err;
        }
    }

    /**
     * getLatest record from __tablename__
     */
    async getLatest() {
        const result = await this.ctx.model.__Tablename__.findOne({
            order: [["CreateTime", 'DESC']]
        });
        return result;
    }


    /**
     * edit a __tablename__
     * @param {Object} entity model __tablename__
     * @return {Object} entity a model Entity
     */
    async edit(entity) {
        try {
            const result = await this.ctx.model.__Tablename__.update(entity.dataValues || entity, {
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
     * remove a record from __tablename__
     * @param {Object} entity a model Entity
     * @return {Object} affact count
     */
    async remove(entity) {
        try{
            entity.Valid = 0;
            return await this.ctx.service.__servicename__.edit(entity);
        } catch (err) {
            throw err;
        }
    }

    /**
     * delete a record from __tablename__
     * @param {Object} entity a model Entity
     * @return {Object} affact count
     */
    async delete(entity) {
        try {
            const result = await this.ctx.model.__Tablename__.destroy({
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
     * search in __Tablename__ and left jion with { _Foreign_Tables_ }
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
                sql = sqlHelper.buildWhereCondition(whereCon, '__tablename__');
            } else {
                selectVal = "__joinSearch_selectVal__";
                sql = sqlHelper.buildCondition(pagination, whereCon, orderCon, '__tablename__');
            }

            sql = `select ${selectVal}
                __joinSearch_from__
                __joinSearch_join__
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

module.exports = __Tablename__Service;
