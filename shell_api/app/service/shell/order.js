/*
 * @Author: yezunfa
 * @Date: 2020-07-03 12:11:54
 * @LastEditTime: 2020-07-08 17:10:07
 * @Description: Do not edit
 */ 
'use strict'

const Service = require('egg').Service
const uuid = require('uuid');

class OrderService extends Service {

    ServiceConfig () {
        const order = `
        select
        order_sub.*,
        product.Name as ProductName,
        product.Type as ProductType,
        product.EnName as ProductEnName,
        product.Price as ProductPrice,
        product.MemberPrice as ProductMemberPrice,
        product.Introduce as Introduce,
        product.Notice as ProductNotice,
        product.Detail as ProductDetail,
        product.Valid as ProductValid,
        product.Remark as ProductRemark,
        product.BannerList
        from order_sub
        left join product on product.Id = order_sub.ProductId
        where 1=1
        `;
        const Table = {
            order
        }
        return {
            Table
        }
    }
    
    /**
     * get detail by OrderId from order_sub
     */
    async getOrderSubByOrderId(Id) {
        const { ctx } = this;
        const sql = `
            select 
            ViewTable.* 
            from (${this.ServiceConfig().Table.order}) as ViewTable
            where 1=1
            and ViewTable.OrderId = '${Id}'
        `
        try {
            const Result = await ctx.model.query(sql, {
                type: this.ctx.model.Sequelize.QueryTypes.SELECT,
            })
            return Result
        } catch (error) {
            ctx.logger.error(error)
            return false
        }
    }
    
    /**
     * get detail by Id from order_main
     */
    async getOrderMainById(Id) {
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

    async getAllOrderMainByUserId({ userid, PayState: _PayState, State: _State }) {
        const PayState = JSON.parse(_PayState);
        const State = JSON.parse(_State);
        let condition = '';
        if (PayState && Array.isArray(PayState) && PayState.length !== 0) condition += ` and PayState in (${PayState.join(',')}) `;
        if (State && Array.isArray(State) && State.length !== 0) condition += ` and State in (${State.join(',')}) `;
        const { ctx } = this;
        const sql = `
            select
            *
            from order_main
            where 1=1
            and UserId = '${userid}'
            ${condition}
        `
        try {
            const Result = await ctx.model.query(sql, {
                type: this.ctx.model.Sequelize.QueryTypes.SELECT,
            })
            return Result
        } catch (error) {
            ctx.logger.error(error)
            return false
        }
    }

    async success(Id) {
        console.log(`支付成功，order_main_id为：${Id}`)
        const { ctx } = this;
        const sql = `
            update order_main 
            set PayState = 1 
            where Id = '${Id}'
        `;
        try {
            const Result = await ctx.model.query(sql, {
                type: ctx.model.Sequelize.QueryTypes.UPADTE,
            })
            return Result
        } catch (error) {
            ctx.logger.error(error)
            return false
        }
    }
}

module.exports = OrderService; 