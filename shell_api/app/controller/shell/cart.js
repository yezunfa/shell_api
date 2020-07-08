/*
 * @Author: yezunfa
 * @Date: 2020-07-03 11:59:48
 * @LastEditTime: 2020-07-08 17:11:49
 * @Description: Do not edit
 */ 
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
        const { ProductId, Amount } = ctx.request.body;
        const { userid } = ctx.query;

        let entity = {
            Id: uuid.v4(),
            UserId: userid,
            // ParentId:uuid.v4(),
            ProductId,
            Amount: Amount,
            CreateTime: new Date(),
            CreatePerson: 'system',
        }

        let validCart = await ctx.service.shell.cart.getValidCart(userid);
        // 已经合法的购物车已经存在，则使用旧ParentId新增一条记录
        if (!validCart) {
            const NewEntity ={
                Id: uuid.v4(),
                UserId: userid,   
                CreateTime: new Date(),
                CreatePerson: 'system',
                ParentId: 'ParentId'
            }
            validCart = await ctx.service.shell.cart.create(NewEntity)
        }
        entity.ParentId = validCart.Id
        
        // 先判断购物车是否有相同的商品，如果有则修改商品数量
        try {
            const SameCart = await ctx.service.shell.cart.findSameCart({userid, ParentId:entity.ParentId, ProductId })
            if (SameCart && SameCart.length) {
                const { Amount:_old_AMOUNT } = SameCart[0];
                const UpdateEntity = {
                    ...SameCart[0], 
                    Amount:parseInt(_old_AMOUNT,10) + parseInt(Amount,10),
                    UpdatePerson: userid,
                    UpdateTime: new Date()
                }
                const entity = await ctx.service.shell.cart.edit(UpdateEntity);
                ctx.body = {
                    success: true,
                    code: 200,
                    message: `success create cart`,
                    data: entity
                }
                return;
            } 
        } catch (error) {
            console.error(error)
            ctx.logger.error(error)
            ctx.body = {
                success: false,
                code: 444,
                message: `cart.create错误，捕捉cart.create的错误`,
                data: entity
            }
            return;
        }
        // 没有相同的商品类型，新建一条数据
        try {
            await ctx.service.shell.cart.create(entity);
            ctx.body = {
                success: true,
                code: 200,
                message: `success create cart`,
                data: entity
            }       
        } catch (error) {
            console.error(error)
            ctx.logger.error(error)
            ctx.body = {
                success: false,
                code: 444,
                message: `cart.create错误，捕捉cart.create的错误`,
                data: entity
            }
        }
    }
    /**
     * 
     */
    async getByUserId(){
        const { ctx } = this
        const { userid } = ctx.query
        let  result = {}
        let cartLength = 0
        try {
            const ParentResult = await ctx.model.Cart.findOne({
                where: {
                    UserId: userid,
                    ParentId: 'ParentId'
                }
            })
            if (ParentResult && ParentResult.dataValues && ParentResult.dataValues.Id) {
                const { Id: ParentId } = ParentResult
                result = { ...ParentResult.dataValues }
                const productArray = await ctx.service.shell.cart.findAllByParentId({ ParentId })
                cartLength = productArray.length
                if (productArray && productArray.length) result = { ...result, productArray }
            
            } 
            ctx.body = {
                success: true,
                code: 200,
                total: cartLength,
                message: `success get ${cartLength } cart Info`,
                data: result
            } 
        } catch (error) {
            console.error(error)
            ctx.logger.error(error)
            ctx.body = {
                success: false,
                code: 444,
                message: `cart.getByUserId接口错误 ` 
            } 
        }
    }
}

module.exports = Cart;