'use strict';
const Service = require('egg').Service;

/**
 * MemberExpandService
 * useage: ctx.service.PlaceOrderService
 * auther by mango
 */
class PlaceOrderService extends Service {
    /**
     * 获取排课详情
     */
    async CourseScheduleDetail(CourseScheduleId) {
        try {
            const sql = `select course_schedule.Id, course_schedule.Date, course_schedule.State,
            course_schedule.StartTime, course_schedule.EndTime, course_schedule.Limted,
             
            course_schedule.CourseId, course.Name as CourseName, course.ReservationLimted,
            course.Price, course.StoredValuePrice, course.MemberPrice, course.CancelLimted,
            
            course_schedule.CoachId, course_schedule.CoachName, sys_user.Sex as CoachSex,
            
            course_schedule.StoreId, course_schedule.RoomId, Store.Name as StoreName,
            Store.Address, Store.AddressEN,
            
            course_schedule.TypeId, course_type.Name as TypeName,
            
            parent_type.Id as ParentId, parent_type.Name as ParentName
            
            from course_schedule
            
            left join course
            on course.Id = course_schedule.CourseId
            
            left join sys_user
            on sys_user.Id = course_schedule.CoachId
            
            left join store
            on store.Id = course_schedule.StoreId
            
            left join course_type
            on course_type.Id = course_schedule.TypeId
            
            left join course_type as parent_type
            on parent_type.Id = course_type.ParentId
            
            where course_schedule.Id = "${CourseScheduleId}" 
            and (
                course_schedule.Valid = 1
                or (
                    course_schedule.Valid = 0 
                    and course_schedule.State = 2
                )
            )`

            const result = await this.ctx.model.query(sql,{
                type: this.ctx.model.Sequelize.QueryTypes.SELECT,
            })

            return result[0]
        } catch (error) {
            throw new Error(error)
        }
        
    }

    /**
     * 课程预约记录
     * @param {*} param0 
     */
    async CourseScheduleReservation(options, isPrivate) {
        const { CourseScheduleId, StartTime, EndTime, CoachId } = options

        const schedulecheck = `and member_reservation.CourseScheduleId = "${CourseScheduleId}"`

        const timecheck = `and ((
            member_reservation.StartTime <= "${StartTime}" 
            and 
            member_reservation.EndTime > "${StartTime}"
        )
        or ( 
            member_reservation.StartTime < "${EndTime}" 
            and 
            member_reservation.EndTime >= "${EndTime}" 
        ))`

        const coachcheck = `and course_schedule.CoachId = "${CoachId}"`

        const sql = `select member_reservation.* 
        from member_reservation
        left join course_schedule
        on course_schedule.Id = member_reservation.CourseScheduleId
        where member_reservation.Valid = 1
        ${isPrivate ? coachcheck : '' }
        ${isPrivate ? timecheck : schedulecheck }`
        try {
            if (isPrivate && !CoachId) throw new Error('参数错误')
            if (!isPrivate && !CourseScheduleId) throw new Error('参数错误')
            const result = await this.ctx.model.query(sql,{
                type: this.ctx.model.Sequelize.QueryTypes.SELECT,
            })

            return result
        } catch (error) {
            throw new Error(error)
        }
    }

    /**
     * 校验是否重复预约
     */
    async CheckRepeatReservation({UserId, CourseScheduleId}) {
        const sql = `select member_reservation.* 
        from member_reservation
        where member_reservation.Valid = 1
        and member_reservation.UserId = "${UserId}"
        and member_reservation.CourseScheduleId = "${CourseScheduleId}"`
        try {
            const result = await this.ctx.model.query(sql,{
                type: this.ctx.model.Sequelize.QueryTypes.SELECT,
            })
            return result
        } catch (error) {
            throw new Error(error)
        }
    }
}

module.exports = PlaceOrderService
