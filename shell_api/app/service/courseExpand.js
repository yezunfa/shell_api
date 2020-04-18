'use strict';

/**
 * weapp page_home service
 * useage: ctx.service.weapp.page.home
 */
const Service = require('egg').Service;
const moment = require('moment')

class CourseExpand extends Service {
    async getCoachScheduling({ date, coachid }) {
        const sql = `select * 
        from sys_user_duty_roster
        where sys_user_duty_roster.SysUserId = "${coachid}"
        and to_days(sys_user_duty_roster.StartTime) = to_days("${date}")`
        try {
            const result = await this.ctx.model.query(sql, {
                type: this.ctx.model.Sequelize.QueryTypes.SELECT
            })
            return result.dataValues || result;
        } catch (err) {
            throw err;
        }
    }

    /**
     * todo sql_helper
     * get weapp user homeinfo
     * @return {Object} entity a model Entity
     */
    async getCoachSchedule(queries) {
        const { date, coachid } = queries
        const sql_string = `select course_schedule.Id, course_schedule.Name, course_schedule.EnName,
            course_schedule.StartTime, course_schedule.EndTime, course_schedule.Difficult,
            course_schedule.State, course_schedule.CoachId, course_schedule.CoachName,
            course_schedule.CoachNickName, sys_user.Photo as CoachPhoto, course.Price,
            course.StoredValuePrice, course.MemberPrice, course_type.Name as TypeName,
            group_concat(label.Name) as Label
            from course_coach
            left join sys_user
            on sys_user.Id = course_coach.CoachId
            left join course 
            on course.Id = course_coach.CourseId
            left join course_type 
            on course_type.Id = course.TypeId
            left join course_schedule
            on course_schedule.CourseId = course_coach.CourseId
            left join course_label 
            on course_label.CourseId = course_coach.CourseId
            left join label 
            on label.Id = course_label.LabelId
            where course_coach.Default = 1
            and course_schedule.Valid = 1 
            and course_coach.CoachId = "${coachid}"
            and to_days(course_schedule.Date) = to_days("${date}")`
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
     * Note: sql中course_type使用了右联，这将导致教练未关联私教课程前无法获取数据
     */
    async getCoachInfo(coachid) {
        const sql = `select 
        sys_user.Id, sys_user.Photo, sys_user.Name, sys_user.NickName,
        role.Name as RoleName, sys_user.Introdution, sys_user.Sex, 
        course.Id as CourseId, course.Name as CourseName, 
        course.EnName as CourseEnname, course.TypeId as CourseTypeId, 
        course.Price, course.MemberPrice, sys_user.StoreId,
        store.Name as StoreName, store.Address, store.AddressEN,
        group_concat(role.Id) as RoleIds,
        group_concat(role.Name) as RoleNames
        from sys_user
        left join course_coach
        on course_coach.CoachId = sys_user.Id
        left join course 
        on course.Id = course_coach.CourseId
        left join store
        on sys_user.StoreId = store.Id
        left join course_type 
        on course_type.Id = course.TypeId
        left join (select 
        		sys_role_sys_user.SysRoleId as Id,
        		sys_role_sys_user.SysUserId, 
            sys_role.Name, sys_role_sys_user.Valid
            from sys_role_sys_user
            left join sys_role
            on sys_role.Id = sys_role_sys_user.SysRoleId
        ) as role
        on role.SysUserId = sys_user.Id
        where sys_user.Valid = 1
        and role.Valid = 1
      
        and sys_user.Id = "${coachid}"
        group by sys_user.Id`
        //   and (course_coach.Default = 1 or course_coach.Default is null)
        try {
            const result = await this.ctx.model.query(sql, {
                type: this.ctx.model.Sequelize.QueryTypes.SELECT
            })
            return result.dataValues || result;
        } catch (err) {
            throw err;
        }
    }

    /**
     * 
     * @param {*} courseid 
     */
    async getCourseScheduleInfo(courseid) {
        let sql_string = `
            select course_schedule.Id, course_schedule.TypeId, course_schedule.Name, course_schedule.EnName, course_schedule.Date, 
            sys_user.Name as CoachName, sys_user.NickName as CoachNichName, sys_user.Avatar as CoachAvatar, sys_user.Photo as CoachPhoto,
            course.Price, course.StoredValuePrice, course.MemberPrice, course.Seating, course_schedule.StartTime, course_schedule.EndTime, 
            store.Id as StoreId, store.Name as StoreName ,course_schedule.Limted, 
            course_schedule.RoomId, course_schedule.State, course_schedule.Difficult,course_type.ParentId as TypeId
            from course_schedule
            left join sys_user
            on sys_user.Id = course_schedule.CoachId
            left join store
            on store.Id = course_schedule.StoreId
            left join course
            on course.Id = course_schedule.CourseId
            left join course_type
            on course_schedule.TypeId = course_type.Id
            where course_schedule.id = "${courseid}"
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
     * 
     * @param {*} courseid 
     */
    async getReservationSeating(courseid) {
        let sql_string = `
            select member_reservation.Seat, member_reservation.UserId, member.NickName as UserNickName,
            member.Avatar, member_reservation.State
            from member_reservation
            left join member
            on member.Id = member_reservation.UserId
            where member_reservation.Valid = 1
            and member_reservation.CourseScheduleId = "${courseid}"
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
     * 获取教练邀约列表
     * @param {*} userid 
     */
    async getInviteInfo(userid) {
        let sql_string = `select 
        member_coach_invite.Id as InviteId,
        member_coach_invite.SysUserId as CoachId,
        member_coach_invite.InviteDate, 
        sys_user.Name as CoachName,  
        sys_user.NickName as CoachNickName, 
        sys_user.Photo as CoachPhoto, 
        course.Name as CourseName, 
        store.Name as StoreName, 
        member_coach_invite.State
        from member_coach_invite
        left join (select
            course_coach.CoachId,
            course_coach.CourseId 
            from course_coach
            where course_coach.Default = 1
        ) as default_course
        on default_course.CoachId = member_coach_invite.SysUserId
        left join course
        on course.Id = default_course.CourseId
        left join sys_user
        on member_coach_invite.SysUserId = sys_user.Id
        left join store
        on store.Id = course.StoreId
        where member_coach_invite.Valid = 1
        and member_coach_invite.UserId = "${userid}"`
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
     * 获取教练责任课程
     */
    async getCoachList(storeid, currentType, dates) {
        let sql_string = `select 
        sys_user.Id, 
        sys_user.Photo,
        sys_user.Avatar,
        sys_user.Name, 
        sys_user.NickName, 
        course.Id as CourseId,
        course.Name as CourseName,
        course.EnName as CourseEnName,
        course.Price, 
        course.MemberPrice,
        sys_user_duty_roster.Id as Appointable
        from course_coach
        left join course
        on course.Id = course_coach.CourseId
        left join (select 
            course_type.Id, 
            parent_type.Id as ParentTypeId
            from course_type as parent_type
            left join course_type
            on course_type.ParentId = parent_type.Id
            where course_type.ParentId is not null
        ) as course_type
        on course_type.Id = course.TypeId
        left join sys_user
        on sys_user.Id = course_coach.CoachId
        left join ( select * 
        	from sys_user_duty_roster
        	where to_days(sys_user_duty_roster.StartTime) = to_days("${dates}")
        	group by sys_user_duty_roster.SysUserId 
        ) as sys_user_duty_roster
        on sys_user.Id = sys_user_duty_roster.SysUserId
        where sys_user.Valid = 1
        and course_type.ParentTypeId = "${currentType}"
        and course.StoreId = "${storeid}"
        order by Appointable desc`
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
    async getCourseDetail(courseid) {
        let sql_string = `select course.Id as CourseId,
        course.Name as CourseName, 
        course.EnName as CourseEnName, 
        course.Summary,
        course.Seating as Seating, 
        course.Price, 
        course.StoredValuePrice, 
        course.MemberPrice, 
        course.TypeId,
        course.Limted,
        course_type.TypeName,
        course_type.MainTypeId, -- 0团课 1私教课 2特色课 3训练营
        course_type.MainTypeName,
        store.Id as StoreId,
        store.Name as StoreName, 
        store.Address, 
        store.AddressEN
        from course
        left join store on course.StoreId = store.Id
        left join (select course_type.Id, 
            course_type.Name as TypeName, 
            course_type.ParentId as MainTypeId, 
            parent_type.Name as MainTypeName  
            from course_type
            left join course_type as parent_type
            on course_type.ParentId = parent_type.Id
        ) as course_type on course_type.Id = course.TypeId
        where course.Id = "${courseid}"`
        try {
            const result = await this.ctx.model.query(sql_string, {
                type: this.ctx.model.Sequelize.QueryTypes.SELECT
            })
            return result[0] || result;
        } catch (err) {
            throw err;
        }
    }

    /**
     * 
     */
    async getInvoice(reservationid) {
        const sql_string = `select 
        member_reservation.State,
        member_reservation.SignTime,
        course_schedule.coachName, 
        course_schedule.Name, 
        course_schedule.Date, 
        course_schedule.StartTime, 
        course_schedule.EndTime, 
        store.Name as StoreName, 
        course_type.ParentId as CourseType,
        sys_user.Photo,
        sys_user.Avatar,
        ifnull(course_schedule.Difficult, 0) as Difficult
        from member_reservation
        left join course_schedule
        on member_reservation.CourseScheduleId = course_schedule.Id 
        left join course_type
        on course_schedule.TypeId = course_type.Id
        left join sys_user 
        on course_schedule.CoachId = sys_user.Id
        left join store 
        on course_schedule.StoreId = store.Id
        where member_reservation.Id = "${reservationid}"`
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
     * 获取用户当周取消次数和数据
     */
    async getUserCancel(UserId) {
        const sql_string = `
            select order_main.Id as OrderId,
            member_reservation.Id as ReservationId
            from order_main
            left join order_sub
            on order_sub.OrderId = order_main.Id
            and order_sub.ReservationId is not null
            left join member_reservation
            on member_reservation.Id = order_sub.ReservationId
            where order_main.State = 2
            and order_main.UserId = :UserId
            and week(member_reservation.StartTime) = week(now())
        ` 
        try {
            const result = await this.ctx.model.query(sql_string, {
                type: this.ctx.model.Sequelize.QueryTypes.SELECT,
                replacements: { UserId }
            });
            return result;
        } catch (error) {
            throw error;
        }
    }
    /**
     * 获取课程预约情况
     */
    async getCourseMember(coursescheduleid, StartTime, EndTime) {
        let sql_string = `
            select member.Id, member.Avatar, member.Name, member.NickName,
            member_reservation.Seat, member_reservation.State, card.Level
            from member_reservation
            left join member
            on member.Id = member_reservation.UserId
            left join card
            on card.UserId = member_reservation.UserId
            where member_reservation.CourseScheduleId = "${coursescheduleid}"
            and member_reservation.Valid = 1
            and member_reservation.State in (1, 2)
            group by member_reservation.UserId
            order by member_reservation.CreateTime desc , member_reservation.Seat
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

    async checkScheduleStatus({CoachId, Dates, CourseTypeId}) {
        const sql = `select member_reservation.* 
        from member_reservation
        left join course_schedule
        on course_schedule.Id = member_reservation.CourseScheduleId
        where course_schedule.CoachId = "${CoachId}"
        and to_days(course_schedule.Date) = to_days("${Dates}")
        -- and course_schedule.TypeId = "${CourseTypeId}" -- 判断是否为该教练的默认课程
        and member_reservation.Valid = 1`
        try {
            const result = await this.ctx.model.query(sql, {
                type: this.ctx.model.Sequelize.QueryTypes.SELECT
            })
            return result
        } catch (error) {
            throw new Error(error)
        }
    }

    async deleteSchedule({ CoachId, Dates }) {
        const sql = `delete from sys_user_duty_roster
        where sys_user_duty_roster.SysUserId = "${CoachId}"
        and to_days(sys_user_duty_roster.StartTime) = to_days("${Dates}")`
        try {
            const result = await this.ctx.model.query(sql, {
                type: this.ctx.model.Sequelize.QueryTypes.DELETE
            })
            return result
        } catch (error) {
            throw new Error(error)
        }
    }
}

module.exports = CourseExpand;