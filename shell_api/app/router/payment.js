/*
 * @Author: yezunfa
 * @Date: 2020-03-28 22:14:32
 * @LastEditTime: 2020-07-05 13:34:34
 * @Description: Do not edit
 */ 
'use strict';

module.exports = app => {

    const {router, controller} = app;

    router.post('/payment/wxpay/submit', controller.shell.payment.wxPaySubmit);
    router.post('/payment/wxpay/refund', controller.shell.payment.wxPayRefund);
 
};
