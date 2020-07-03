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
            const Result = await ctx.model.Product.findOne({
                where: {
                    Valid: 1,
                    UserId: Id,
                },
            })
            return Result
        } catch (error) {
            ctx.logger.error(error)
            return false
        }
    }

}

module.exports = CartService; 