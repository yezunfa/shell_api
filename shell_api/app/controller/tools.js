'use strict';

const Controller = require('egg').Controller;
const moment = require("moment");
const utils = require('../utils/index');
const uuid = require('uuid');
const qr = require('qr-image');

class Tools extends Controller {
    /**
     * 生成二维码
     */
    async qrcode() {
        const { ctx } = this;
        const { text, size, margin } = ctx.query;
        try {
            // 大小默认5，二维码周围间距默认1
            let img = qr.image(text || '', {
                type: 'png',
                size: parseInt(size) || 5,
                margin: parseInt(margin) || 1
            });
            ctx.status = 200;
            ctx.type = 'image/png';
            ctx.body = img;
        } catch (e) {
            ctx.status = 414;
            ctx.set('Content-Type', 'text/html');
            ctx.body = {
                success: false,
                code: 414,
                message: `${e}`
            }
        }
    }

    /**
     * 获取接口调用凭证(fusion客户端凭证)
     */
    async getAccessToken( isNew ) {
        const { ctx } = this
        const cTime = new Date()
        const app_access_token = await ctx.service.sysCacheExpand.getCacheByKeyname('access_token_shell_qrcode')
        ctx.logger.info(`是否重新生成:isNew:${isNew}`, app_access_token.length > 0 && app_access_token[0].Value && !isNew)
        if (app_access_token.length > 0 && app_access_token[0].Value && !isNew ) return app_access_token[0].Value


        try {
            const type = 'client_credential' // 获取access_token填写client_credential
            const appid = 'wx2e2fefd27c5d13c6' // 第三方用户唯一凭证 shell
            const secret = '86edb2452f2bf1db6edad3abe33db081' // 第三方用户唯一凭证密钥，即appsecret
            const url_get_access_token = `https://api.weixin.qq.com/cgi-bin/token?grant_type=${type}&appid=${appid}&secret=${secret}`
            const result = await ctx.curl(url_get_access_token, { dataType: 'json' })
            const cache_result = await ctx.service.sysCache.create({
                Id: uuid.v4(),
                KeyName: 'access_token_shell_qrcode',
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
            ctx.logger.error('微信getAccessToken异常', error)
            return false
        }
    }

    /**
     * 生成小程序码
     */
    async wxqrcode() {
        const { ctx } = this
        const { pages, scene } = ctx.query
        try {
            
            const getData  = async (isNew) => {
                let  access_token = await this.getAccessToken(isNew)
                // getWXACodeUnlimit 场景b
                let url_post_wxqrcode = `https://api.weixin.qq.com/wxa/getwxacodeunlimit?access_token=${access_token}`
                let data = JSON.stringify({  // 不能在data传access_token: access_token,!
                    scene: scene, // 只能传32位的可见字符串(数字、英文以及!#$&'()*+,/:;=?@-._~)
                    page: 'pages/home/home',  // 跳转页面是否要直接到订单核销页面？
                })
                let result = await ctx.curl(url_post_wxqrcode, {
                    headers: 'Content-Type:application/json',
                    contentType: "image/jpeg",
                    method: 'POST',
                    data
                })

                // ctx.logger.info(`wxqrcode:${typeof result.data}`, result && result.data ?  result.data.toString() : typeof result.data)
                try{
                    if(result && result.data  && parseInt(JSON.parse(result.data.toString()).errcode) === 40001) {
                        ctx.logger.info('wxqrcode:重新生成getAccessToken');
                        result = await getData(true)
                    }
                } catch(ex) {
                    // ctx.logger.error('getAccessToken(true):', ex)
                }
                return result;

            }
    
            // console.log(res.data.toString())

            const res = await getData();
            ctx.body = {
                code: 200,
                success: true,
                data: `data:image/jpg;base64,${res.data.toString('base64')}`
            }

        } catch (error) {
            ctx.logger.error('二维码加载失败', error);
            ctx.body = {
                code: 500,
                success: false,
                message: `二维码加载失败`,
                data: `${error}`
            }
        }
    }

    async DestroyMember () {
        const { ctx } = this
        const { password, unionid } = ctx.params
        try {
            if (password !== 'WarnYouWillDestroyMemberBy') throw new Error('⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️')
            const dirty = await ctx.service.member.getByCondition({unionid})
            if (!dirty || !dirty.Id) throw new Error(`unionid: [${unionid}] is not found`)
            const data = await ctx.service.migrate.destorymember(dirty.Id)
            
            ctx.body = {
                success: true,
                message: '成功删除',
                code: 200,
                data
            }
        } catch (error) {
            console.error(error)
            ctx.body = {
                success: false,
                message: error.message,
                code: 500
            }
        }
    }
}

module.exports = Tools;