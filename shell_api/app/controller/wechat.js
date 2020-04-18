'use strict';

const request = require('request');
const urlencode = require('urlencode');
const Controller = require('egg').Controller;
const uuid = require('uuid')
const WXBizDataCrypt = require('../extend/WXBizDataCrypt');
const sha1 = require("sha1");  


class WechatController extends Controller {

    /**
     * 不知道为啥返回48001
     */
    async CreateUnionId () {
        const { ctx } = this
        try {
            const appid = 'wx1fe7f046ead630b6'
            const access_token = await this.getAccessToken()
            const url = `https://api.weixin.qq.com/cgi-bin/open/create?access_token=${access_token}`
            // 不能在data传access_token!
            // console.log(access_token)
            const params = {}
            params.method = 'POST'
            params.dataType = 'json'
            params.data = JSON.stringify({ appid })
            params.headers = 'Content-Type:application/json'
            const result = await ctx.curl(url, params)
            return result
        } catch (error) {
            console.log(error)
        }
    }

    async BindUnionId () {
        const { ctx } = this
        try {
            const appid = 'wx1fe7f046ead630b6'
            const open_appid = 'wx98366ad8b43948fe'
            const access_token = await this.getAccessToken()
            const url = `https://api.weixin.qq.com/cgi-bin/open/bind?access_token=${access_token}`
            // 不能在data传access_token!
            const params = {}
            params.method = 'POST'
            params.dataType = 'json'
            params.data = JSON.stringify({ appid, open_appid })
            params.headers = 'Content-Type:application/json'
            const result = await ctx.curl(url, params)
            ctx.body = result
        } catch (error) {
            console.log(error)
        }
    }

    async CheckUnionId () {
        const { ctx } = this
        try {
            const appid = 'wx1fe7f046ead630b6'
            const access_token = await this.getAccessToken()
            const url = `https://api.weixin.qq.com/cgi-bin/open/get?access_token=${access_token}`
            // 不能在data传access_token!
            const params = {}
            params.method = 'POST'
            params.dataType = 'json'
            params.data = JSON.stringify({ appid, open_appid })
            params.headers = 'Content-Type:application/json'
            const result = await ctx.curl(url, params)
            ctx.body = result
        } catch (error) {
            console.log(error)
        }
    }

    /**
     * 解密数据
     */
    async cryptdata() {
        let { encryptedData, iv, js_code, rawData, signature, saveMobile } = this.ctx.request.body;
        const appid = 'wx1fe7f046ead630b6'
        const secret = '696eafc0412f275508515eb6d51d0b65'
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

            if(saveMobile) {
                const { countryCode, purePhoneNumber} = data;
                const { openid } = result.data;
                try{
                    await this.ctx.service.memberExpand.updateMobileByOpenid(openid, purePhoneNumber, countryCode);
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

    async saveFormId(){
        let {  openid, formId, expire } = this.ctx.request.body;
        if(!openid || !formId || !expire ) {
            this.ctx.body = {
                success: false,
                message: '参数有误'
            }
        }
        let  newEntity = {
            openid,
            formId: (formId && formId.indexOf('the formId is a mock') > -1) ? 'dev mock data' : formId,
            expire: parseInt(expire, 10)
        }
        try {
           
            newEntity.Id = uuid.v4();
            newEntity.Valid = 1;
            newEntity.CreateTime = Date.now();
            newEntity.CreatePerson = 'device';
            newEntity.UpdatePerson = 'device';
            newEntity.UpdateTime = Date.now();
            newEntity = this.ctx.validateAndFormat(newEntity, 'wechat_form_id');
        } catch (ex) {
            this.ctx.logger.error('wechat_form_id.log调用异常/validateAndFormat', ex);
            this.ctx.body = {
                success: false,
                code: 413,
                ex,
                msg: ex.message,
            }
            return;
        }

        try {
            const entity = await this.ctx.service.wechatFormId.create(newEntity);
            this.ctx.body = {
                success: true,
                code: 200,
                msg: '成功',
                data: entity,
            }
        } catch (ex) {
            this.ctx.logger.error('wechatFormId.saveFormId调用异常', ex);
            this.ctx.body = {
                success: false,
                message: ex,
                code: 500,
                data: newEntity
            }
        }

    }

    async getOpenId(){
        const { js_code, SysUserId , openid } = this.ctx.request.body;
        const oldOpenid = openid
        const appid =  'wx6e1b5f4bc706e3cd'
        const secret = 'ff0dbbcd595f2c39550434380bbc8954'
        const url =`https://api.weixin.qq.com/sns/jscode2session?appid=${appid}&secret=${secret}&js_code=${js_code}&grant_type=authorization_code`;
        try {
            const result = await this.ctx.curl(url, { dataType: 'json' })
            const { session_key, openid } = result.data;
          
            if(!session_key) {
                this.ctx.body = {
                    success: false,
                    message: '获取session_key失败',
                    data: null
                }
                return;
            }
            if (!oldOpenid || oldOpenid != openid ) {
                const data = await this.ctx.service.sysUser.updateById({SysUserId,openid})
                this.ctx.body = {
                    code: 200,
                    success: true,
                    message: '成功',
                    data: data
            }
            }
            this.ctx.body = {
                code: 200,
                success: true,
                message: '用户openid已存在',
                data: {
                    openid,
                    SysUserId
                }
        }
            
        } catch(ex) {
            this.logger.error(ex);
            this.ctx.body = {
                success: false,
                ex,
                code: 500,
                message: '保存openid失败',
                data: null
            }
        }
    }
    
    /**
     * 获取接口调用凭证(fusion客户端凭证)
     */
    async getAccessToken() {
        const { ctx } = this
        const cTime = new Date()
        const app_access_token = await ctx.service.sysCacheExpand.getCacheByKeyname('access_token')
        if (app_access_token.length > 0 && app_access_token[0].Value) return app_access_token[0].Value

        try {
            const type = 'client_credential' // 获取access_token填写client_credential
            const appid = 'wx1fe7f046ead630b6' // 第三方用户唯一凭证
            const secret = '696eafc0412f275508515eb6d51d0b65' // 第三方用户唯一凭证密钥，即appsecret
            const url_get_access_token = `https://api.weixin.qq.com/cgi-bin/token?grant_type=${type}&appid=${appid}&secret=${secret}`
            const result = await ctx.curl(url_get_access_token, { dataType: 'json' })
            const cache_result = await ctx.service.sysCache.create({
                Id: uuid.v4(),
                KeyName: 'access_token',
                Value: result.data.access_token,
                CreateTime: cTime,
                CreatePerson: 'service',
                Remark: `耗时:${new Date() - cTime}ms`
            })
            // console.log('**********************')
            // console.log(cache_result)
            // console.log('**********************')
            return result.data.access_token
        } catch (error) {
            return false
        }
    }

    /**
     * 业务域名设置--校验文件检查失败自查指引
     * https://developers.weixin.qq.com/community/develop/doc/00084a350b426099ab46e0e1a50004?%2Fblogdetail%3Faction=get_post_info
    */
    async hualishuoDomainCheck() {
        this.ctx.body = '30ec94bf72346c9ced787be2896b21c4'
    }
}

module.exports = WechatController;
