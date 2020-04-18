'use strict';

/**
 * CouponService
 * useage: ctx.service.coupon
 */
const { sqlHelper } = require('../utils/index');
const Service = require('egg').Service;

class CouponService extends Service {

    /**
     * create a new coupon
     * @param {Object} entity model coupon
     * @return {Object} entity a model Entity
     */
    async create(entity) {
        try {
            const result = await this.ctx.model.Coupon.create(entity);
            return result;
        } catch (err) {
            throw err;
        }
    }

    /**
     *  get a coupon by Id
     * @param {String} Id guid
     * @return {Object} entity a model Entity
     */
    async getById(Id) {
        try {
            const result = await this.ctx.model.Coupon.findOne({
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
     *  get a coupon by condtion
     * @param {Object} where condition
     * @return {Object} entity a model Entity
     */
    async getByCondition(where) {
        if(!where || typeof where !== 'object') {
            throw new Error('param error');
        }
        try {
            const result = await this.ctx.model.Coupon.findOne({
                where: where
            });
            return result.dataValues || result;
        } catch (err) {
            throw err;
        }
    }

    /**
     * getLatest record from coupon
     */
    async getLatest() {
        const result = await this.ctx.model.Coupon.findOne({
            order: [["CreateTime", 'DESC']]
        });
        return result;
    }


    /**
     * edit a coupon
     * @param {Object} entity model coupon
     * @return {Object} entity a model Entity
     */
    async edit(entity) {
        try {
            const result = await this.ctx.model.Coupon.update(entity.dataValues || entity, {
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
     * remove a record from coupon
     * @param {Object} entity a model Entity
     * @return {Object} affact count
     */
    async remove(entity) {
        try{
            entity.Valid = 0;
            return await this.ctx.service.coupon.edit(entity);
        } catch (err) {
            throw err;
        }
    }

    /**
     * delete a record from coupon
     * @param {Object} entity a model Entity
     * @return {Object} affact count
     */
    async delete(entity) {
        try {
            const result = await this.ctx.model.Coupon.destroy({
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
     * search in Coupon and left jion with {  }
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
                sql = sqlHelper.buildWhereCondition(whereCon, 'coupon');
            } else {
                selectVal = "coupon.*";
                sql = sqlHelper.buildCondition(pagination, whereCon, orderCon, 'coupon');
            }

            sql = `select ${selectVal}
                from coupon
                
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

    async getCoupon ({UserId}) {
        const sql = `select member_coupon.Id, coupon.Title, coupon.Discount,
        coupon.Profile, coupon.CompanyId, coupon.LimitedCourse,
        coupon.LimitedCourseType, coupon.CouponType, coupon.Banner
        from member_coupon
        left join coupon
        on coupon.Id = member_coupon.CouponId
        where member_coupon.UserId = "${UserId}"
        and member_coupon.OrderId is null
        and member_coupon.State = 1
        and member_coupon.Valid = 1
        and coupon.State = 1
        and coupon.Valid = 1
        and to_days(coupon.ExpiredDate) >= to_days(now())
        and to_days(coupon.ActiveDate) <= to_days(now())
        `
        try {
            const result = await this.ctx.model.query(sql, {
                type: this.ctx.model.Sequelize.QueryTypes.SELECT
            });
            return result
        } catch (error) {
            throw new Error(error)
        }
    }


    async enablecoupon ({UserId, CourseScheduleId}) {
        const { ctx } = this
        const type = ctx.model.Sequelize.QueryTypes.SELECT
        const sql = `select coupon.Title, coupon.CouponType, member_coupon.* from member_coupon
        left join coupon on member_coupon.CouponId = coupon.Id
        where member_coupon.OrderId is null
        and member_coupon.CouponId in (select coupon.Id from coupon
            where member_coupon.UserId = "${UserId}"
            and State = 1 and Valid = 1
            and coupon.LimitedCourse like concat('%',  (select course.Id
                from course
                left join course_schedule
                on course.Id = course_schedule.CourseId 
                where course_schedule.Id = "${CourseScheduleId}"
            ), '%')
        )`

        try {
            const result = await ctx.model.query(sql, { type, rows: true });
            return result
        } catch (error) {
            throw new Error(error)
        }
    }
}

module.exports = CouponService;
