/*
 * @Author: yezunfa
 * @Date: 2020-07-09 11:44:38
 * @LastEditTime: 2021-01-17 18:48:14
 * @Description: Do not edit
 */
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
        console.log(rawData)
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

    async checkOpenid (openid) {
        const sql = `select * from member where member.openid = "${openid}"`
        try {
            const type = this.ctx.model.Sequelize.QueryTypes.SELECT
            
            const result = await this.ctx.model.query(sql, { type });

            return result[0] || result
        } catch (error) {
            throw error
        }
    }

    async deleteByopenid (openid, Id) {
        const sql = `
        delete from member 
            where member.openid = "${openid}"
            and member.Id <> "${Id}";
`
        try {
            const type = this.ctx.model.Sequelize.QueryTypes.DELETE
            return await this.ctx.model.query(sql, { type });
        } catch (error) {
            throw error
        }
    }

    async updateFildesBy (fileds, conditions) {
        const sets = []
        const wheres = []
        const { ctx } = this
        for (const key in fileds) {
            const value = fileds[key]
            if (value && value !== 'null') sets.push(`member.${key} = "${value}"`)
        }
        for (const key in conditions) {
            const value = conditions[key]
            wheres.push(`member.${key} = "${value}"`)
        }
        const sql = `update member
        set ${sets.join(`, `)}
        where ${wheres.join(` and `)}`
        try {
            if (sets && sets.length) {
                const type = ctx.model.Sequelize.QueryTypes.UPDATE
                return await ctx.model.query(sql, { type });
            }
        } catch (error) {
            throw error
        }
    }

    async addIntegration (integration,MemberId){
        const { ctx } = this
        const sql = `
        update member 
        set member.Integration = member.Integration + ${integration}
        where member.Id = '${MemberId}'
        `
        try {
            const result = await ctx.model.query(sql, {
                type: this.ctx.model.Sequelize.QueryTypes.UPDATE,
            })
            return result
        } catch (error) {
            throw new Error(error)
        }
    }
    
}

module.exports = UserService 