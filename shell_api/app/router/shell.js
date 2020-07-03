/*
 * @Author: yezunfa
 * @Date: 2020-03-29 21:32:55
 * @LastEditTime: 2020-06-30 01:33:33
 * @Description: Do not edit
 */ 
module.exports = app => {
    const { controller } = app;

    app.router.post('/api/shell_login/wechat', controller.shell.member.wechatLogin) // 用户登陆
    app.router.post('/api/shell_wechat/cryptdata', controller.shell.member.cryptdata)
    
    // 口腔类商品
    
    app.router.get('/api/productList/getAllProduct', controller.shell.product.getAllProduct)
    app.router.get('/api/productType/getType', controller.shell.product.getAllTypes)
    app.router.get('/api/product/detail', controller.shell.product.detail)


    // 购物车
    app.router.post('/api/cart/add', controller.shell.cart.create)
    app.router.get('/api/cart/getByUserId', controller.shell.cart.getByUserId)
    
};
