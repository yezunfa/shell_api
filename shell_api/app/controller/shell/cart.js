'use strict';

const Controller = require('egg').Controller;
const uuid = require('uuid');
const moment = require('moment')

class Cart extends Controller {

    /**
     * 添加一个产品到购物车中
     * 先判断是否有Valid=1的购物车，无则新建ParentId的购物车
     */
    async create() {
        const ctx = this.ctx;
        const { UserId, ProductId, cnt } = ctx.request.body;

        let entity = {
            Id: uuid.v4(),
            UserId,
            ParentId: uuid.v4(),
            ProductId,
            Amount: cnt,
            CreateTime: new Date(),
            CreatePerson: 'system',
        }

        const validCart = await ctx.service.shell.cart.getValidCart(UserId);
        // 已经合法的购物车已经存在，则使用旧ParentId新增一条记录
        if (validCart) {
            console.log('validCart', validCart);
            entity = {
                ...entity,
                ParentId: validCart.ParentId,
            }
        }
        try {
            await ctx.service.shell.cart.create({ ...entity, ParentId: validCart.ParentId });
            ctx.body = {
                success: true,
                code: 200,
                message: `success create cart`,
                data: { ...entity, ParentId: validCart.ParentId }
            }
            return;       
        } catch (error) {
            console.error(error)
            ctx.logger.error(error)
            ctx.body = {
                success: false,
                code: 444,
                message: `cart.create错误，捕捉cart.create的错误`,
                data: { ...entity, ParentId: validCart.ParentId }
            }
            return;
        }
    }
}

module.exports = Cart;