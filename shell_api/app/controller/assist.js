'use strict';

const Controller = require('egg').Controller;
const moment = require("moment");
const uuid = require('uuid');

class Assist extends Controller {
    async getLabelFilter( ) {
        const { ctx } = this
        const { condition } = ctx.params
        try {
            const datalist = await ctx.service.label.getFilter(condition) 
            if (!(datalist instanceof Array)) throw new Error('服务异常, 返回值错误')
            ctx.body = {
                success: true,
                code: 200,
                data: {
                    datalist
                }
            }     
        } catch (error) {
            ctx.logger.error(error)
            ctx.body = {
                success: false,
                code: 500,
                messsage: error
            }
        }
    }

    async courseQueryByLabel() {
        const { ctx } = this
        const { ParentIds, StoreIds } = ctx.params
        try {
            const StoreList = JSON.parse(StoreIds)
            const ParentList = JSON.parse(ParentIds)
            const datalist = await ctx.service.label.extendCourse(StoreList, ParentList)
            if (!(datalist instanceof Array)) throw new Error('服务异常, 返回值错误')
            ctx.body = {
                success: true,
                code: 200,
                data: {
                    datalist
                }
            }     
        } catch (error) {
            ctx.logger.error(error)
            ctx.body = {
                success: false,
                code: 500,
                messsage: error
            }
        }
    }
}

module.exports = Assist;