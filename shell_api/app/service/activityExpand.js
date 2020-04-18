'use strict'
/**
 * SysrolesyspersonService
 * useage: ctx.service.sysrolesysperson
 */
const Service = require('egg').Service;

class ActivityExpand extends Service {

    /**
     * 获取活动列表
     */
    async getActivityList() {
        const ctx = this.ctx
        const sql = `
            select activity.Id, activity.Name as Subject, 
            activity.BannerList, activity.ArticleUrl as Url
            from activity as activity
            where isnull(activity.ParentId) = 1
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

module.exports = ActivityExpand;


