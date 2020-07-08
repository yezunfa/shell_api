/*
 * @Author: yezunfa
 * @Date: 2020-07-05 13:34:22
 * @LastEditTime: 2020-07-06 10:05:11
 * @Description: Do not edit
 */ 
'use strict';

const Controller = require('egg').Controller;
const moment = require("moment");
const utils = require('../../utils/index');
const uuid = require('uuid')
class Payment extends Controller {

    reportbody(message) { return { message, code: 500, success: false }  }

    idempotent(message, data) { return { message, code: 200, success: true, data } }

    /**
     * todo : 对接enums
     * 可能需要根据返回的id去判断修改res或者card
     * 只能支付一笔主订单的款项
     */
    async payController() {
        const ctx = this.ctx
        
        const { userid } = ctx.query

        const { PayWay, OrderId, ReservationId, PayCardId } = ctx.request.body
        const CreateTime = new Date()
        const CreatePerson = "system"
        try {
            const OrderInfo = await ctx.service.orderMain.getById(OrderId) 
            const { Code, PayState, Id, Amount, TotalAmount } = OrderInfo
            if (!Id) {
                ctx.body = {
                    success: false,
                    message: `订单号错误:${Code}`,
                    code: 512
                }
                return
            }
            if (parseInt(PayState) === 1) {
                await ctx.service.memberReservation.edit({ // update 预约
                    Id: ReservationId,
                    State: 1
                })
                ctx.body = {
                    success: false,
                    message: `订单已支付过了，请勿重复支付`,
                    code: 200
                }
                return
            }
            
            let $Amount = TotalAmount // todo 获取微信支付金额!!!
            // if (parseInt(PayWay) === 1 ) { // 微信支付
                
            await ctx.service.orderPayment.create({ // 新增一条payment
                Id: uuid.v4(),
                UserId: userid,
                OrderId,
                PayWay,
                Type: 0, 
                Amount: $Amount,
                State: 1,
                PayTime: new Date()
            }) 
            OrderInfo.PayWay = parseInt(PayWay) === 0 ? null : PayWay
            OrderInfo.PayState = 1
            OrderInfo.Amount = parseInt(PayWay) === 0 ? null : $Amount
            const result = await ctx.service.orderMain.edit(OrderInfo) // update 主订单 todo result校验

            
            // update 订单
            await ctx.service.orderMain.edit({ State: 1, Id })
            

            ctx.body = {
                success: true,
                code: 200,
                consuming: `${new Date() - CreateTime}`,
            }
        } catch (error) { // todo 错误类型 
            let message = error
            if (error && error.parent && error.parent.sqlMessage) {
                message = parseInt(error.parent.sqlState) === 22003 ? "余额不足" : error.parent.sqlMessage
            }
            ctx.body = {
                code: error.code || 5541,
                success: false,
                message
            }
            ctx.logger.error(error, 'app/controller/payment/payController:139')
            return
        }
    }


    /**
     * 微信支付提交
     * 只需要提交订单号与用户信息。金额等从数据库取
     */
    async wxPaySubmit() {
        const { ctx } = this;
        const { orderId, openid } = ctx.request.body;
       
        try {
            const orderInfo = await ctx.service.orderMain.getById(orderId);

            ctx.logger.info('支付订单信息: ',orderInfo )
            if(!orderInfo) return ctx.body = this.idempotent('无效订单')

            const { Amount, Name, Code, Remark } = orderInfo;
            const params = { openid }
            params.body = Name //支付内容
            params.detail = Remark || '预约课程' // todo 取子订单的ProductName
            params.orderNo = Code
            params.amount = Amount * 100 // todo use Decimal(Amount * 100)

            ctx.body = await ctx.service.payment.wxpay.paySubmit(params);
        } catch (error) {
            ctx.logger.error(error);
            if(!orderInfo) return ctx.body = this.reportbody('网络繁忙，请稍后重试')
        }
    }

    /**
     * 退款功能
     */
    async wxPayRefund() {
        const { ctx } = this;
        const { orderNo } = ctx.request.body;
       
        // todo 
        const orderInfo = await ctx.service.orderExpand.getPayOrderInfo({orderNo}); // where 用户等于当前用户
        // 上面的接口返回以下格式？怎么防止攻击退款?
        const { Amount } = orderInfo

        const refundOrder = {
            out_refund_no: 'refund' + orderNo, //退款单号 随机生成？
            out_trade_no: orderNo, //订单编号
            total_fee: Amount, //订单总金额（单位：分）
            refund_fee: Amount, //退款金额（单位：分）
        }

        let result = {
            success: false,
            errorMessage: '网络繁忙，请稍后重试',
        }

        try{
            result = await ctx.service.payment.wxpay.refundSubmit(refundOrder);
        } catch(ex) {
            this.ctx.logger.error(ex);
            result.code = 500
            result.ex = ex
        }
        
        ctx.body = result;
    }

    /**
     * 测试返回值
     */
    async demo() {
        const order_payment_list = await this.ctx.service.orderExpand.getOrderPayentlist({
            OrderId: "85309427-d3ee-4977-8cf0-06c4ab4210c3"
        })
        console.log(order_payment_list)
    }
}


module.exports = Payment;
