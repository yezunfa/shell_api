'use strict';

/**
 * SysRoleService
 * useage: ctx.service.sys_role
 */
const { sqlMango } = require('../utils/index');
const Service = require('egg').Service;

class SysUserDutyRosterService extends Service {
    ServiceConfig () {
        const DutyRoster = `select 
        sys_user_duty_roster.Id,
        sys_user.Name,
        sys_user_duty_roster.SysUserId,
        sys_user_duty_roster.StartTime,
        sys_user_duty_roster.EndTime,
        sys_user_duty_roster.State,
        sys_user_duty_roster.Type,
        sys_user_duty_roster.Valid,
        sys_user_duty_roster.CreateTime
        from sys_user_duty_roster
        left join sys_user 
        on sys_user.Id = sys_user_duty_roster.SysUserId`
        const Table = { DutyRoster }
        return { Table }
    }

    /**
     * create a new sys_role
     * @param {Object} entity model sys_role
     * @return {Object} entity a model Entity
     */
    async create(entity) {
        try {
            const result = await this.ctx.model.SysUserDutyRoster.create(entity);
            return result;
        } catch (err) {
            throw err;
        }
    }

    /**
     *  get a sys_role by Id
     * @param {String} Id guid
     * @return {Object} entity a model Entity
     */
    async getById(Id) {
        try {
            const result = await this.ctx.model.SysUserDutyRoster.findOne({
                where: {
                    Id
                }
            });
            return result ? result.dataValues : null
        } catch (err) {
            throw err;
        }
    }

    /**
     *  get a sys_role by condtion
     * @param {Object} where condition
     * @return {Object} entity a model Entity
     */
    async getByCondition(where) {
        if(!where || typeof where !== 'object') {
            throw new Error('param error');
        }
        try {
            const result = await this.ctx.model.SysUserDutyRoster.findOne({
                where: where
            });
            return result.dataValues || result;
        } catch (err) {
            throw err;
        }
    }

    /**
     * getLatest record from sys_role
     */
    async getLatest() {
        const result = await this.ctx.model.SysUserDutyRoster.findOne({
            order: [["CreateTime", 'DESC']]
        });
        return result;
    }


    /**
     * edit a sys_role
     * @param {Object} entity model sys_role
     * @return {Object} entity a model Entity
     */
    async edit(entity) {
        try {
            const result = await this.ctx.model.SysUserDutyRoster.update(entity.dataValues || entity, {
                where: {
                    Id: entity.Id
                }
            });
            return result;
        } catch (err) {
            throw err;
        }
    }

    /**
     * remove a record from sys_role
     * @param {Object} entity a model Entity
     * @return {Object} affact count
     */
    async remove(entity) {
        try{
            entity.Valid = 0;
            return await this.ctx.service.sysRole.edit(entity);
        } catch (err) {
            throw err;
        }
    }

    /**
     * delete a record from sys_role
     * @param {Object} entity a model Entity
     * @return {Object} affact count
     */
    async delete(entity) {
        try {
            const result = await this.ctx.model.SysRole.destroy({
                where: {
                    Id: entity.Id
                }
            });
            return result;
        } catch (err) {
            throw err;
        }
    }

    /**
     * search in Course and left jion with {  }
     * @param {Object} pagination page 
     * @param {Object} where where
     * @param {Object} order order by  
     * @returns {Object} list 
     */
    async search({$pagination, $query, $sort}) {
        const { ctx } = this
        const { current, pageSize, disabled } = $pagination
        console.log($query)
        const sql = type => {
            switch (type) {
                case "Count":
                    return `select count(ViewTable.Id) as count
                    from (${this.ServiceConfig().Table.DutyRoster}) as ViewTable
                    ${sqlMango.buildWhereCondition($query, 'ViewTable')}`
                default:
                    const { condition, order, limit } = sqlMango.buildCondition($pagination, $query, $sort, 'ViewTable');
                    return `select ViewTable.*
                    from (${this.ServiceConfig().Table.DutyRoster}) as ViewTable
                    ${condition}
                    ${order ? order : ""}
                    ${disabled ? "" : limit}`
            }
        }

        try {
            const type = ctx.model.Sequelize.QueryTypes.SELECT

            const countResult = await ctx.model.query(sql("Count"), { type });
            const dataList = await ctx.model.query(sql(), { type });

            const total = countResult.length ? countResult[0].count : 0
            return { current, pageSize, total, dataList }
        } catch (error) {
            throw new Error(error)
        }        
    }

    async UpdateByFileds ({ params, Id }) {
        const fileds = []
        for (const key in params) fileds.push(`marketing_plan.${key} = "${params[key]}"`)

        const sql = `update marketing_plan
        set ${fileds.join(`,
        `)}
        where marketing_plan.Id = "${Id}"`

        try {
            const type = this.ctx.model.Sequelize.QueryTypes.UPDATE
            return await this.ctx.model.query(sql, { type })
        } catch (error) {
            throw new Error(error)
        }
    }
}

module.exports = SysUserDutyRosterService;
