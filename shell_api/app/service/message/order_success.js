
'use strict';
const uuid = require('uuid');
const moment = require('moment');
/**
 * StoreService
 * useage: ctx.service.message.birthday
 */

const Service = require('egg').Service;


class IndexService extends Service {
    
   
    /**
     * 服务过期提醒模板
     * notes: requestData不能传access_token !!!
     * 模板id: "Vau0r_Dm4PheM0Kt34BnDlSDfKiR9zvuZyX8gviK2fI"
     * 模板配置页面: https://mp.weixin.qq.com/wxopen/tmplmsg?action=self_list&token=1722594041&lang=zh_CN
     */
    async sendSuccessMessage ({ scheduleInfo,openid }) {
        const { ctx } = this
        const response = {}
        response.code = 500
        response.success = true

        const { CoachName,  StoreId, Name:CourseName,EnName, StartTime,}= scheduleInfo
        // 获取课程信息，教练名称
        const StoreInfo = await ctx.service.store.getById(StoreId)
        const { Name:StoreName } = StoreInfo
        // name.DATA规定：10个以内纯汉字或20个以内纯字母或符号，且不能含有数字
        let COURSENAME = CourseName
        if (COURSENAME.length > 10 && EnName) {
            COURSENAME = EnName
        }else {
            var regNumber = /\d+/; //验证0-9的任意数字最少出现1次。
            if (regNumber.test(COURSENAME))  COURSENAME = '点击查看课程详情'
        }
        try {
            // 小程序token
            const token = await this.getAccessToken()
            // 微信官方api
            const url = `https://api.weixin.qq.com/cgi-bin/message/subscribe/send?access_token=${token}`

            const requestData = { touser: openid } 
            requestData.page = "pages/home/index" // 小程序跳转页面
            // requestData.emphasis_keyword = "keyword1.DATA" // 需要放大的关键字
            requestData.template_id = "dpqtQ2uL03FU1NbZciNFJrkX-eR69LrKObtDBp_l_HI" 
            
            // 消息内容: 根据模板定义
            requestData.data = {
                name2: {
                    value: CoachName
                },
                name1: {
                    value: COURSENAME
                },
                time3: {
                    value: moment(StartTime).format('YYYY-MM-DD HH:mm ')
                },
                thing4: {
                    value: StoreName
                },
                thing5: {
                    value: '请准时到店上课哦～' // 课程类型
                }
            }

            const params = {}
            params.method = 'POST'
            params.data = JSON.stringify(requestData) // 报文需要转为json字符串

            // 报文为buffer文件 转换为JSON对象
            const { data: buffer } = await ctx.curl(url, params)
            const reslut = JSON.parse(buffer.toString())

            response.code = reslut.errcode ? reslut.errcode : 200
            if (reslut.errmsg !== 'ok') throw new Error(reslut.errmsg)
            response.message = "发送成功"

            return response
        } catch (error) {
            console.error(error)
            ctx.logger.error(error)

            response.success = false
            response.message = error.message || "发送失败"
            return response
        }
       
    }

    async sendReservationMessage({reservationInfo, scheduleInfo, openid}){
        const { ctx } = this
        const response = {}
        response.code = 500
        response.success = true

        const {  Name: CourseName, EnName, StartTime,}= scheduleInfo
        const { UserId, Mobile, StoreName } = reservationInfo

        const memberInfo = await ctx.service.member.getById(UserId)
        const { Name:MemberName } = memberInfo

        // name.DATA规定：10个以内纯汉字或20个以内纯字母或符号，且不能含有数字
        let COURSENAME = CourseName
        if (COURSENAME.length > 10 && EnName) {
            COURSENAME = EnName
        }else {
            var regNumber = /\d+/; //验证0-9的任意数字最少出现1次。
            if (regNumber.test(COURSENAME))  COURSENAME = '点击查看课程详情'
        }
        try {
            // 小程序token
            const token = await this.getCoachAccessToken()
            // 微信官方api
            const url = `https://api.weixin.qq.com/cgi-bin/message/subscribe/send?access_token=${token}`

            const requestData = { touser: openid } 
            requestData.page = "pages/login/index" // 小程序跳转页面
            // requestData.emphasis_keyword = "keyword1.DATA" // 需要放大的关键字
            requestData.template_id = "v8u9A4iZFo3lgLyqirW-ekE_Fdki27WdqI_qxhEzZAc" 
            
            // 消息内容: 根据模板定义
            requestData.data = {
                date3: {
                    value: moment(StartTime).format('YYYY-MM-DD HH:mm ')
                },
                thing2: {
                    value: StoreName
                },
                name1: {
                    value: MemberName
                },
                phone_number4: {
                    value: Mobile
                },
                thing5: {
                    value: COURSENAME
                }
            }

            const params = {}
            params.method = 'POST'
            params.data = JSON.stringify(requestData) // 报文需要转为json字符串

            // 报文为buffer文件 转换为JSON对象
            const { data: buffer } = await ctx.curl(url, params)
            const reslut = JSON.parse(buffer.toString())

            response.code = reslut.errcode ? reslut.errcode : 200
            if (reslut.errmsg !== 'ok') throw new Error(reslut.errmsg)
            response.message = "发送成功"

            return response
        } catch (error) {
            console.error(error)
            ctx.logger.error(error)

            response.success = false
            response.message = error.message || "发送失败"
            return response
        }
    }
    /**
     * 获取接口调用凭证(fusion客户端凭证)
     */
    async getAccessToken() {
        const { ctx } = this

        const CreateTime = new Date()
        
        try {
            const token = await ctx.service.sysCacheExpand.getCacheByKeyname('access_token')
            if (token && token.Value) return token.Value
        } catch (error) {
            throw error
        }
        
        try {
            // 获取access_token: client_credential
            const type = 'grant_type=client_credential'
            // 第三方用户唯一凭证
            const appid = 'appid=wx1fe7f046ead630b6'
            // 第三方用户唯一凭证密钥，即appsecret
            const secret = 'secret=696eafc0412f275508515eb6d51d0b65'
            // 微信官方api
            const url = `https://api.weixin.qq.com/cgi-bin/token`
 
            const result = await ctx.curl(`${url}?${type}&${appid}&${secret}`, { dataType: 'json' })
            
            const { access_token: Value } = result.data

            const entity = { CreateTime, Value }
            entity.Id = uuid.v4()
            entity.CreatePerson = 'service'
            entity.KeyName = 'access_token'
            entity.Remark = `耗时:${new Date() - CreateTime}ms`
            
            await ctx.service.sysCache.create(entity)

            return Value
        } catch (error) {
            throw error
        }
    }
    
    /**
     * 获取接口调用凭证(fusion教练端凭证)
     */
    async getCoachAccessToken() {
        const { ctx } = this

        const CreateTime = new Date()
        
        try {
            const token = await ctx.service.sysCacheExpand.getCacheByKeyname('access_token_company')
            console.log(token)
            if (token && token.Value) return token.Value
        } catch (error) {
            throw error
        }
        
        try {
            // 获取access_token: client_credential
            const type = 'grant_type=client_credential'
            // 第三方用户唯一凭证
            const appid = 'appid=wx6e1b5f4bc706e3cd'
            // 第三方用户唯一凭证密钥，即appsecret
            const secret = 'secret=ff0dbbcd595f2c39550434380bbc8954'
            // 微信官方api
            const url = `https://api.weixin.qq.com/cgi-bin/token`
 
            const result = await ctx.curl(`${url}?${type}&${appid}&${secret}`, { dataType: 'json' })

            console.log(result)

            const { access_token: Value } = result.data

            const entity = { CreateTime, Value }
            entity.Id = uuid.v4()
            entity.CreatePerson = 'service'
            entity.KeyName = 'access_token_company'
            entity.Remark = `耗时:${new Date() - CreateTime}ms`
            
            await ctx.service.sysCache.create(entity)

            return Value
        } catch (error) {
            throw error
        }
    }


}
module.exports = IndexService;
 