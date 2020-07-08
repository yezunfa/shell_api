/*
 * @Author: yezunfa
 * @Date: 2020-07-08 15:51:57
 * @LastEditTime: 2020-07-08 16:38:46
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

    /**
     *  todo :订单详情
     */
    async getByUserId(){
        const { ctx } = this
        const { userid } = ctx.query
        let  result = {}
        
    }
}

module.exports = Order;