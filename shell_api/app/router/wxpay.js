'use strict';

module.exports = app => {

    const {router, controller, middleware} = app;

    router.get('/wxpay/', controller.wxpay.index);
    router.get('/wxpay/mobile', controller.wxpay.mobile);
    router.get('/wxpay/native', controller.wxpay.native);
    router.get('/wxpay/jsapi', controller.wxpay.jsapi);
    router.get('/wxpay/jsapiresult', controller.wxpay.jsapi);
    router.get('/wxpay/h5pay', controller.wxpay.h5pay);

    router.get('/wxpay/refund', controller.wxpay.refund);
    router.get('/wxpay/query', controller.wxpay.query);

    router.post('/wxpay/nativeSubmit', controller.wxpay.nativeSubmit);
    router.post('/wxpay/jsapiSubmit', controller.wxpay.jsapiSubmit);
    router.post('/wxpay/h5paySubmit', controller.wxpay.h5paySubmit);

    router.post('/wxpay/refundSubmit', controller.wxpay.refundSubmit);
    router.post('/wxpay/querySubmit', controller.wxpay.querySubmit);

    router.post('/wxpay/receive/wxReceive', middleware.xmlparse(), controller.wxpay.wxReceive);
    router.post('/wxpay/receive/wxRefund', middleware.xmlparse(), controller.wxpay.wxRefund);
    // router.resources('topics', '/wxpay/api/v1/topics', app.controller.topics);
};
