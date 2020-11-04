/*
 * @Author: yezunfa
 * @Date: 2020-06-30 01:34:44
 * @LastEditTime: 2020-11-04 13:01:18
 * @Description: Do not edit
 */ 
'use strict'

const Service = require('egg').Service
const uuid = require('uuid');

class ProductService extends Service {

    async create(entity) {
        try {
            const result = await this.ctx.model.Product.create(entity);
            return result;
        } catch (err) {
            throw err;
        }
    }

    // 获取商品类型
    async getAllProductTypes(){
        const { ctx } = this
        const sql =`
        select pt.Id as id,pt.Name as name
        from product_type pt
        where pt.Valid = 1
        order by Id asc
        `
        try {
            const result = await this.ctx.model.query(sql, {
                type: this.ctx.model.Sequelize.QueryTypes.SELECT
            })
            return result.dataValues || result;
        } catch (err) {
            throw err;
        }
    }

    /**
     *  get a user by openid
     * @param {String} openid condition
     * @return {Object} entity a model Entity
     */
    async getAllProductInfo() {
        const { ctx } = this
        try {
            // 查询数据库中的商品数据 
            const Result = await ctx.model.Product.findAll({
                where: {
                    Valid:1
                },
                order: [['Type', 'asc']]
            })
            return Result
        } catch (error) {
            ctx.logger.error(error)
            return false
        }
    }

    /**
     * get detail by product Id
     */
    async getById(Id) {
        const { ctx } = this;
        try {
            const Result = await ctx.model.Product.findOne({
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
}

module.exports = ProductService 