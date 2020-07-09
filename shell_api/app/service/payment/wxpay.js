'use strict';

/**
 * IndexService
 * useage: ctx.service.payment.wxpay
 */

 // 引入微信支付插件
const WXPay = require('../../extend/wxpay');
const fs = require('fs');

const wxpay = WXPay({
    appid: 'wx2e2fefd27c5d13c6',
    mch_id: '1587813691',
    partner_key: 'shelldentalshelldental8888888888', // '商户密钥（证书密码）',
    pfx: fs.readFileSync('pay/wx_cert/apiclient_cert.p12')
});


const Service = require('egg').Service;

class IndexService extends Service {

     /**
     * 发起公众号支付 */
    async paySubmit(payOrderInfo) {
        console.log(wxpay);
        if(!payOrderInfo || !payOrderInfo.openid || !payOrderInfo.body || !payOrderInfo.orderNo || !payOrderInfo.amount) {
            return {
                success: false,
                errorMessage: '参数不完整'
            }
        }

        if(typeof payOrderInfo.amount !== 'number' ||  payOrderInfo.amount <=0 ) {
            return {
                success: false,
                errorMessage: '支付金额必须大于0'
            }
        }

        let result = null;
        try{
           
            const requestResult = await wxpay.getBrandWCPayRequestParams({
                openid: payOrderInfo.openid, //微信用户openid
                body: payOrderInfo.body, //支付内容
                detail: payOrderInfo.detail,//支付内容
                out_trade_no: payOrderInfo.orderNo, //订单编号
                total_fee: payOrderInfo.amount, //支付总金额（单位：分）
                spbill_create_ip: '120.24.169.8',
                notify_url: 'https://shelldental.top/wxpay/receive/wxReceive',//支付回调地址
            });
            result = {
                success: true,
                code: 200,
                data: requestResult,
                errorMessage: ''
            }
        } catch(ex) {
            console.log(ex);
            result = {
                success: false,
                code: 500,
                errorMessage: "网络繁忙，请稍后重试",
                stack: ex
            }
        }
        return result;
    }
    
     /**
     * 发起退款 */
    async refundSubmit(refundOrderInfo) {
        if(!refundOrderInfo 
            || !refundOrderInfo.out_refund_no 
            || !refundOrderInfo.out_trade_no 
            || !refundOrderInfo.total_fee
            || !refundOrderInfo.refund_fee
        ){
            return {
                success: false,
                errorMessage: '参数不完整'
            }
        }

        if(typeof refundOrderInfo.total_fee !== 'number' 
        ||  refundOrderInfo.total_fee <=0 ) {
            return {
                success: false,
                errorMessage: '总金额必须大于0'
            }
        }

        if(typeof refundOrderInfo.refund_fee !== 'number' 
        ||  refundOrderInfo.refund_fee <=0 
        ||  refundOrderInfo.refund_fee > refundOrderInfo.total_fee
        ) {
            return {
                success: false,
                errorMessage: '退款金额必须大于0,且不能超额退款'
            }
        }

        let result = null;
        try{
            const requestResult = await wxpay.refundOrder({
                notify_url: 'https://shelldental.top/wxpay/receive/wxRefund', //回调地址
                out_refund_no: refundOrderInfo.out_refund_no, //退款单号
                out_trade_no: refundOrderInfo.out_trade_no, //订单编号
                total_fee: 1, //订单总金额（单位：分）
                refund_fee: 1, //退款金额（单位：分）
            });
            result = {
                success: true,
                code: 200,
                data: requestResult,
                errorMessage: ''
            }
        } catch(ex) {
            console.log(ex);
            result = {
                success: false,
                code: 500,
                errorMessage: "网络繁忙，请稍后重试",
                stack: ex
            }
        }
        return result;
    }
}

module.exports = IndexService;
