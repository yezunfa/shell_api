'use strict';

module.exports = app => {

    const {router, controller} = app;

    router.post('/payment/wxpay/submit', controller.payment.wxPaySubmit);
    router.post('/payment/wxpay/refund', controller.payment.wxPayRefund);
 
};
