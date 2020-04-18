module.exports = app => {
    const { controller } = app;
    // 预约下单接口
    app.router.post('/api/order/place', controller.placeOrder.reservation)
    
    // 订单成功后，修改订单状态
    app.router.post('/api/order/setState', controller.placeOrder.changeState)
    // 订单价格校验(优惠卷)
    app.router.post('/api/order/calculater', controller.placeOrder.calculaterOrderAmount)
    //
    app.router.post('/api/order/sendSuccessMessage', controller.placeOrder.orderMessage)
};
