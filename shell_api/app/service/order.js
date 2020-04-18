'use strict';

/**
 * OrderService
 * useage: ctx.service.order
 */
const Service = require('egg').Service;

class OrderService extends Service {

    /**
     * 通过预约id获取订单信息 
     * @param {*} ReservationId 
     */
    async getOrderByReservationId(ReservationId) {
        const sql = `select order_main.*, member_reservation.CourseScheduleId
        from order_main
        left join order_sub
        on order_sub.OrderId = order_main.Id
        left join member_reservation
        on member_reservation.Id = order_sub.ReservationId
        where order_main.Valid = 1
        and order_sub.ReservationId = "${ReservationId}"
        group by order_main.Id`
        try {
            const result = await this.ctx.model.query(sql, {
                type: this.ctx.model.Sequelize.QueryTypes.SELECT
            });
            return result
        } catch (error) {
            throw new Error(error)
        }
    }

    /**
     * 通过订单id获取支付卡信息
     * @param {*} OrderId 
     */
    async PayCardInfoByOrderId(OrderId) {
        const sql = `select card.*, order_payment.Amount as PayAmount,
        card_history.OperationRemark as PayRecord
        from card
        left join card_history
        on card_history.CardId = card.Id
        left join order_payment
        on order_payment.OrderId = card_history.OrderId
        where card_history.OrderId = "${OrderId}"`
        try {
            const result = await this.ctx.model.query(sql, {
                type: this.ctx.model.Sequelize.QueryTypes.SELECT
            });
            return result[0]
        } catch (error) {
            throw new Error(error)
        }
    }

    /**
     * 支付卡的扣/退款操作
     */
    async cutCardBlance ({CardId, Amount}, useGift, refund) {
        const { ctx } = this
        
        const sign = refund ? "+" : "-"
        
        const sql = `update card 
        set card.Blance = card.Blance ${sign} ${Math.abs(Amount)} 
        where card.Id = "${CardId}"`

        const sql_gift = `update card 
        set card.BlanceGift = card.BlanceGift ${sign} ${Math.abs(Amount)} 
        where card.Id = "${CardId}"`

        try {
            const result = await ctx.model.query(useGift ? sql_gift : sql, {
                type: this.ctx.model.Sequelize.QueryTypes.UPDATE,
            })
            return result
        } catch (error) {
            throw new Error(error)
        }
    }
}

module.exports = OrderService;
