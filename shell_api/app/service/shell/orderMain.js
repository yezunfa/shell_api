/*
 * @Author: yezunfa
 * @Date: 2020-07-09 12:55:40
 * @LastEditTime: 2020-08-02 20:46:13
 * @Description: Do not edit
 */ 
'use strict'

const Service = require('egg').Service
const uuid = require('uuid');
const { sqlMango } = require('../../utils/index');

class OrderService extends Service {
    
    async create(entity) {
        try {
            const result = await this.ctx.model.OrderMain.create(entity);
            return result;
        } catch (err) {
            throw err;
        }
    }

    async edit(entity) {
        try {
            const result = await this.ctx.model.OrderMain.update(entity.dataValues || entity, {
                where: {
                    Id: entity.Id
                }
            });
            return result;
        } catch (err) {
            throw err;
        }
    }

    async editByApi(payload,OrderMainId) {
        try {
            const result = await this.ctx.model.OrderMain.update(payload , {
                where: {
                    Id: OrderMainId
                }
            });
            return result;
        } catch (err) {
            throw err;
        }
    }
    /**
     * get detail by cart Id
     */
    async getById(Id) {
        const { ctx } = this;
        try {
            const Result = await ctx.model.OrderMain.findOne({
                where: {
                    Id
                },
            })
            return Result
        } catch (error) {
            ctx.logger.error(error)
            return false
        }
    }

    async findCartInfo({OrderId}){
        const { ctx } = this
        try {
            const Result = await ctx.model.OrderSub.findAll({
                where: {
                    OrderId
                },
            })
            return Result
        } catch (error) {
            ctx.logger.error(error)
            return false
        }
    }

    async getAllOrderMain({$pagination, $query, $sort}) {
        const { ctx } = this
        const { current, pageSize, disabled } = $pagination
        const viewtable = 
            ` select * from order_main
              where order_main.PayState = 1
             `
        const sql = type => {
            switch (type) {
                case "Count":
                    return `select count(ViewTable.Id) as count
                    from (${viewtable}) as ViewTable
                    -- ${sqlMango.buildWhereCondition($query, 'ViewTable')}`
                default:
                    const { condition, order, limit } = sqlMango.buildCondition($pagination, $query, $sort, 'ViewTable');
                    return `select ViewTable.*
                    from (${viewtable}) as ViewTable
                    -- ${condition}
                    ${order ? order : ""}
                    ${disabled ? "" : limit}`
            }
        }

        try {
            const type = ctx.model.Sequelize.QueryTypes.SELECT
            
            const countResult = await ctx.model.query(sql("Count"), { type });
            const dataList = await ctx.model.query(sql(), { type });

            const total = countResult.length ? countResult[0].count : 0
            return { current, pageSize, total, dataList }
        } catch (error) {
            throw new Error(error)
        }        
    }
}

module.exports = OrderService; 