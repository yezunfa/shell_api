'use strict';

/**
 * MemberReservationService
 * useage: ctx.service.member_reservation
 */
const { sqlHelper } = require('../utils/index');
const Service = require('egg').Service;

class MemberReservationService extends Service {

    /**
     * create a new member_reservation
     * @param {Object} entity model member_reservation
     * @return {Object} entity a model Entity
     */
    async create(entity) {
        try {
            const result = await this.ctx.model.MemberReservation.create(entity);
            return result;
        } catch (err) {
            throw err;
        }
    }

    /**
     *  get a member_reservation by Id
     * @param {String} Id guid
     * @return {Object} entity a model Entity
     */
    async getById(Id) {
        try {
            const result = await this.ctx.model.MemberReservation.findOne({
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
     *  get a member_reservation by condtion
     * @param {Object} where condition
     * @return {Object} entity a model Entity
     */
    async getByCondition(where) {
        if(!where || typeof where !== 'object') {
            throw new Error('param error');
        }
        try {
            const result = await this.ctx.model.MemberReservation.findOne({
                where: where
            });
            return result.dataValues || result;
        } catch (err) {
            throw err;
        }
    }

    /**
     * getLatest record from member_reservation
     */
    async getLatest() {
        const result = await this.ctx.model.MemberReservation.findOne({
            order: [["CreateTime", 'DESC']]
        });
        return result;
    }


    /**
     * edit a member_reservation
     * @param {Object} entity model member_reservation
     * @return {Object} entity a model Entity
     */
    async edit(entity) {
        try {
            const result = await this.ctx.model.MemberReservation.update(entity.dataValues || entity, {
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
     * remove a record from member_reservation
     * @param {Object} entity a model Entity
     * @return {Object} affact count
     */
    async remove(entity) {
        try{
            entity.Valid = 0;
            return await this.ctx.service.memberReservation.edit(entity);
        } catch (err) {
            throw err;
        }
    }

    /**
     * delete a record from member_reservation
     * @param {Object} entity a model Entity
     * @return {Object} affact count
     */
    async delete(entity) {
        try {
            const result = await this.ctx.model.MemberReservation.destroy({
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
     * search in MemberReservation and left jion with {  }
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
                sql = sqlHelper.buildWhereCondition(whereCon, 'member_reservation');
            } else {
                selectVal = "member_reservation.*";
                sql = sqlHelper.buildCondition(pagination, whereCon, orderCon, 'member_reservation');
            }

            sql = `select ${selectVal}
                from member_reservation
                
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

    /**
     * 通过预约Id取消预约 并尝试删除训练计划的Reservertion
     * @param {*} ReservationId 
     */
    async removeById (ReservationId, CourseScheduleId) {
        const sql = `update member_reservation
        set member_reservation.Valid = 0,
        member_reservation.State = 4
        where member_reservation.Id = "${ReservationId}"`

        const cancel = `update course_schedule 
        set course_schedule.Valid = 0 
        and course_schedule.State = 2
        where course_schedule.Id = "${CourseScheduleId}"`

        const deletes = `update train_schedule_phase
        set train_schedule_phase.ReservationId = NULL
        where train_schedule_phase.ReservationId = "${ReservationId}"`
        try {
            const type = this.ctx.model.Sequelize.QueryTypes.UPDATE
            // update 预约状态 : 将此预约变为无效
            const result1 = await this.ctx.model.query(sql, { type });
            // update 排课状态 : 将此排课变为无效
            if ( CourseScheduleId ) await this.ctx.model.query(cancel, { type }); // const result2 =
            // update 训练计划 : 取消计划和预约的关联
            const result3 = await this.ctx.model.query(deletes, { type });
            
            return result1
        } catch (error) {
            throw new Error(error)
        }
    }

    /**
     * 检查取消次数
     */
    async checkCancelTime(UserId) {
        const sql = `select order_main.Id as OrderId,
        member_reservation.Id as ReservationId
        from order_main
        left join order_sub
        on order_sub.OrderId = order_main.Id
        and order_sub.ReservationId is not null
        left join member_reservation
        on member_reservation.Id = order_sub.ReservationId
        where order_main.State = 2
        and order_main.UserId = :UserId
        and month(member_reservation.StartTime) = month(now())`
        try {
            const result = await this.ctx.model.query(sql, {
                type: this.ctx.model.Sequelize.QueryTypes.SELECT,
                replacements: { UserId }
            });
            return result;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = MemberReservationService;
