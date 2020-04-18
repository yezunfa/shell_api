'use strict';

/**
 * ChinaService
 * useage: ctx.service.china
 */
const { sqlHelper } = require('../utils/index');
const Service = require('egg').Service;
const moment = require('moment')

class MemberReservationExpand extends Service {
    /**
     * 校验预约订单
     * @param {*} coachid 
     */
    async checkoutResrvation({userid, coursescheduleid, reservationid}) {
        let sql_string = `select 
        member_reservation.* ,
        course.MemberPrice, course.StoredValuePrice, course.Price
        from member_reservation
        left join course_schedule
        on course_schedule.Id = member_reservation.CourseScheduleId
        left join course 
        on course.Id = course_schedule.CourseId
        where member_reservation.Valid = 1
        and member_reservation.UserId = "${userid}"
        and member_reservation.CourseScheduleId = "${coursescheduleid}"`
        if (reservationid) {
            sql_string = `select 
            member_reservation.* ,
            course.MemberPrice, course.StoredValuePrice, course.Price
            from member_reservation
            left join course_schedule
            on course_schedule.Id = member_reservation.CourseScheduleId
            left join course 
            on course.Id = course_schedule.CourseId
            where member_reservation.Valid = 1
            and member_reservation.Id = "${reservationid}"`
        }
        try {
            const result = await this.ctx.model.query(sql_string, {
                type: this.ctx.model.Sequelize.QueryTypes.SELECT
            })
            return result[0];
        } catch (err) {
            throw err;
        }
    }

      /**
     * 获取预约订单详情
     * @param {*} coachid 
     */
    async getResrvationInfoById(Id) {
        let sql_string = `select 
        mr.*,
        ordMain.Code as orderNo,
        ordMain.Id as orderId
        from
        member_reservation mr
        left join order_sub  ordSub
        on ordSub.ReservationId = mr.Id
        left join order_main  ordMain
        on ordMain.Id = ordSub.OrderId
        where mr.Id=:Id
        `;
        try {
            const result = await this.ctx.model.query(sql_string, {
                type: this.ctx.model.Sequelize.QueryTypes.SELECT,
                replacements: {
                    Id: Id
                },
            });
           
            return result[0];
        } catch (err) {
            throw err;
        }
    }

    async editFieldsById(fields, Id) {
        const sets = []
        for (const key in fields) {
            if (!fields.hasOwnProperty(key)) continue
            const value = fields[key]
            sets.push(`member_reservation.${key} = "${value}"`)
        }
        const sql = `update 
        member_reservation 
        set ${sets.join(`,
        `)}
        where member_reservation.Id = :Id`
        try {
            const result = await this.ctx.model.query(sql, {
                type: this.ctx.model.Sequelize.QueryTypes.UPDATE,
                replacements: { Id }
            })
            return result;
        } catch (err) {
            throw err;
        }
    }
}

module.exports = MemberReservationExpand;
