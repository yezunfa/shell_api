'use strict';
const Service = require('egg').Service;

class SysLogService extends Service {

    async create(entity) {
        const { ctx } = this
        try {
            return await ctx.model.SysLog.create(entity)
        } catch (err) {
            throw err;
        }
    }

    async searchbyuser (UserId) {
        const { ctx } = this
        const sql = `select * from sys_log 
        where sys_log.UserId = "${UserId}"
        order by CreateTime desc limit 1`
        try {
            const type = ctx.model.Sequelize.QueryTypes.SELECT
            return await ctx.model.query(sql, { type });
        } catch (error) {
            throw error
        }
    }
}

module.exports = SysLogService
