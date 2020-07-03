'use strict';

const Controller = require('egg').Controller;
const uuid = require('uuid');
const moment = require('moment')
const sha1 = require("sha1");  
const WXBizDataCrypt = require('../../extend/WXBizDataCrypt')

class Member extends Controller {
   
    /**
     * 微信登录接口
     */
    async wechatLogin () {
        const { ctx } = this
        const { LoginCode } = ctx.request.body
        const appid = 'wx2e2fefd27c5d13c6'
        const secret = '86edb2452f2bf1db6edad3abe33db081'
        
        const url = {}
        const result = {
            code: 200,
            success: true
        }
        const tourist = {
            Sex: "0",
            Level: 0,
            Source: 1,
            Name: "游客",
            CreateTime: new Date(),
            CreatePerson: '小程序访客'
        }
        
        url.appid = `appid=${appid}`
        url.secret = `secret=${secret}`
        url.js_code = `js_code=${LoginCode}`
        url.base = `https://api.weixin.qq.com/sns/jscode2session`
        const wechatApi = `${url.base}?${url.appid}&${url.secret}&${url.js_code}&grant_type=authorization_code`
        try {
            const wechatResult = await ctx.curl(wechatApi , { dataType: 'json' })
            const { openid, session_key, unionid, errmsg } = wechatResult.data
            if (!openid) throw Error(errmsg || "cant't get openid")
            const user = await ctx.service.shell.member.getByopenid(openid)

            if (user && user.length) {
                const [ userinfo ] = user
                result.message = '登录成功'
                result.data = { userinfo, authtoken: session_key }
                ctx.body = result
                return 
            } else { // 创建新用户
                tourist.Id = uuid.v1()
                tourist.NickName = '游客'
                tourist.openid = openid
                
              const res = await ctx.service.shell.member.create(tourist)

                result.message = "登录成功"
                result.data = { userinfo: res, authtoken: session_key }
                ctx.body = result
            }

        } catch (error) {
            console.error(error)
            ctx.logger.error(error)

            result.code = 500
            result.success = false
            result.message = error.message || error.ReferenceError || error

            ctx.body = result
            return
        }
    }

    /**
     * 解密数据
     */
    async cryptdata() {
        let { encryptedData, iv, js_code, rawData, signature, saveMobile } = this.ctx.request.body;
        const appid = 'wx2e2fefd27c5d13c6'
        const secret = '86edb2452f2bf1db6edad3abe33db081'
        const url =`https://api.weixin.qq.com/sns/jscode2session?appid=${appid}&secret=${secret}&js_code=${js_code}&grant_type=authorization_code`;
        try {
            const result = await this.ctx.curl(url, { dataType: 'json' })
            const { session_key } = result.data;
          
            if(!session_key) {
                this.ctx.body = {
                    success: false,
                    message: '获取session_key失败',
                    data: null
                }
                return;
            }

            // 这段不要也可以解密码吧？是为了安全
            const signature2 = sha1(rawData + session_key);
            if (signature !== signature2) {
                this.ctx.body = {
                    success: false,
                    signature,
                    signature2,
                    message: '数据签名校验不一致',
                    data: null
                }
                return;
            }

            const pc = new WXBizDataCrypt(appid, session_key)  
            const data = pc.decryptData(encryptedData, iv);
            console.log(data)
            if(saveMobile) {
                const { countryCode, purePhoneNumber} = data;
                const { openid } = result.data;
                try{
                    await this.ctx.service.shell.member.updateMobileByOpenid(openid, purePhoneNumber, countryCode);
                    await this.ctx.service.shell.member.updataUserInfoByOpenid(openid, rawData)
                } catch(ex) {
                    this.logger.error(ex, '保存手机号异常');
                }
            }
            this.ctx.body = {
                code: 200,
                success: true,
                message: '成功',
                data: data
            }
        } catch(ex) {
            this.logger.error(ex);
            this.ctx.body = {
                success: false,
                ex,
                code: 500,
                message: '数据签名校验失败',
                data: null
            }
        }

    }
    async index(){
        console.log(this.ctx.model)
        const users = await this.ctx.model.User.findAll();
        this.ctx.body = users;
    }
    

}

module.exports = Member;
