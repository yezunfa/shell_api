'use strict';

/**
 * OrderSubService
 * useage: ctx.service.order_sub
 */
const { sqlMango } = require('../utils/index');
const Service = require('egg').Service;

class OrderSubService extends Service {

    /**
     * create a new order_sub
     * @param {Object} entity model order_sub
     * @return {Object} entity a model Entity
     */
    async create(entity) {
        try {
            const result = await this.ctx.model.OrderSub.create(entity);
            return result;
        } catch (err) {
            throw err;
        }
    }

    /**
     *  get a order_sub by Id
     * @param {String} Id guid
     * @return {Object} entity a model Entity
     */
    async getById(Id) {
        try {
            const result = await this.ctx.model.OrderSub.findOne({
                where: {
                    Id
                }
            });
            return result && result.dataValues ? result.dataValues : result;
        } catch (err) {
            throw err;
        }
    }

    /**
     *  get a order_sub by condtion
     * @param {Object} where condition
     * @return {Object} entity a model Entity
     */
    async getByCondition(where) {
        if(!where || typeof where !== 'object') {
            throw new Error('param error');
        }
        try {
            const result = await this.ctx.model.OrderSub.findOne({
                where: where
            });
            return result && result.dataValues ? result.dataValues : result;
        } catch (err) {
            throw err;
        }
    }

    /**
     * getLatest record from order_sub
     */
    async getLatest() {
        const result = await this.ctx.model.OrderSub.findOne({
            order: [["CreateTime", 'DESC']]
        });
        return result;
    }


    /**
     * edit a order_sub
     * @param {Object} entity model order_sub
     * @return {Object} entity a model Entity
     */
    async edit(entity) {
        try {
            const result = await this.ctx.model.OrderSub.update(entity.dataValues || entity, {
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
     * remove a record from order_sub
     * @param {Object} entity a model Entity
     * @return {Object} affact count
     */
    async remove(entity) {
        try{
            entity.Valid = 0;
            return await this.ctx.service.orderSub.edit(entity);
        } catch (err) {
            throw err;
        }
    }

    /**
     * delete a record from order_sub
     * @param {Object} entity a model Entity
     * @return {Object} affact count
     */
    async delete(entity) {
        try {
            const result = await this.ctx.model.OrderSub.destroy({
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
     * search in OrderSub and left jion with {  }
     * @param {Object} pagination page 
     * @param {Object} where where
     * @param {Object} order order by  
     * @returns {Object} list 
     */
    async search({$pagination, $query, $sort}) {
        const { ctx } = this
        const type = ctx.model.Sequelize.QueryTypes.SELECT
        const { current = 1, pageSize = 10, disabled = true } = $pagination || {}

        const sql = type => {
            switch (type) {
                case "Count":
                    return `select count(ViewTable.Id) as count
                    from (select * from order_sub) as ViewTable
                    ${sqlMango.buildWhereCondition($query, 'ViewTable')}`
                default:
                    const { condition, order, limit } = sqlMango.buildCondition($pagination, $query, $sort, 'ViewTable');
                    return `select ViewTable.*
                    from (select * from order_sub) as ViewTable
                    ${condition}
                    ${order ? order : ""}
                    ${disabled ? "" : limit}`
            }
        }

        try {
            const countResult = await ctx.model.query(sql("Count"), { type });
            const dataList = await ctx.model.query(sql(), { type });

            const total = countResult.length ? countResult[0].count : 0
            return { current, pageSize, total, dataList }
        } catch (error) {
            throw new Error(error)
        }
    }
}

module.exports = OrderSubService;
