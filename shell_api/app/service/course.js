'use strict';

/**
 * CourseService
 * useage: ctx.service.course
 */
const { sqlHelper } = require('../utils/index');
const Service = require('egg').Service;

class CourseService extends Service {

    /**
     * create a new course
     * @param {Object} entity model course
     * @return {Object} entity a model Entity
     */
    async create(entity) {
        try {
            const result = await this.ctx.model.Course.create(entity);
            return result;
        } catch (err) {
            throw err;
        }
    }

    /**
     *  get a course by Id
     * @param {String} Id guid
     * @return {Object} entity a model Entity
     */
    async getById(Id) {
        try {
            const result = await this.ctx.model.Course.findOne({
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
     *  get a course by condtion
     * @param {Object} where condition
     * @return {Object} entity a model Entity
     */
    async getByCondition(where) {
        if(!where || typeof where !== 'object') {
            throw new Error('param error');
        }
        try {
            const result = await this.ctx.model.Course.findOne({
                where: where
            });
            return result.dataValues || result;
        } catch (err) {
            throw err;
        }
    }

    /**
     * getLatest record from course
     */
    async getLatest() {
        const result = await this.ctx.model.Course.findOne({
            order: [["CreateTime", 'DESC']]
        });
        return result;
    }


    /**
     * edit a course
     * @param {Object} entity model course
     * @return {Object} entity a model Entity
     */
    async edit(entity) {
        try {
            const result = await this.ctx.model.Course.update(entity.dataValues || entity, {
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
     * remove a record from course
     * @param {Object} entity a model Entity
     * @return {Object} affact count
     */
    async remove(entity) {
        try{
            entity.Valid = 0;
            return await this.ctx.service.course.edit(entity);
        } catch (err) {
            throw err;
        }
    }

    /**
     * delete a record from course
     * @param {Object} entity a model Entity
     * @return {Object} affact count
     */
    async delete(entity) {
        try {
            const result = await this.ctx.model.Course.destroy({
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
                sql = sqlHelper.buildWhereCondition(whereCon, 'course');
            } else {
                selectVal = "course.*";
                sql = sqlHelper.buildCondition(pagination, whereCon, orderCon, 'course');
            }

            sql = `select ${selectVal}
                from course
                
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

    async checkSchedule (StartTime, EndTime, CoachId) {
        const sql = `select course_schedule.* 
        from course_schedule 
        where course_schedule.Valid = 1
        and course_schedule.CoachId = "${CoachId}"
        and (
            (course_schedule.StartTime <= "${StartTime}" and course_schedule.EndTime > "${StartTime}")
            or 
            (course_schedule.StartTime < "${EndTime}" and course_schedule.EndTime >= "${EndTime}" )
        )`
        try {
            const result = await this.ctx.model.query(sql, {
                type: this.ctx.model.Sequelize.QueryTypes.SELECT
            })
            return result
        } catch (error) {
            throw new Error(error)
        }
    }
}

module.exports = CourseService;
