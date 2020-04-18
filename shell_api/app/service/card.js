'use strict';

/**
 * CardService
 * useage: ctx.service.card
 */
const uuid = require('uuid')
const { sqlHelper } = require('../utils/index');
const Service = require('egg').Service;

class CardService extends Service {

    async createInit(UserId) {
        try {
            const result = await this.ctx.model.Card.create({
                Id: uuid.v1(),
                Name: '体验卡',
                CardNo: null,
                LevelId: 0,
                Level: 0,
                State: 1,
                UserId,
                Type: 0
            });
            result;
        } catch (err) {
            throw err;
        }
    }

    /**
     * create a new card
     * @param {Object} entity model card
     * @return {Object} entity a model Entity
     */
    async create(entity) {
        try {
            const result = await this.ctx.model.Card.create(entity);
            return result;
        } catch (err) {
            throw err;
        }
    }

    /**
     *  get a card by Id
     * @param {String} Id guid
     * @return {Object} entity a model Entity
     */
    async getById(Id) {
        try {
            const result = await this.ctx.model.Card.findOne({
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
     *  get a card by condtion
     * @param {Object} where condition
     * @return {Object} entity a model Entity
     */
    async getByCondition(where) {
        if(!where || typeof where !== 'object') throw new Error('param error')
        try {
            const result = await this.ctx.model.Card.findOne({ where });
            return result && result.dataValues ? result.dataValues : result;
        } catch (err) {
            throw err;
        }
    }

    /**
     * getLatest record from card
     */
    async getLatest() {
        const result = await this.ctx.model.Card.findOne({
            order: [["CreateTime", 'DESC']]
        });
        return result;
    }


    /**
     * edit a card
     * @param {Object} entity model card
     * @return {Object} entity a model Entity
     */
    async edit(entity) {
        try {
            const result = await this.ctx.model.Card.update(entity.dataValues || entity, {
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
     * remove a record from card
     * @param {Object} entity a model Entity
     * @return {Object} affact count
     */
    async remove(entity) {
        try{
            entity.Valid = 0;
            return await this.ctx.service.card.edit(entity);
        } catch (err) {
            throw err;
        }
    }

    /**
     * delete a record from card
     * @param {Object} entity a model Entity
     * @return {Object} affact count
     */
    async delete(entity) {
        try {
            const result = await this.ctx.model.Card.destroy({
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
     * search in Card and left jion with {  }
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
                sql = sqlHelper.buildWhereCondition(whereCon, 'card');
            } else {
                selectVal = "card.*";
                sql = sqlHelper.buildCondition(pagination, whereCon, orderCon, 'card');
            }

            sql = `select ${selectVal}
                from card
                
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

    async packagecardstore (PackageId) {
        const { ctx } = this
        const sql = `select package_store.* from card 
        left join order_sub
        on card.OrderSubId = order_sub.Id
        left join packages
        on order_sub.PackageId = packages.Id
        left join (select 
            course_package_relate.PackageId,
            group_concat(course.StoreId) as StoreList
            from course_package_relate
            left join course 
            on course.Id = course_package_relate.CourseId
            group by PackageId
        ) as package_store
        on package_store.PackageId = order_sub.PackageId
        where card.Id = "${PackageId}"`
        try {
            const type = ctx.model.Sequelize.QueryTypes.SELECT
            const list = await ctx.model.query(sql, { type });
            const [ result ] = list
            return result
        } catch (error) {
            throw error
        }
    }

    async deletebyids (Idlist) {
        const { ctx } = this
        const sql = `delete from card where card.Id in ("${Idlist.join(`", "`)}")`
        try {
            const type = ctx.model.Sequelize.QueryTypes.SELECT
            const list = await ctx.model.query(sql, { type });
            const [ result ] = list
            return result
        } catch (error) {
            throw error
        }
    }

    async updateFildes (fileds, conditions) {
        const sets = []
        const wheres = []
        const { ctx } = this
        for (const key in fileds) {
            const value = fileds[key]
            sets.push(`card.${key} = "${value}"`)
        }
        for (const key in conditions) {
            const value = conditions[key]
            wheres.push(`card.${key} = "${value}"`)
        }
        const sql = `update card
        set ${sets.join(`, `)}
        where ${wheres.join(` and `)}`
        try {
            const type = ctx.model.Sequelize.QueryTypes.UPDATE
            return await ctx.model.query(sql, { type });
        } catch (error) {
            throw error
        }
    }
    
    async updateStateByUserId(State,Id) {
        const sql= `
        update card
        set State = ${State}
        where card.UserId = '${Id}'
        and card.Type = 1
        and card.State in (0,1) -- 禁用或者正常，其他情况不允许在此修改
        `
        try {
            const result = await this.ctx.model.query(sql, {
                type: this.ctx.model.Sequelize.QueryTypes.UPDATE,
            })
            return result
        } catch (error) {
            throw new Error(error)
        }
    }
}

module.exports = CardService;
