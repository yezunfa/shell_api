'use strict';

/**
 * SysCacheExpand
 * useage: ctx.service.sys_cache
 */
const { sqlHelper } = require('../utils/index');
const Service = require('egg').Service;

class SysCacheExpand extends Service {
    /**
     * 获取最新键值对
     */
    async getCacheByKeyname(keyname) {
        const ctx = this.ctx
        const sql = `
            select * from sys_cache
            where Valid = 1 
            and KeyName = "${keyname}"
            and CreateTime > date_sub(now(),interval 2 hour)
            order by CreateTime desc
            limit 1
        `;
        try {
            const result = await this.ctx.model.query(sql, {
                type: this.ctx.model.Sequelize.QueryTypes.SELECT
            })
            return result.dataValues || result;
        } catch (err) {
            throw err;
        }
    }
   
}

module.exports = SysCacheExpand;
