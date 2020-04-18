'use strict';

/**
 * SysrolesyspersonService
 * useage: ctx.service.sysrolesysperson
 */

const Service = require('egg').Service;

class Index extends Service {

    /**
     * 获取地区
     */
    async getArea(pid) {
        let curPid = typeof pid === 'string' ? parseInt(pid, 10) : pid;
        // const sql = `SELECT * FROM china WHERE china.Pid in (440301, 440308) and Name != '市辖区'`;
        const sql = `SELECT * FROM china WHERE china.Pid in (${curPid}) and Name != '市辖区' and Id != 0`;
        const result = await this.ctx.model.query(sql, {
            type: this.ctx.model.Sequelize.QueryTypes.SELECT
        });
        return result;
    }

    /**
     * 获取地区-去市辖区
     */
    async getArea2(pid) {
        let curPid = typeof pid === 'string' ? parseInt(pid, 10) : pid;
        
        const sql = `SELECT * FROM china WHERE china.Pid in (${curPid}, ${curPid + 1} ) and Name != '市辖区' and Id != 0`;
        const result = await this.ctx.model.query(sql, {
            type: this.ctx.model.Sequelize.QueryTypes.SELECT
        });
        return result;
    }
}


module.exports = Index;


