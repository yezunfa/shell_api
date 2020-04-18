'use strict';

/**
 * LabelService
 * useage: ctx.service.label
 */
const { sqlHelper } = require('../utils/index');
const Service = require('egg').Service;

class LabelService extends Service {

    /**
     * create a new label
     * @param {Object} entity model label
     * @return {Object} entity a model Entity
     */
    async create(entity) {
        try {
            const result = await this.ctx.model.Label.create(entity);
            return result;
        } catch (err) {
            throw err;
        }
    }

    /**
     *  get a label by Id
     * @param {String} Id guid
     * @return {Object} entity a model Entity
     */
    async getById(Id) {
        try {
            const result = await this.ctx.model.Label.findOne({
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
     *  get a label by condtion
     * @param {Object} where condition
     * @return {Object} entity a model Entity
     */
    async getByCondition(where) {
        if(!where || typeof where !== 'object') {
            throw new Error('param error');
        }
        try {
            const result = await this.ctx.model.Label.findOne({
                where: where
            });
            return result.dataValues || result;
        } catch (err) {
            throw err;
        }
    }

    /**
     * getLatest record from label
     */
    async getLatest() {
        const result = await this.ctx.model.Label.findOne({
            order: [["CreateTime", 'DESC']]
        });
        return result;
    }


    /**
     * edit a label
     * @param {Object} entity model label
     * @return {Object} entity a model Entity
     */
    async edit(entity) {
        try {
            const result = await this.ctx.model.Label.update(entity.dataValues || entity, {
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
     * remove a record from label
     * @param {Object} entity a model Entity
     * @return {Object} affact count
     */
    async remove(entity) {
        try{
            entity.Valid = 0;
            return await this.ctx.service.label.edit(entity);
        } catch (err) {
            throw err;
        }
    }

    /**
     * delete a record from label
     * @param {Object} entity a model Entity
     * @return {Object} affact count
     */
    async delete(entity) {
        try {
            const result = await this.ctx.model.Label.destroy({
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
     * search in Label and left jion with {  }
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
                sql = sqlHelper.buildWhereCondition(whereCon, 'label');
            } else {
                selectVal = "label.*";
                sql = sqlHelper.buildCondition(pagination, whereCon, orderCon, 'label');
            }

            sql = `select ${selectVal}
                from label
                
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

    async getFilter (query) {
        const { ctx } = this
        const condition = `and ${query}_label.Valid = 1
        and ${query}_label.CourseId is not null`
        const sql = `select label.* 
        from label
        left join course_label
        on course_label.LabelId = label.Id
        where label.Valid = 1
        ${condition}
        group by label.Id`
        try {
            const result = await ctx.model.query(sql, {
                type: this.ctx.model.Sequelize.QueryTypes.SELECT
            });
            return result
        } catch (error) {
            throw new Error(error)
        }
    }

    async extendCourse(StoreList, ParentList) {
        const { ctx } = this
        const condition = { store: '', type: '' }
        if (StoreList instanceof Array && StoreList.length) condition.store = `and course.StoreId in ("${StoreList.join(`", "`)}")`
        if (ParentList instanceof Array && ParentList.length) condition.type = `and parent_type.Id in ("${ParentList.join(`", "`)}")`
        
        const sql = `select course.Id, course.Name, course.EnName
        from course
        left join course_label
        on course_label.CourseId = course.Id
        left join course_type
        on course.TypeId = course_type.Id
        left join course_type as parent_type
        on parent_type.Id = course_type.ParentId
        where course.Valid = 1
        ${condition.type}
        ${condition.store}
        group by course.Id`
        try {
            const result = await ctx.model.query(sql, {
                type: this.ctx.model.Sequelize.QueryTypes.SELECT
            });
            return result
        } catch (error) {
            throw new Error(error)
        }
    }
 }

module.exports = LabelService;
