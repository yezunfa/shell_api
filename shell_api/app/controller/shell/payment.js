/*
 * @Author: yezunfa
 * @Date: 2020-07-05 13:34:22
 * @LastEditTime: 2020-07-09 11:54:57
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

            const { TotalPrice, Name, Code, Remark } = orderInfo;
            const params = { openid }
            params.body = Name || '贝壳口腔服务下单' //支付内容
            params.detail = Remark || '预约服务' // todo 取子订单的ProductName
            params.orderNo = Code
            params.amount = TotalPrice * 100 // todo use Decimal(Amount * 100)

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
        const { TotalPrice } = orderInfo

        const refundOrder = {
            out_refund_no: 'refund' + orderNo, //退款单号 随机生成？
            out_trade_no: orderNo, //订单编号
            total_fee: TotalPrice, //订单总金额（单位：分）
            refund_fee: TotalPrice, //退款金额（单位：分）
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
