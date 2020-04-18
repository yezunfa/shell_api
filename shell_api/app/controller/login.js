'use strict';

const uuid = require('uuid');
const Controller = require('egg').Controller;

const appid = 'wx1fe7f046ead630b6';
const secret = '696eafc0412f275508515eb6d51d0b65';


class Index extends Controller {
    /**
     * 微信小程序注册
     */
    async wechatlogon() {
        const { ctx } = this
        const { js_code, WechatName, Avatar, Sex, Country, Province, City } = ctx.request.body
        const Name = member.WechatName && member.WechatName.length <= 3 ? WechatName : null
        const NickName = WechatName
        const CreateTime = new Date()
        const CreatePerson = 'wechatlogon'
        const api = `https://api.weixin.qq.com/sns/jscode2session`
        const query = `appid=${appid}&secret=${secret}&js_code=${js_code}&grant_type=${'authorization_code'}`
        try {
            const response = await this.ctx.curl(`${api}?${query}`, { dataType: 'json' })
            if (!response) {
                ctx.body = {
                    success: false,
                    message: 'error on wechat api: https://api.weixin.qq.com/sns/jscode2session',
                    code: 500,
                }
                return
            }
            if (!response.data || !response.data.openid) {
                ctx.body = {
                    success: false,
                    message: response.message || response.errMsg || response,
                    code: 500,
                }
                return
            }
            const { openid, session_key, unionid } = response.data
            const userlist = await ctx.service.memberExpand.getByopenid(openid)
            if (userlist && userlist[0] && userlist[0].Id) {
                ctx.body = {
                    success: false,
                    message: '此账号已注册， 请直接登录',
                    code: 200,
                }
                return
            }
            const userinfo = {
                Id: uuid.v1(),
                Name,
                NickName,
                WechatName,
                Avatar,
                Sex,
                Country,
                Province,
                City,
                openid,
                unionid,
                CreateTime,
                CreatePerson
            }
            const result = await ctx.service.member.create(userinfo)
            ctx.body = {
                success: true,
                message: `建立账号:${member.WechatName}`,
                code: 200,
                data: {
                    userinfo
                }
            }
        } catch (error) {
            console.log(error)
            ctx.logger.error(error)
            ctx.body = {
                code: 505,
                success: false,
                message: `${error.ReferenceError || error}`,
                data: {
                    token: false
                }
            }
            return
        }
    }

    /**
     * 
     */
    async userlogin() {
        const { ctx } = this
        const { js_code } = ctx.request.body
        const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${appid}&secret=${secret}&js_code=${js_code}&grant_type=${'authorization_code'}`
        try {
            const response = await this.ctx.curl(url, {
                dataType: 'json'
            })
            if (!response) {
                ctx.body = {
                    success: false,
                    message: 'error on wechat api: https://api.weixin.qq.com/sns/jscode2session',
                    code: 500,
                }
                return
            }
            if (!response.data || !response.data.openid) {
                ctx.body = {
                    success: false,
                    message: response.message || response.errMsg || response,
                    code: 500,
                }
                return
            }
            const { openid } = response.data
            const user = await ctx.service.memberExpand.getByopenid(openid)
            if (user && user.length === 1 && user[0]) {
                ctx.body = {
                    success: true,
                    message: "登录成功",
                    code: 200,
                    data: user[0]
                }
            } else {
                ctx.body = {
                    success: false,
                    message: "需要授权",
                    code: 200
                }
            }
        } catch (error) {
            console.log(error)
            ctx.logger.error(error)
            ctx.body = {
                code: 505,
                success: false,
                message: `${error.ReferenceError || error}`,
            }
        }
    }
}

module.exports = Index;
