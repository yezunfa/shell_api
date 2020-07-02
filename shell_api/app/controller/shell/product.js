/*
 * @Author: yezunfa
 * @Date: 2020-06-30 01:28:23
 * @LastEditTime: 2020-06-30 01:28:24
 * @Description: Do not edit
 */ 
'use strict';

const Controller = require('egg').Controller;
const uuid = require('uuid');
const moment = require('moment')

class Product extends Controller {
   
    async index(){
        console.log(this.ctx.model)
        const users = await this.ctx.model.User.findAll();
        this.ctx.body = users;
    }

    // 获取所有商品类型
    async getAllTypes(){
        const ctx = this.ctx
        try {
            const entitylist = await ctx.service.shell.product.getAllProductTypes()
            
            ctx.body = {
                success: true,
                code: 200,
                message: `get all types`,
                data: entitylist
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
    // 获取所有商品信息
    async getAllProduct(){
        const ctx = this.ctx
        try {
            const entitylist = await ctx.service.shell.product.getAllProductInfo()
            
            ctx.body = {
                success: true,
                code: 200,
                message: `get all `,
                data: entitylist
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

    // 商品详情
    async detail() {
        const ctx = this.ctx;
        const { Id } = ctx.query;
        try {
            const entitylist = await ctx.service.shell.product.getById(Id);
            ctx.body = {
                success: true,
                code: 200,
                message: `get detail`,
                data: entitylist
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
    

}

module.exports = Product;
