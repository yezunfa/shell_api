'use strict';

const request = require('request');
const urlencode = require('urlencode');
const Controller = require('egg').Controller;

// 引入微信支付插件
const WXPay = require('../extend/wxpay');
const fs = require('fs');

const wxpay = WXPay({
    appid: 'wx1fe7f046ead630b6',
    mch_id: '1466285902',
    partner_key: 'lqOrsFelsj2vyugaKSgrnwzjWUof2NKC', // '商户密钥（证书密码）',
    pfx: fs.readFileSync('pay/wx_cert/apiclient_cert.p12')
});

class WxPayController extends Controller {

    async index() {
        const {
            ctx
        } = this;

        const page = ctx.query.page || 1;
        // const dataList = await ctx.service.wxpay.list(page);
        const dataList = [{
                id: 1,
                title: 'this is news 1',
                time: '2019-03-13 16:00:00',
                url: '/news/1'
            },
            {
                id: 2,
                title: 'this is news 2',
                time: '2019-03-13 16:00:00',
                url: '/news/2'
            }
        ];

        await ctx.render('wxpay/index', {
            list: dataList
        });
    }

    async mobile() {
        const {
            ctx
        } = this;
        await ctx.render('wxpay/mobile', {});
    }

    /**
     * 扫码支付页面 */
    async native() {
        const {
            ctx
        } = this;
        await ctx.render('wxpay/native', {});
    }

    /**
     * 公众号支付 */
    async jsapi() {
        const {
            ctx
        } = this;
        await ctx.render('wxpay/jsapi', {});
    }

    /**
     * 手机H5支付 */
    async h5pay() {
        const {
            ctx
        } = this;
        await ctx.render('wxpay/h5pay', {});
    }

    /**
     * 发起退款页面 */
    async refund() {
        const {
            ctx
        } = this;
        await ctx.render('wxpay/refund', {});
    }

    /**
     * 订单查询 */
    async query() {
        const {
            ctx
        } = this;
        await ctx.render('wxpay/query', {});
    }

    /**
     * 发起扫码支付 */
    async nativeSubmit() {
        const {
            ctx
        } = this;

        const result = await wxpay.createUnifiedOrder({
            body: '扫码支付测试', // 商品描述
            out_trade_no: ctx.request.body.orderNum, //订单编号
            total_fee: 1, //支付总金额（单位：分）
            spbill_create_ip: '192.168.2.210', //付款ip
            notify_url: 'http://mp.ngrok.xiaomiqiu.cn/receive/wxReceive', //支付回调地址
            trade_type: 'NATIVE', //支付方式 扫码付
        });

        ctx.status = 200;
        // 处理表单提交后的事件，此处返回表单提交的内容
        ctx.body = `${JSON.stringify(result)}`;
    }

    /**
     * 发起公众号支付 */
    async jsapiSubmit() {
        const {
            ctx
        } = this;
        let result = {
            success: false
        }
        try {
            result = await wxpay.getBrandWCPayRequestParams({
                openid: 'obBHU5IHcvdWlYB6xMOHjmmNbxp8', //微信用户openid
                body: '公众号支付测试', //支付内容
                detail: '公众号支付测试', //支付内容
                out_trade_no: ctx.request.body.orderNum, //订单编号
                total_fee: 1, //支付总金额（单位：分）
                spbill_create_ip: '39.98.215.179',
                notify_url: 'https://www.51fusion.com/wxpay/receive/wxReceive', //支付回调地址
            });
        } catch (ex) {
            this.logger.error(ex);
            this.ctx.body = {
                success: false,
                message: ex.message
            }
        }

        // 渲染静态页面，模拟提交表单
        await ctx.render('wxpay/jsapiresult', {
            payargs: `${JSON.stringify(result)}`
        });
    }



    /**
     * h5 支付 */
    async h5paySubmit() {
        const {
            ctx
        } = this;

        const result = await wxpay.createOutH5Pay({
            body: 'H5支付测试', // 商品描述
            out_trade_no: ctx.request.body.orderNum, //订单编号
            total_fee: 1, //支付总金额（单位：分）
            spbill_create_ip: '192.168.2.210', //付款ip
            notify_url: 'http://mp.ngrok.xiaomiqiu.cn/receive/wxReceive', //支付回调地址
            trade_type: 'NATIVE', //支付方式 扫码付
        });

        if (result.return_code == "SUCCESS") {
            // 渲染静态页面，模拟提交表单
            // 此处需要添加支付完成或取消返回的路径
            result.mweb_url = result.mweb_url + "&redirect_url=" + urlencode("http://mp.ngrok.xiaomiqiu.cn/h5pay")
        }

        console.log(result);

        ctx.status = 200;
        // 处理表单提交后的事件，此处返回表单提交的内容
        ctx.body = `${JSON.stringify(result)}`;
    }

    /**
     * 发起退款 */
    async refundSubmit() {
        const {
            ctx
        } = this;
        this.ctx.body = {
            success: true,
        }

        const result = await wxpay.refundOrder({
            notify_url: 'http://mp.ngrok.xiaomiqiu.cn/receive/wxRefund', //回调地址
            out_refund_no: ctx.request.body.refundNum, //退款单号
            out_trade_no: ctx.request.body.orderNum, //订单编号
            total_fee: 1, //订单总金额（单位：分）
            refund_fee: 1, //退款金额（单位：分）
        });

        console.log(result);

        ctx.status = 200;
        // 处理表单提交后的事件，此处返回表单提交的内容
        ctx.body = `${JSON.stringify(result)}`;
    }

    /**
     * 查询 */
    async querySubmit() {
        const {
            ctx
        } = this;

        const result = await wxpay.queryOrder({
            out_trade_no: ctx.request.body.orderNum, //订单编号
        });

        ctx.status = 200;
        // 处理表单提交后的事件，此处返回表单提交的内容
        ctx.body = `${JSON.stringify(result)}`;
    }


    /**
     * 支付回调 */
    async wxReceive() {
        const {
            ctx
        } = this;
        console.log("收到支付回调 out");
        this.ctx.logger.info('收到支付回调 out', ctx);
        this.ctx.logger.info('收到支付回调 request boy', ctx.request.body);

        // 支付结果异步通知
        wxpay.eggWXCallback(ctx.req, ctx.res, function (msg, req, res) {
            ctx.logger.info('收到支付回调 eggWXCallback', msg);
            ctx.logger.info(' typeof ctx.service.wxpayRecord.saveWxpayRecord: ' + typeof ctx.service.wxpayRecord.saveWxpayRecord)
            
            // todo 保存微信支付记录
            // try{
            //     ctx.service.wxpayRecord.saveWxpayRecord(msg);
            // } catch(ex) {
            //     ctx.logger.error('saveWxpayRecord异常', ex);
            // }
           
            /* msg
            {   appid: 'xxxxxxx',
                bank_type: 'CFT',
                cash_fee: '1',
                fee_type: 'CNY',
                is_subscribe: 'N',
                mch_id: '1466285902',
                nonce_str: 'rwCbhu3wSTSCcKJ15hrK5hJMm5maR2nI',
                openid: 'obBHU5IHcvdWlYB6xMOHjmmNbxp8',
                out_trade_no: '837d16d0955611e9816319274e66843f',
                result_code: 'SUCCESS',
                return_code: 'SUCCESS',
                sign: '6FE04E438BC0A0BFD57A0620D5D8EE21',
                time_end: '20190623093045',
                total_fee: '1',
                trade_type: 'JSAPI',
                transaction_id: '4200000297201906236848063475' 
            }
            */


            res.success();
        });
    }

    /**
     * 退款回调 */
    async wxRefund() {
        const {
            ctx
        } = this;
        console.log("收到退款回调 out", ctx.body);

        // 支付结果异步通知
        wxpay.eggWXCallback(ctx.req, ctx.res, function (msg, req, res) {
            console.log("收到退款回调");
            console.log(msg);
            res.success();
        });
    }
}

module.exports = WxPayController;
