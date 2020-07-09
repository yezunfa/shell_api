/*
 * @Author: yezunfa
 * @Date: 2020-07-09 12:55:40
 * @LastEditTime: 2020-07-09 13:06:09
 * @Description: Do not edit
 */ 
'use strict'

const Service = require('egg').Service
const uuid = require('uuid');

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

}

module.exports = OrderService; 