'use strict';

/**
 * CourseScheduleService
 * useage: ctx.service.course_schedule
 */
const { sqlHelper } = require('../utils/index');
const Service = require('egg').Service;

class CourseScheduleService extends Service {

    /**
     * create a new course_schedule
     * @param {Object} entity model course_schedule
     * @return {Object} entity a model Entity
     */
    async create(entity) {
        try {
            const result = await this.ctx.model.CourseSchedule.create(entity);
            return result;
        } catch (err) {
            throw err;
        }
    }

    /**
     *  get a course_schedule by Id
     * @param {String} Id guid
     * @return {Object} entity a model Entity
     */
    async getById(Id) {
        try {
            const result = await this.ctx.model.CourseSchedule.findOne({
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
     *  get a course_schedule by condtion
     * @param {Object} where condition
     * @return {Object} entity a model Entity
     */
    async getByCondition(where) {
        if(!where || typeof where !== 'object') throw new Error('param error');
        try {
            const result = await this.ctx.model.CourseSchedule.findOne({ where });
            return result && result.dataValues ? result.dataValues : result;
        } catch (err) {
            throw err;
        }
    }

    /**
     * getLatest record from course_schedule
     */
    async getLatest() {
        const result = await this.ctx.model.CourseSchedule.findOne({
            order: [["CreateTime", 'DESC']]
        });
        return result;
    }


    /**
     * edit a course_schedule
     * @param {Object} entity model course_schedule
     * @return {Object} entity a model Entity
     */
    async edit(entity) {
        try {
            const result = await this.ctx.model.CourseSchedule.update(entity.dataValues || entity, {
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
     * remove a record from course_schedule
     * @param {Object} entity a model Entity
     * @return {Object} affact count
     */
    async remove(entity) {
        try{
            entity.Valid = 0;
            return await this.ctx.service.courseSchedule.edit(entity);
        } catch (err) {
            throw err;
        }
    }

    /**
     * delete a record from course_schedule
     * @param {Object} entity a model Entity
     * @return {Object} affact count
     */
    async delete(entity) {
        try {
            const result = await this.ctx.model.CourseSchedule.destroy({
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
     * search in CourseSchedule and left jion with {  }
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
                sql = sqlHelper.buildWhereCondition(whereCon, 'course_schedule');
            } else {
                selectVal = "course_schedule.*";
                sql = sqlHelper.buildCondition(pagination, whereCon, orderCon, 'course_schedule');
            }

            sql = `select ${selectVal}
                from course_schedule
                
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

    async getScheduleInfo({ Dates, StoreId }, courseids) {
        const course = courseids instanceof Array ? `and course_schedule.CourseId in ("${courseids.join(`", "`)}")` : 'and course_schedule.CourseId in ()'
        const store = StoreId && StoreId.length === 36 ? `and course_schedule.StoreId = "${StoreId}"` : ''
        const sql = `select course_schedule.Id, course_schedule.Name, course_schedule.EnName,
        course_schedule.StartTime, course_schedule.EndTime, course_schedule.Difficult,
        course_schedule.State, course_schedule.CoachId, course_schedule.CoachName,
        course_schedule.CoachNickName, sys_user.Photo as CoachPhoto, course.Price,
        course.StoredValuePrice, course.MemberPrice, course_type.Name as TypeName,
        sys_user.Avatar as CoachAvatar, course_label_list.LabelList as Label, course.Id as CourseId
        from course_schedule
        left join sys_user
        on sys_user.Id = course_schedule.CoachId
        left join course 
        on course.Id = course_schedule.CourseId
        left join course_type 
        on course_type.Id = course.TypeId
        left join (select 
            course_label.CourseId, group_concat(label.Name) as LabelList 
            from course_label
            left join label
            on label.Id = course_label.LabelId
            where course_label.Valid = 1
            group by course_label.CourseId
        ) as course_label_list
        on course_label_list.CourseId = course_schedule.CourseId
        where course_schedule.Valid = 1 
        and to_days(course_schedule.Date) = to_days("${Dates}")
        ${course}
        ${store}
        order by course_schedule.StartTime`
        try {
            const result = await this.ctx.model.query(sql, {
                type: this.ctx.model.Sequelize.QueryTypes.SELECT
            })
            return result.dataValues || result;
        } catch (err) {
            throw err;
        }
    }

    async updateFieldsById(params, Id) {
        const sets = []
        for (const key in params) {
            const value = params[key]
            if (!value) continue
            sets.push(`${key} = "${value}"`)
        }
        const sql = `update course_schedule set
        ${sets.join(`,
        `)}
        where course_schedule.Id = "${Id}"`
        try {
            const result = await this.ctx.model.query(sql, {
                type: this.ctx.model.Sequelize.QueryTypes.UPDATE
            })
            return result.dataValues || result;
        } catch (err) {
            throw err;
        }
    }
}

module.exports = CourseScheduleService;
