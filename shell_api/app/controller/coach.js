'use strict';

const Controller = require('egg').Controller;
const uuid = require('uuid')

class Coach extends Controller {
    /**
     * 获取某教练某日课程
     * ex:/coach/schedule?coachid=905c07c0-5763-11e9-9758-f9ac7410d8f0&date=2019-04-13&type=1
     */
    async getCoachSchedule() {
        const ctx = this.ctx
        const {
            coachid,
            date,
            type
        } = ctx.query
        if (!coachid || typeof coachid !== 'string') {
            ctx.body = {
                success: false,
                code: 600,
                message: `登录失效`,
                data: null
            }
            return
        }
        try {
            const entitylist = await ctx.service.coach.getCoachSchedule({
                coachid,
                date,
                type
            })
            ctx.body = {
                success: true,
                code: 200,
                message: `get 3 class`,
                data: {
                    datalist: entitylist
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
     * 获取教练某日被预约的私教课
     */
    async getPrivateRervation() {
        const ctx = this.ctx
        const {
            coachid,
            date
        } = ctx.query
        try {
            const entitylist = await ctx.service.coach.getPrivateRervation({
                coachid,
                date
            })
            ctx.body = {
                success: true,
                code: 200,
                message: `get 3 class`,
                data: {
                    datalist: entitylist
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
     * 员工登录接口
     */
    async login() {
        const ctx = this.ctx
        const {
            loginname, // todo post && mobile && 密码校验
            password
        } = ctx.request.body
        if(!loginname || !password) {
            ctx.body = {
                success: false,
                code: 200,
                message: `用户名或登录名无效`
            }
            return;
        }
        try {
            const entity = await ctx.service.coach.validate(loginname, password);
            if (entity && entity[0]) {
                delete entity[0].Password;
                ctx.body = {
                    success: true,
                    code: 200,
                    message: `登录成功`,
                    data: {
                        userinfo: {
                           ...entity[0]
                        }
                    }
                }
            } else if (entity.length !== 1) {
                ctx.body = {
                    success: false,
                    code: 600,
                    message: `账号错误`,
                }
            } else {
                ctx.body = {
                    success: false,
                    code: 600,
                    message: `密码错误`,
                }
            }
        } catch (error) {
            console.error(error)
            this.ctx.logger.error('登录异常', error)
            ctx.body = {
                success: false,
                code: 445,
                message: `登录异常`,
            }
            return;
        }
    }

    /**
     * 
     */
    async getCourseType() {
        const ctx = this.ctx
        const { type } = ctx.query
        try {
            const entitylist = await ctx.service.coach.getCourseType(type)
            ctx.body = {
                success: false,
                code: 200,
                message: `获取${entitylist.length}条枚举`,
                data: {
                    datalist: entitylist
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
     * 
     */
    async getCoachClient() {
        const ctx = this.ctx
        const {
            coachid, orderby
        } = ctx.query
        try {
            const entitylist = await ctx.service.coach.getCoachClient(coachid,  orderby)
            ctx.body = {
                success: false,
                code: 200,
                message: `获取${entitylist.length}条枚举`,
                data: {
                    datalist: entitylist
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
     * 
     */
    async getCoachStatistics() {
        const ctx = this.ctx
        const {
            coachid,
            date
        } = ctx.query
        try {
            const entitylist = await ctx.service.coach.getCoachStatistics({
                coachid,
                date
            })
            ctx.body = {
                success: false,
                code: 200,
                message: ``,
                data: {
                    MemberNum: entitylist[0].num,
                    Duration: entitylist[1].num,
                    CourseNum: entitylist[2].num,
                    TotalCourseNum: entitylist[3].num,
                    TotalDuration: entitylist[4].num,
                    TotalMember: entitylist[5].num,
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
     * 设置、修改学员备注信息
     */
    async setMemberRemark() {
        const ctx = this.ctx
        const {
            trackingid,
            remark
        } = ctx.request.body
        try {
            const result = await ctx.service.memberTracking.edit({
                Id: trackingid,
                Remark: remark
            })
            ctx.body = {
                success: false,
                code: 200,
                message: ``
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
     * 
     */
    async getCoachMemo() {
        const ctx = this.ctx
        const {
            coachid,
            month
        } = ctx.query
        try {
            const entitylist = await ctx.service.coach.getMemo(coachid)
            ctx.body = {
                success: false,
                code: 200,
                message: ``,
                data: {
                    datalist: entitylist
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
     * 邀请学员
     * todo 参数判断
     */
    async inviteMember() {
        const ctx = this.ctx
        const {
            coachid
        } = ctx.query
        const {
            userid,
            courseid
        } = ctx.request.body
        try {
            const result = await ctx.service.memberCoachInvite.create({
                Id: uuid.v4(),
                UserId: userid,
                SysUserId: coachid,
                CourseId: courseid || "58ffe190-5c34-11e9-abe7-51cae005fd30",
                State: 0,
                InviteDate: new Date(),
                CreateTime: new Date(),
                CreatePerson: coachid
            })
            ctx.body = {
                success: true,
                code: 200,
                message: `${result}`
            }
        } catch (error) {
            console.error(error)
            ctx.logger.error(error)
            ctx.body = {
                success: false,
                code: 444,
                message: `${error}`
            }
        }
    }
}

module.exports = Coach;
