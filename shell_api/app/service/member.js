'use strict';

/**
 * MemberService
 * useage: ctx.service.member
 */
const { sqlHelper } = require('../utils/index');
const Service = require('egg').Service;

class MemberService extends Service {

    /**
     * create a new member
     * @param {Object} entity model member
     * @return {Object} entity a model Entity
     */
    async create(entity) {
        try {
            const result = await this.ctx.model.Member.create(entity);
            return result;
        } catch (err) {
            throw err;
        }
    }

    /**
     *  get a member by Id
     * @param {String} Id guid
     * @return {Object} entity a model Entity
     */
    async getById(Id) {
        const sql = `select member.*, 
        store.Name as StoreName 
        from member 
        left join store on store.Id = member.StoreId
        where member.Id = "${Id}" `
        try {
            const result = await this.ctx.model.query(sql, {
                type: this.ctx.model.Sequelize.QueryTypes.SELECT
            })
            return result[0] || result;
        } catch (err) {
            throw err;
        }
    }

    /**
     *  get a member by condtion
     * @param {Object} where condition
     * @return {Object} entity a model Entity
     */
    async getByCondition(where) {
        if(!where || typeof where !== 'object') throw new Error('param error');
        try {
            const result = await this.ctx.model.Member.findOne({ where });
            return result && result.dataValues ? result.dataValues : result;
        } catch (err) {
            throw err;
        }
    }

    /**
     * getLatest record from member
     */
    async getLatest() {
        const result = await this.ctx.model.Member.findOne({
            order: [["CreateTime", 'DESC']]
        });
        return result;
    }


    /**
     * edit a member
     * @param {Object} entity model member
     * @return {Object} entity a model Entity
     */
    async edit(entity) {
        try {
            const result = await this.ctx.model.Member.update(entity.dataValues || entity, {
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
     * remove a record from member
     * @param {Object} entity a model Entity
     * @return {Object} affact count
     */
    async remove(entity) {
        try{
            entity.Valid = 0;
            return await this.ctx.service.member.edit(entity);
        } catch (err) {
            throw err;
        }
    }

    /**
     * delete a record from member
     * @param {Object} entity a model Entity
     * @return {Object} affact count
     */
    async delete(entity) {
        try {
            const result = await this.ctx.model.Member.destroy({
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
     * search in Member and left jion with {  }
     * @param {Object} pagination page 
     * @param {Object} where where
     * @param {Object} order order by  
     * @returns {Object} list 
     */
    async search(pagination, where, order) {
        let page = pagination ? pagination.current : 1;
        let pageSize = pagination ? pagination.pageSize : 10;

        // default query
        let whereCon = {
            Valid: {
                '$gt': 0
            }
        }
        if(where && typeof where === "object") {
            whereCon = Object.assign(whereCon, where)
        }

        //default order
        let orderCon = [['CreateTime','Desc']];
        if(order &&  order.length) {
            orderCon = order.concat(orderCon);
        }

        const querySql = (isCount) => {
            let selectVal =  "count(*) as count";
            let sql = "";
            if(isCount) {
                sql = sqlHelper.buildWhereCondition(whereCon, 'member');
            } else {
                selectVal = "member.*";
                sql = sqlHelper.buildCondition(pagination, whereCon, orderCon, 'member');
            }

            sql = `select ${selectVal}
                from member
                
                ${sql}
            `;

            return sql;
        }

        const countResult = await this.ctx.model.query(querySql(true), {
            type: this.ctx.model.Sequelize.QueryTypes.SELECT
        });

        const rowsResult = await this.ctx.model.query(querySql(), {
            type: this.ctx.model.Sequelize.QueryTypes.SELECT
        });

        return {
            page,
            pageSize,
            count: countResult.length ? countResult[0]["count"] : 0,
            rows: rowsResult
        }
    }

    async checkMobile (Mobile) {
        const sql = `select * from member where member.Mobile = "${Mobile}"`
        try {
            const type = this.ctx.model.Sequelize.QueryTypes.SELECT
            
            const result = await this.ctx.model.query(sql, { type });

            return result[0] || result
        } catch (error) {
            throw error
        }
    }

    async deleteByopenid (openid, Id) {
        const sql = `delete from member 
        where member.openid = "${openid}"
        and member.Id <> "${Id}"`
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
}

module.exports = MemberService;
