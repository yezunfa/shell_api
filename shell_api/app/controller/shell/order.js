/*
 * @Author: yezunfa
 * @Date: 2020-07-08 15:51:57
 * @LastEditTime: 2020-08-02 20:48:59
 * @Description: Do not edit
 */ 
'use strict';

const Controller = require('egg').Controller;
const uuid = require('uuid');
const moment = require('moment')
const { handlelTableParams } = require('../../utils/format-mango')

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

    async getOrderMainById() {
        const { ctx } = this;
        const { userid, OrderMainId } = ctx.query;
        if (!OrderMainId) {
            ctx.body = {
                code: 444,
                success: false,
                message: '参数不足'
            };
            return;
        }
        try {
            const orderMain = await ctx.service.shell.order.getOrderMainById(OrderMainId)
            const orderSubList = await ctx.service.shell.order.getOrderSubByOrderId(OrderMainId);
            ctx.body = {
                code: 200,
                success: true,
                message: 'get order-main successfully',
                data: {
                    orderMain,
                    orderSubList,
                }
            };
        } catch (error) {
            console.log(error)
            ctx.body = this.reportbody('系统繁忙，请重试')
        }
    }
 
    async getAllOrder() {
        const { ctx } = this;
        const { userid } = ctx.query;
        if (!userid) {
            ctx.body = {
                code: 444,
                success: false,
                message: '参数不足'
            };
            return;
        }
        try {
            const orderMainList = await ctx.service.shell.order.getAllOrderMainByUserId(ctx.query);
            if (!orderMainList || !orderMainList.length) {
                ctx.body = {
                    code: 200,
                    success: true,
                    message: '暂无相关的订单~'
                };
                return;
            }
            for (let orderMain of orderMainList) {
                const orderSub = await ctx.service.shell.order.getOrderSubByOrderId(orderMain.Id);
                // 理论上是不存在有orderMain的Id没有对应上orderSub的Id的
                if (!orderSub) {
                    ctx.body = {
                        code: 444,
                        success: false,
                        message: '系统错误，请重试'
                    };
                    return;
                }
                orderMain.child = orderSub;
            }
            ctx.body = {
                code: 200,
                success: true,
                message: 'get all order successfully',
                data: orderMainList
            };
            return;
        } catch (error) {
            console.log(error)
            ctx.logger.error(error, '订单取消失败')
            ctx.body = this.reportbody('系统繁忙，请重试')
        }
    }

    async getAllOrderMain(){
        const { ctx } = this;
        let { $sort, $query, $pagination } = {}

        try {
            ({ $sort, $query, $pagination } = handlelTableParams(ctx.query, {
                $sort: [
                    ['CreateTime', 'desc']
                ],
                $query: {
                    Valid: 1
                },
                $pagination: {
                    current: 1,
                    pageSize: 10,
                    disabled: false
                }
            }))
        } catch (error) {
            const code = 500
            const success = false
            const message = error.message || error
            ctx.logger.error(message);
            ctx.body = { success, message, code }
            return false
        }

        try {
            const orderMainList = await ctx.service.shell.orderMain.getAllOrderMain({$pagination, $query, $sort});
            ctx.body = {
                code: 200,
                success: true,
                message: 'get all order successfully',
                data: orderMainList
            };
            return;
        } catch (error) {
            console.log(error)
            ctx.logger.error(error, '获取所有主订单失败')
            ctx.body = this.reportbody('系统繁忙，请重试')
        }
    }
    
    /**
     * 未测试
     */
    async getSubOrder() {
        const { ctx } = this;
        const { userid } = ctx.query;
        if (!userid) {
            ctx.body = {
                code: 444,
                success: false,
                message: '参数不足'
            };
            return;
        }
        try {
            const orderMainList = await ctx.service.shell.order.getAllOrderMainByUserId(ctx.query);
            const orderSubList = [];
            for (let orderMain of orderMainList) {
                const orderSub = await ctx.service.shell.order.getOrderSubByOrderId(orderMain.Id);
                if (!orderSub) {
                    ctx.body = {
                        code: 444,
                        success: false,
                        message: '系统错误，请重试'
                    };
                    return;
                }
                orderSubList.push(orderSub)
            }
            ctx.body = {
                code: 200,
                success: true,
                message: 'get all sub order successfully',
                data: orderSubList
            };
            return;
        } catch (error) {
            console.log(error)
            ctx.logger.error(error, '订单取消失败')
            ctx.body = this.reportbody('系统繁忙，请重试')
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

    /**
     * 订单支付成功
     */
    async success () {
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
            const result = await ctx.service.shell.order.success(orderEntity.Id);
            ctx.body = {
                success: true,
                code: 200,
                message: `order pay successfully`,
                data: result,
            }
        } catch (error) {
            console.error(error, 'controller.shell.controller.success错误，调用service.shell.order.success错误')
            ctx.logger.error(error)
            ctx.body = {
                success: false,
                code: 444,
                message: `${error}`,
            }
        }
    }

    /**
     * 核销订单
     * 根据OrderSubId进行核销
     * 核销完后需要判断orderMain是否还有剩余的orderSub，没有则需要更新sorderMain的状态
     */
    async writeOff() {
        const ctx = this.ctx;
        const { OrderSubId, cnt } = ctx.request.body;

        try {
            await ctx.service.shell.order.orderSubWriteOff(OrderSubId, cnt);
        } catch (error) {
            console.error(error, 'controller.shell.controller.writeOff错误，调用service.shell.order.writeOff错误')
            ctx.logger.error(error)
            ctx.body = {
                success: false,
                code: 444,
                message: `${error}`,
            }
            return;
        }
        try {
            const orderMainEntity = await ctx.service.shell.order.getParentIdByOrderSubId(OrderSubId);
            const orderSub = await ctx.service.shell.order.getOrderSubByOrderId(orderMainEntity[0].Id);
            // 是否找不到未使用的子订单则修改主订单的Steta
            if (!orderSub.find(v => v.State === 0)) {
                await ctx.service.shell.order.orderMainWriteOff(orderMainEntity[0].Id);
            }
        } catch (error) {
            console.error(error, 'controller.shell.controller.writeOff错误，检查主订单错误')
            ctx.logger.error(error)
            ctx.body = {
                success: false,
                code: 444,
                message: `${error}`,
            }
            return;
        }
        ctx.body = {
            success: true,
            code: 200,
            message: `核销成功`,
        }
    }

}

module.exports = Order;