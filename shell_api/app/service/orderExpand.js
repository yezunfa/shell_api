'use strict';

/**
 * MemberExpandService
 * useage: ctx.service.memberExpand
 */
const Service = require('egg').Service;

class OrderExpandService extends Service {

    /**
     * create reservation
     * @param {String} openid condition
     */
    async createReservation(entity) {
        let sql_filter = ''
        let sql_values = ''
        for (const key in entity) {
            if (entity.hasOwnProperty(key)) {
                const element = entity[key];
                if (sql_filter.length > 0) {
                    sql_filter += `, ${key}`
                    sql_values += `, ${element}`
                } else {
                    sql_filter += `${key}`
                    sql_values += `${element}`
                }
            }
        }
        let sql_string = `
            insert into 
            member_reservation(${sql_filter}) 
            values(${sql_values}) 
        `
        try {
            const result = await this.ctx.model.query(sql_string, {
                type: this.ctx.model.Sequelize.QueryTypes.INSERT
            })
            return result.dataValues || result;
        } catch (err) {
            throw err;
        }
    }

    /**
     *  
     * */
    async getOrderPayentlist({ orderid }) {
        let sql_string = `
            select * from order_payment
            where order_payment.Valid = 1
            and order_payment.OrderId = "${orderid}"
        `
        try {
            const result = await this.ctx.model.query(sql_string, {
                type: this.ctx.model.Sequelize.QueryTypes.SELECT
            })
            return result.dataValues || result;
        } catch (err) {
            throw err;
        }
    }

    async getPayOrderInfo({orderNo}) {
        const { ctx } = this
        const sql = `select order_main.*
        from order_main
        left join order_refund on order_refund.OrderId = order_main.Id
        where order_main.Code = "${orderNo}"
        and order_refund.Id is null
        and order_main.PayWay = 1
        and order_main.State = 1
        and order_main.Valid = 1`
        try {
            const type = ctx.model.Sequelize.QueryTypes.SELECT
            return await ctx.model.query(sql, { type })
        } catch (error) {
            throw error;
        }
    }
}

module.exports = OrderExpandService;
