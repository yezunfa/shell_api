'use strict';

/**
 * ChinaService
 * useage: ctx.service.china
 */
const { generatePassword } = require('../utils/security');

const Service = require('egg').Service;
const moment = require('moment')

class Coach extends Service {

    /**
     * 
     * @param {*} query 
     */
    async getCoachSchedule(query) {
        const { coachid, date, type } = query
        let conditions_date = date ? `and to_days(course_schedule.Date) = to_days("${date}")` : ''
        let sql_string = ''
        if (!type) { // 没有传type则获取全部类型的课程
            sql_string = `
                select * from (
                    select 
                        course_schedule.Id, 
                        course_schedule.Name, 
                        store.Name as StoreName,
                        member_reservation.StartTime, 
                        member_reservation.EndTime,
                        member_reservation.Id as ReservationId, 
                        if(isnull(t2.ReservationNum),0,t2.ReservationNum) as ReservationNum, 
                        course_schedule.Limted
                    from member_reservation
                    left join course_schedule
                        on course_schedule.Id = member_reservation.CourseScheduleId
                    left join course_type
                        on course_type.Id = course_schedule.TypeId
                    left join store
                        on course_schedule.StoreId = store.Id
                    left join (
                            select 
                                member_reservation.CourseScheduleId, 
                                count(*) as ReservationNum    
                            from member_reservation
                            where member_reservation.state in (1,2) 
                            group by member_reservation.CourseScheduleId
                        ) as t2 
                        on t2.CourseScheduleId = course_schedule.Id
                    where 
                        course_schedule.CoachId = "${coachid}"
                        and member_reservation.State in (1, 2)
                        ${conditions_date}
                        and course_type.ParentId = 1
                    union all
                    select 
                        course_schedule.Id, 
                        course_schedule.Name,
                        store.Name  as  StoreName, 
                        course_schedule.StartTime, 
                        course_schedule.EndTime, 
                        null as ReservationId, 
                        if(isnull(t3.ReservationNum),0,t3.ReservationNum) as ReservationNum, 
                        course_schedule.Limted
                    from course_schedule
                    left join course_type
                        on course_type.Id = course_schedule.TypeId
                    left  join  store                                                   
                        on  course_schedule.StoreId  =  store.Id  
                    left join (
                            select 
                                member_reservation.CourseScheduleId, 
                                count(*) as ReservationNum 
                            from member_reservation
                            where member_reservation.state in (1,2)
                            group by member_reservation.CourseScheduleId
                        ) as t3
                        on t3.CourseScheduleId = course_schedule.Id
                    where course_schedule.CoachId = "${coachid}"
                    ${conditions_date}
                    and course_type.ParentId != 1
                ) as t1
                order by t1.StartTime asc
            `
        } else if (parseInt(type) === 1) { // 如果是私教课
            sql_string = `
                select 
                    course_schedule.Id, 
                    course_schedule.Name,
                    store.Name  as  StoreName, 
                    member_reservation.StartTime, 
                    member_reservation.EndTime,
                    member_reservation.Id as ReservationId, 
                    if(isnull(t2.ReservationNum),0,t2.ReservationNum) as ReservationNum, 
                    course_schedule.Limted
                from member_reservation
                left join course_schedule
                    on course_schedule.Id = member_reservation.CourseScheduleId
                left join course_type
                    on course_type.Id = course_schedule.TypeId
                left  join  store                                                   
                     on  course_schedule.StoreId  =  store.Id 
                left join (
                        select 
                            member_reservation.CourseScheduleId, 
                            count(*) as ReservationNum
                        where member_reservation.state in (1,2) 
                        from member_reservation
                        group by member_reservation.CourseScheduleId
                    ) as t2 
                    on t2.CourseScheduleId = course_schedule.Id
                where 
                    course_schedule.CoachId = "${coachid}"
                    and member_reservation.State in (1, 2)
                    ${conditions_date}
                    and course_type.ParentId = 1
                order by member_reservation.StartTime asc`
        } else { // 其他课程
            sql_string = `
                select 
                    course_schedule.Id, 
                    course_schedule.Name, 
                    store.Name  as  StoreName,
                    course_schedule.StartTime, 
                    course_schedule.EndTime, 
                    null as ReservationId, 
                    if(isnull(t3.ReservationNum),0,t3.ReservationNum) as ReservationNum, 
                    course_schedule.Limted
                from course_schedule
                left join course_type
                    on course_type.Id = course_schedule.TypeId
                left  join  store                                                   
                    on  course_schedule.StoreId  =  store.Id
                left join (
                        select 
                            member_reservation.CourseScheduleId, 
                            count(*) as ReservationNum 
                        from member_reservation
                        where member_reservation.state in (1,2)
                        group by member_reservation.CourseScheduleId
                    ) as t3
                    on t3.CourseScheduleId = course_schedule.Id
                where course_schedule.CoachId = "${coachid}"
                ${conditions_date}
                and course_type.ParentId = ${type}
                order by course_schedule.StartTime asc`
        }
        try {
            const result = await this.ctx.model.query(sql_string, {
                type: this.ctx.model.Sequelize.QueryTypes.SELECT
            })
            return result.dataValues || result;
        } catch (err) {
            throw err;
        }
    }

    /**
     * 
     */
    async validate(mobile, password) {
        let sql_string = `select 
        sys_user.*, store.Name as StoreName from sys_user
        left join store
        on store.Id = sys_user.StoreId
        where  sys_user.Valid = 1
        and  sys_user.Password = :Password
        and  sys_user.Mobile = :Mobile`
        // console.log( generatePassword(mobile, password))
        try {
            const result = await this.ctx.model.query(sql_string, {
                type: this.ctx.model.Sequelize.QueryTypes.SELECT,
                replacements: {
                    Mobile: mobile,
                    Password: generatePassword(mobile, password)
                }
            })
            return result.dataValues || result;
        } catch (err) {
            throw err;
        }
    }

    /**
     * 
     */
    async getCourseType(type = "default") {
        let sql_string = `select * from course_type
            where Valid = 1
            and ParentId is null
            ${type === "default" ? "and State = 1" : ""}`
        try {
            const result = await this.ctx.model.query(sql_string, {
                type: this.ctx.model.Sequelize.QueryTypes.SELECT
            })
            return result.dataValues || result;
        } catch (err) {
            throw err;
        }
    }

     /**
     * 
     */
    async getPrivateRervation({coachid, date}) {
        let sql_string = `
            select member_reservation.* from member_reservation
            left join course_schedule
            on course_schedule.Id = member_reservation.CourseScheduleId
            left join course_type
            on course_schedule.TypeId = course_type.Id
            where to_days(course_schedule.Date) = to_days("${date}")
            and course_schedule.CoachId = "${coachid}"
            and course_type.ParentId = 1
            and member_reservation.State = 1
        `
        try {
            const result = await this.ctx.model.query(sql_string, {
                type: this.ctx.model.Sequelize.QueryTypes.SELECT
            })
            return result.dataValues || result;
        } catch (err) {
            throw err;
        }
    }

    /**
     * e8f1a8da-6b85-46d6-82c1-935dfd67c818
     * @param {*} coachid 
     *  查询客户订单金额，并根据amount排名
     */
    async getCoachClient(coachid, orderby = 'normal') {
        const { ctx } = this

        const ordermap = {
            normal: '',
            lesson: 'order by Blance desc',
            gender: 'order by Sex',
            expire: 'order by ExpireDate ',
            amount: 'order by ReservationCount desc' // 'order by payAmount desc',
        }

        const sql = `select 
        member.Id,
        card.Id as cardId,
        card.Name as CardName,
        member.Sex,
        member.Name,
        member.Avatar,
        member.NickName,
        cardPackage.Blance,
        card_deadline.ExpireDate,
        invite_state.Id as Desabled,
        ifnull (reservation_count.Number, 0) as ReservationCount
        from member
        left join (select 
            order_main.UserId,
            count(order_main.UserId) as Number
            from order_main
            left join order_sub
            on order_sub.OrderId = order_main.Id
            left join member_reservation
            on member_reservation.Id = order_sub.ReservationId
            left join course_schedule
            on course_schedule.Id = member_reservation.CourseScheduleId
            
            where order_main.type = 4
            and order_main.PayState = 1
            and course_schedule.CoachId = '${coachid}'
            group by order_main.UserId
        ) as reservation_count on reservation_count.UserId = member.Id
            
        left join (select 
            card.UserId,
            card.ExpireDate
            from card
            where card.Type = 1
            group by card.UserId
            order by card.ExpireDate
        ) as card_deadline on card_deadline.UserId = member.Id
        left join card on member.Id = card.UserId
       
        left join (select 
            member_coach_invite.Id,
            member_coach_invite.UserId
            from member_coach_invite
            where member_coach_invite.State = 0
            and member_coach_invite.SysUserId = '${coachid}'
            group by member_coach_invite.UserId
        ) as invite_state on invite_state.UserId = member.Id

		left join (
			select 
			sum(card.Blance) as Blance,
			card.ParentId
			from card
			left join order_sub on card.OrderSubId = order_sub.Id
			where card.Type = 3
			and order_sub.CoachId = '${coachid}'
			group by card.ParentId, card.UserId
		)cardPackage on cardPackage.ParentId = card.Id
		
        where member.Id in (select 
            card.UserId from card 
            left join order_sub on card.OrderSubId = order_sub.Id
            where order_sub.CoachId = '${coachid}'
            group by card.UserId
        )
        and card.Type = 1
        group by member.Id
        ${ordermap[orderby]}
        `

        // left join (select 
        //     order_main.UserId,
        //     sum(order_main.Amount) as payAmount 
        //     from order_main
        //     group by order_main.UserId
        // ) as member_payment 
        // on member_payment.UserId = member.Id
        // member_payment.payAmount

        try {
            const type = ctx.model.Sequelize.QueryTypes.SELECT
            const result = await ctx.model.query(sql, { type, rows: true })
            return result;
        } catch (err) {
            throw err;
        }
    }

    /**
     * 
     */
    async getCoachStatistics({coachid, date}) {
        let sql_date = ''
        if (date) {
            sql_date = `
                and year(course_schedule.EndTime) = ${moment(date).format('YYYY')} 
                and month(course_schedule.EndTime) = ${moment(date).format('MM')} 
            `
        }
        let sql_string = `
            select count(*) as num from member_tracking
            where member_tracking.SysUserId = "${coachid}"
            union all
            select sum(TIMESTAMPDIFF(MINUTE,course_schedule.StartTime,course_schedule.EndTime)) as duration 
            from course_schedule
            where course_schedule.CoachId = "${coachid}"
            ${sql_date}
            union all
            select count(*) from course_schedule
            where course_schedule.CoachId = "${coachid}"
            ${sql_date}
            union all
            select count(*) from course_schedule
            where course_schedule.CoachId = "${coachid}"
            union all
            select sum(TIMESTAMPDIFF(MINUTE,course_schedule.StartTime,course_schedule.EndTime)) as duration 
            from course_schedule
            where course_schedule.CoachId = "${coachid}"
            union all
            select count(*) from (select member_reservation.* from member_reservation
            left join course_schedule
            on member_reservation.CourseScheduleId = course_schedule.Id
            where member_reservation.Valid = 1
            and course_schedule.CoachId = "${coachid}"
            group by member_reservation.UserId) as history
        `
        try {
            const result = await this.ctx.model.query(sql_string, {
                type: this.ctx.model.Sequelize.QueryTypes.SELECT
            })
            return result.dataValues || result;
        } catch (err) {
            throw err;
        }
    }

    /**
     * 获取教练排课备忘
     * @param {*} coachid 
     */
    async getMemo(coachid) {
        let sql_string = `select 
        distinct course_schedule.Date from course_schedule 
        where course_schedule.Valid = 1
        and course_schedule.CoachId = "${coachid}"
        order by course_schedule.Date`
        try {
            const result = await this.ctx.model.query(sql_string, {
                type: this.ctx.model.Sequelize.QueryTypes.SELECT
            })
            return result.dataValues || result;
        } catch (err) {
            throw err;
        }
    }
}

module.exports = Coach;
