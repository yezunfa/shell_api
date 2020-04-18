'use strict';

const Controller = require('egg').Controller;

class Home extends Controller {


    async index() {
        if(this.app.options.company && this.app.options.company === 'madingyu') {
            // await this.ctx.render('madingyu/index.xtpl', {});
            await this.ctx.render('code/home.xtpl', {  });
        } else {
            await this.ctx.render('home/index.xtpl', {});
        }
    }

    /**
     * 获取页面数据
     */
    async info() {
        const ctx = this.ctx
        if (!ctx.query.userid || typeof ctx.query.userid !== 'string') {
            ctx.body = {
                success: false,
                code: 600,
                message: `登录失效`,
                data: null
            }
            return
        }
        let userid = ctx.query.userid
        try {
            const entitylist = await ctx.service.home.getHomeInfo(userid)
            ctx.body = {
                success: true,
                code: 200,
                message: `get ${entitylist.length} pieces of data`,
                data: {
                    TotalTime: entitylist[0].entity,
                    WeekTime: entitylist[1].entity,
                    Invite: entitylist[2].entity,
                    Punch: entitylist[3].entity
                }
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
     * 获取用户预约课程
     */
    async getCourseList() {
        const ctx = this.ctx
        if (!ctx.query.userid || typeof ctx.query.userid !== 'string') {
            ctx.body = {
                success: false,
                code: 600,
                message: `登录失效`,
                data: null
            }
            return
        }
        const { userid, date } = ctx.query
        try {
            const entity = await ctx.service.home.getCourseList({ userid, date })
            ctx.body = {
                success: true,
                code: 200,
                message: `get ${entity.length} pieces of data`,
                data: {
                    total: entity.length,
                    totalPage: 1, // 总页数
                    pageSize: null, // 分页标准
                    currentPage: 1, // 当前所在页数（从1开始）
                    datalist: entity
                }
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
     * 获取门店列表
     */
    async getStoreList() {
        const ctx = this.ctx
        if (!ctx.query.userid || typeof ctx.query.userid !== 'string') {
            ctx.body = {
                success: false,
                code: 600,
                message: `登录失效`,
                data: null
            }
            return
        }
        const { userid } = ctx.query
        try {
            const entity = await ctx.service.home.getStoreList({ userid })
            ctx.body = {
                success: true,
                code: 200,
                message: `get ${entity.length} pieces of data`,
                data: {
                    total: entity.length,
                    totalPage: 1, // 总页数
                    pageSize: null, // 分页标准
                    currentPage: 1, // 当前所在页数（从1开始）
                    datalist: entity
                }
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
     * 获取门店信息
     */
    async getStoreInfo() {
        const ctx = this.ctx
        let { storeid } = ctx.query
        try {
            const entity = await ctx.service.store.getById(storeid)
            ctx.body = {
                success: true,
                code: 200,
                message: `get ${entity.NickName} information`,
                data: entity
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

module.exports = Home;
