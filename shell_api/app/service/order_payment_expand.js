'use strict';

/**
 * MemberExpandService
 * useage: ctx.service.memberExpand
 */
const Service = require('egg').Service;

class OrderPaymentExpand extends Service {

    /**
     * 获取扣款优先级最高的套餐卡
     * @return {Object} entity a model Entity
     */
    async getPaymentCard(query, amount = 1) {
        const { userid, coursescheduleid, } = query
        let sql_string = `
            select card.* from card
            left join course_schedule
            on course_schedule.Id = "${coursescheduleid}"
            left join course_package_relate
            on course_package_relate.CourseId = course_schedule.CourseId
            left join order_sub
            on order_sub.PackageId = course_package_relate.PackageId
            where card.Valid = 1
            and card.Type = 3
            and card.OrderSubId = order_sub.Id
            and card.UserId = "${userid}"
            and card.State = 1
            and card.Blance >= ${amount}
            order by card.ExpireDate 
            limit 1 
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

    /**
     * 扣款
     */
    async cutPayment({ cardid }, amount = 1) {
        let sql_string = `
            update card set card.Blance = card.Blance - ${amount} where card.Id = "${cardid}"
        `
        try {
            const result = await this.ctx.model.query(sql_string, {
                type: this.ctx.model.Sequelize.QueryTypes.UPDATE
            })
            if (!result[0] && parseInt(result[1]) === 1) {
                return true
            }
            return result
        } catch (err) {
            throw err;
        }
    }
}

module.exports = OrderPaymentExpand;
