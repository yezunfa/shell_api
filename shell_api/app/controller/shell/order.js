/*
 * @Author: yezunfa
 * @Date: 2020-07-08 15:51:57
 * @LastEditTime: 2020-07-09 13:08:47
 * @Description: Do not edit
 */ 
'use strict';

const Controller = require('egg').Controller;
const uuid = require('uuid');
const moment = require('moment')

class Order extends Controller {
    reportbody(message) { return { message, code: 500, success: false }  }

    idempotent(message, data) { return { message, code: 200, success: true, data } }
    /**
     * 添加一个产品到购物车中
     * 先判断是否有Valid=1的购物车，无则新建ParentId的购物车
     */
    async createByApi() {
        const ctx = this.ctx;
        const {  Mobile, SelectCart, TotalPrice, UserId, Type, cartParentId } = ctx.request.body; 

        // 数据初始化
        const OrderId = uuid.v4() 
        const CreateTime = new Date()
        const Code = uuid.v1().split('-').join('') // todo
        const CreatePerson = UserId

        // 创建主订单
        try {
            const MainEntity = { Id:OrderId, UserId, Mobile, CartId: cartParentId, Type, TotalPrice, CreateTime, Code, CreatePerson  }
            MainEntity.PayWay = 1 // 微信支付

            const OrderMain = await ctx.model.OrderMain.create(MainEntity);
            const SubArray = JSON.parse(SelectCart)
            if (SubArray && SubArray.length) {
                const { Id:ParentId } = OrderMain
                for (let index = 0; index < SubArray.length; index++) {
                    const element = SubArray[index]; 
                    const { Amount, CartId, Id: ProductId, Price } = element
                    const SubEntity = {
                        Id: uuid.v4(),
                        OrderId:ParentId,
                        CartId,
                        Count: Amount,
                        Price,
                        ProductId,
                        CreateTime,
                        CreatePerson
                        }
                        await ctx.model.OrderSub.create(SubEntity);
                        await ctx.service.shell.cart.editByApi({State: 2},CartId)
                }
            }
            ctx.body = this.idempotent('已生成订单', { OrderId, Code })
            
        } catch (error) {
            console.log(error)
            ctx.logger.error(error, '下单失败')
            ctx.body = this.reportbody('系统繁忙，请重试')
        }
    }


    async edit() {
        const ctx = this.ctx;
        const orderEntity = ctx.request.body;
        if (!orderEntity.Id) {
            ctx.body = {
                code: 444,
                success: false,
                message: '参数不合法'
            };
            return;
        }
        try {
            const result = ctx.service.shell.order.edit(orderEntity);
            ctx.body = {
                success: true,
                code: 200,
                message: `edit order data successfully`,
                data: result,
            }
        } catch (error) {
            console.error(error)
            ctx.logger.error(error)
            ctx.body = {
                success: false,
                code: 444,
                message: `${error}`,
            }
        }
    }

    /**
     *  todo :订单详情
     */
    async detail(){
        const ctx = this.ctx;
        const { userid, Id: OrderId } = ctx.query;

        if (!OrderId) {
            ctx.body = {
                code: 444,
                success: false,
                message: '参数不足'
            };
            return;
        }
        try {
            const p1 = ctx.service.shell.order.getOrderSubByOrderId(OrderId);
            const p2 = ctx.service.shell.order.getOrderMainById(OrderId);
            await Promise.all([p1, p2]).then(([ OrderSubList, OrderMain ]) => {
                ctx.body = {
                    success: false,
                    code: 200,
                    message: `get order detail successfully`,
                    data: {
                        OrderSubList,
                        OrderMain
                    }
                }
            })
        } catch (error) {
            console.error(error)
            ctx.logger.error(error)
            ctx.body = {
                success: false,
                code: 444,
                message: `${error}`,
            }
        }
    }

    async paymentCancel(){
        const { ctx } = this
        const { OrderId } = ctx.request.body

        try {
            const SubArray = await ctx.service.shell.orderMain.findCartInfo({OrderId})
            for (let index = 0; index < SubArray.length; index++) {
                const element = SubArray[index];
                const { CartId } = element
                await ctx.service.shell.cart.editByApi({State: 1},CartId)
            }
            const result = await ctx.service.shell.orderMain.editByApi({PayState: 0}, OrderId)// 支付未完成
            ctx.body = this.idempotent('用户已取消订单', { OrderId, result})
        } catch (error) {
            console.log(error)
            ctx.logger.error(error, '订单取消失败')
            ctx.body = this.reportbody('系统繁忙，请重试')
        }
    }
}

module.exports = Order;