'use strict'

const Service = require('egg').Service
const uuid = require('uuid');

class UserService extends Service {

    async create(entity) {
        try {
            const result = await this.ctx.model.Member.create(entity);
            return result;
        } catch (err) {
            throw err;
        }
    }

    /**
     *  get a user by openid
     * @param {String} openid condition
     * @return {Object} entity a model Entity
     */
    async getByopenid(openid) {
        if(!openid || typeof openid !== 'string') {
            throw new Error('param_openid error');
        }
        const sql_string = `
            select member.*
            from member
            where openid = "${openid}" 
        `
        try {
            const result = await this.ctx.model.query(sql_string, {
                type: this.ctx.model.Sequelize.QueryTypes.SELECT
            })
            return result.dataValues || result;
        } catch (err) {
            throw err;
        }
    }
    /**
     * 更新用户手机号码
     * @param {String} openid 
     * @param {String} countryCode 
     * @param {String} purePhoneNumber 
     */
    async updateMobileByOpenid(openid, purePhoneNumber, countryCode) {
        const sql = 'update member set Mobile=:Mobile where openid=:openid'
        try {
            const result = await this.ctx.model.query(sql, {
                type: this.ctx.model.Sequelize.QueryTypes.Update,
                replacements: {
                    Mobile: purePhoneNumber,
                    openid: openid
                }
            })
            return result.dataValues || result;
        } catch (err) {
            throw err;
        }
    }
    /**
     * 更新用户信息
     * @param {String} openid 
     * @param {String} countryCode 
     * @param {String} purePhoneNumber 
     */
    async updataUserInfoByOpenid(openid, rawData) {
        const { nickName, gender, city, language, province, country, avatarUrl } = JSON.parse(rawData)
        const sql = `update member 
            set NickName='${nickName}',Name='${nickName}',WeChatName='${nickName}',
            Sex=${gender}, City='${city}',Province='${province}',Country ='${country}',
            Avatar='${avatarUrl}'
            where openid=:openid`
        try {
            const result = await this.ctx.model.query(sql, {
                type: this.ctx.model.Sequelize.QueryTypes.Update,
                replacements: {
                    openid: openid
                }
            })
            return result.dataValues || result;
        } catch (err) {
            console.log(err);
            throw err;
        }
    }
   
    
}

module.exports = UserService 