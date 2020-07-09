/*
 * @Author: yezunfa
 * @Date: 2020-07-03 12:11:54
 * @LastEditTime: 2020-07-08 17:10:07
 * @Description: Do not edit
 */ 
'use strict'

const Service = require('egg').Service
const uuid = require('uuid');

class CartService extends Service {
    
    async create(entity) {
        try {
            const result = await this.ctx.model.Cart.create(entity);
            return result;
        } catch (err) {
            throw err;
        }
    }

    async edit(entity) {
        try {
            const result = await this.ctx.model.Cart.update(entity.dataValues || entity, {
                where: {
                    Id: entity.Id
                }
            });
            return result;
        } catch (err) {
            throw err;
        }
    }

    async editByApi(payload,CartId) {
        try {
            const result = await this.ctx.model.Cart.update(payload , {
                where: {
                    Id: CartId
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
            const Result = await ctx.model.Cart.findOne({
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

    /**
     * get detail by parent Id
     */
    async getByParentId(ParentId) {
        const { ctx } = this;
        try {
            const Result = await ctx.model.Cart.findOne({
                where: {
                    ParentId
                },
            })
            return Result
        } catch (error) {
            ctx.logger.error(error)
            return false
        }
    }

    /**
     * get valid Parent Id
     */
    async getValidCart(Id) {
        const { ctx } = this;
        try {
            const Result = await ctx.model.Cart.findOne({
                where: {
                    Valid: 1,
                    UserId: Id,
                    ParentId: 'ParentId'
                },
            })
            return Result
        } catch (error) {
            ctx.logger.error(error)
            return false
        }
    }

    /**
     * findAllByParentId
     */
    async findAllByParentId({ParentId}){
        const { ctx } = this
        const sql =  `
        select cart.Id as CartId, cart.Amount, product_type.Name as TypeName, product.* from cart 
        left join product on cart.ProductId = product.Id
        left join product_type on product_type.Id = product.Type
        where 1 = 1 
        and cart.ParentId = '${ParentId}'
        and cart.State = 1
        and cart.Valid = 1
        `
        try {
            const type = ctx.model.Sequelize.QueryTypes.SELECT
            const result = await ctx.model.query(sql, { type });
            return result
        } catch (error) {
            throw error
        }
    }
    
    async findSameCart({userid, ParentId, ProductId }) {
        const { ctx } = this
        const sql = `
        select cart.* from cart 
        where 1 = 1 
        and cart.ParentId = '${ParentId}'
        and cart.ProductId = '${ProductId}'
        and cart.UserId = '${userid}'
        and cart.Valid = 1 
        and cart.State = 1 -- 用户未清楚
        `
        try {
            const type = ctx.model.Sequelize.QueryTypes.SELECT
            const result = await ctx.model.query(sql, { type });
            return result
        } catch (error) {
            throw error
        }
    }

}

module.exports = CartService; 