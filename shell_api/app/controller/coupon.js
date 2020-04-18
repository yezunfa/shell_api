'use strict';
const Controller = require('egg').Controller;
const uuid = require('uuid')

class Coupon extends Controller {
    /**
     * 获取某教练某日课程
     */
    async getEnableCoupon() { // todo 优惠卷有效期、关联活动、公司
        const ctx = this.ctx
        const { userid: UserId, coursescheduleid: CourseScheduleId } = ctx.query
        try {
            
            const datalist = await ctx.service.coupon.enablecoupon({ UserId, CourseScheduleId })
            
            ctx.body = {
                success: true,
                code: 200,
                data: {
                    datalist
                }
            }
        } catch (error) {
            console.error(error)
            ctx.logger.error(error)
            ctx.body = {
                success: false,
                code: 454,
                message: `${error}`,
            }
        }
    }
}

module.exports = Coupon;
