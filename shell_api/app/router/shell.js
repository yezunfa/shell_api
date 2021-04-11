/*
 * @Author: yezunfa
 * @Date: 2020-03-29 21:32:55
 * @LastEditTime: 2020-10-28 15:36:10
 * @Description: Do not edit
 */ 
module.exports = app => {
    const { controller } = app;

    app.router.post('/api/shell_login/wechat', controller.shell.member.wechatLogin) // 用户登陆
    app.router.post('/api/shell_wechat/cryptdata', controller.shell.member.cryptdata)
    app.router.post('/api/shell_wechat/register', controller.shell.member.register)
    
    // 口腔类商品
    
    app.router.get('/api/productList/getAllProduct', controller.shell.product.getAllProduct)
    app.router.get('/api/productType/getType', controller.shell.product.getAllTypes)
    app.router.get('/api/product/detail', controller.shell.product.detail)


    // 购物车
    app.router.post('/api/cart/add', controller.shell.cart.create)
    app.router.get('/api/cart/getByUserId', controller.shell.cart.getByUserId)
    // 订单
    app.router.post('/api/cart/createOrder', controller.shell.order.createByApi)
    app.router.post('/api/order/edit', controller.shell.order.edit)
    app.router.post('/api/order/sub_success', controller.shell.order.success)
    app.router.get('/api/order/list', controller.shell.order.getAllOrder)
    app.router.get('/api/order/order_main', controller.shell.order.getOrderMainById)
    app.router.get('/api/order/sub_list', controller.shell.order.getSubOrder)
    app.router.get('/api/order/detail', controller.shell.order.detail)
    app.router.post('/api/order/writeOff', controller.shell.order.writeOff)
    app.router.post('/order/payment/cancel', controller.shell.order.paymentCancel)
    app.router.get('/api/order/get_all',controller.shell.order.getAllOrderMain)
    
    app.router.get('/api/wx/qr_code', controller.tools.wxqrcode)
    app.router.get('/api/product/qr_code',controller.tools.productQrCode)
};
