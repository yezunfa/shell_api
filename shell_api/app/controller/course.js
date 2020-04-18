'use strict';

const Controller = require('egg').Controller;
const uuid = require('uuid')
const moment = require('moment')
const { handlelTableParams } = require('../utils/format-mango');

class Course extends Controller {
    async getCoachScheduling() {
        const { ctx } = this
        const { date: $eq_toDays, coachid: SysUserId } = ctx.query

        try {
            const $query = { SysUserId, StartTime: {$eq_toDays} }
            const $pagination = { disabled: true }
            const $sort = [['CreateTime', 'asc']]
            const { dataList: datalist } = await ctx.service.sysUserDutyRoster.search({$pagination, $sort, $query})
            ctx.body = {
                success: true,
                code: 200,
                message: `get ${datalist.length} pieces of data`,
                data: { datalist }
            }
        } catch (error) {
            console.error(error)
            ctx.logger.error(error)
            ctx.body = {
                success: false,
                code: 500,
                message: error,
            }
        }
    }

    /**
     * 获取排课表
     */
    async getCoachSchedule() {
        const ctx = this.ctx
        const { date, coachid } = ctx.query
        try {
            const entity = await ctx.service.courseExpand.getCoachSchedule({ date, coachid })
            ctx.body = {
                success: true,
                code: 200,
                message: `get ${entity.length} pieces of data`,
                data: {
                    total: entity.length,
                    totalPage: 1, // 总页数
                    pageSize: null, // 分页标准
                    currentPage: 1, // 当前所在页数（从1开始）
                    datalist: entity
                }
            }
        } catch (error) {
            console.error(error)
            ctx.logger.error(error)
            ctx.body = {
                success: false,
                code: 444,
                message: `${error}`,
            }
        }
    }

    async getTrainingSchdule() {
        const { ctx } = this
        let { $sort, $query, $pagination } = {}

        try {
            ({ $sort, $query, $pagination } = handlelTableParams(ctx.query, {
                $sort: [
                    ['CreateTime', 'desc']
                ],
                $query: {
                    Valid: 1
                },
                $pagination: {
                    current: 1,
                    pageSize: 10,
                    disabled: false
                }
            }))
        } catch (error) {
            const code = 500
            const success = false
            const message = error.message || error
            ctx.logger.error(message);
            ctx.body = { success, message, code }
            return false
        }

        try {
            const data = await ctx.service.trainScheduleUser.searchSchedule({$pagination, $query, $sort})
            const success = true
            const code = 200

            data.totalPage = Math.ceil(data.total / data.pageSize)
            ctx.body = { success, code, data }
            return true
        } catch (error) {
            const code = 500
            const success = false
            const message = "服务异常"
            ctx.logger.error(error.message || error);
            ctx.body = { success, message, code }
            return false
        }
    }

    
    /**
     * 获取一条trainScheduleUser记录详情
     */
    async getByApi() {
        const ctx = this.ctx
        const { Reservationid, userid } = ctx.query
        
        try {
            if (!Reservationid) {
                this.ctx.body = {
                    success: false,
                    message: "参数不完整"
                }
                return;
            }

            let entity = null;
            try {
                entity = await this.ctx.service.trainScheduleUser.getById({Reservationid,userid});
            } catch (ex) {
                this.ctx.logger.error('trainScheduleUser.getByApi调用异常/trainScheduleUser.getById', ex);
                this.ctx.body = {
                    success: false,
                    message: ex.message,
                    data: entity
                }
                return;
            }

            // entity = this.ctx.formatEntiy(entity, 'train_schedule_user')
            this.ctx.body = {
                success: true,
                code: 200,
                data: entity
            }
        } catch (ex) {
            this.ctx.logger.error('trainScheduleUser.getByApi调用异常/formatEntiy', ex);
            this.ctx.body = {
                success: false,
                code: 500,
                message: ex.message
            }
        }

    }

    /**
     * 获取教练信息
     */
    async getCoachInfo() {
        const ctx = this.ctx
        const { coachid } = ctx.query
        // let { conditions } = ctx.query
        // conditions = conditions ? conditions.split(',') : []
        try {
            const entity = await ctx.service.courseExpand.getCoachInfo(coachid)
            ctx.body = {
                success: true,
                code: 200,
                message: `1`,
                data: entity[0]
            }
        } catch (error) {
            console.error(error)
            ctx.logger.error(error)
            ctx.body = {
                success: false,
                code: 444,
                message: `${error}`
            }
        }
    }

    /**
     * 获取排课课程信息
     */
    async getCourseScheduleInfo() {
        const ctx = this.ctx
        const { courseid, coursescheduleid } = ctx.query
        try {
            const entity = await ctx.service.courseExpand.getCourseScheduleInfo(courseid || coursescheduleid)
     
            ctx.body = {
                success: true,
                code: 200,
                message: `1`,
                data: entity[0]
            }
        } catch (error) {
            console.error(error)
            ctx.logger.error(error)
            ctx.body = {
                success: false,
                code: 444,
                message: `${error}`
            }
        }
    }

    /**
     * 获取座位预约信息
     */
    async getReservationSeating() {
        const ctx = this.ctx
        const { courseid } = ctx.query
        try {
            const entitylist = await ctx.service.courseExpand.getReservationSeating(courseid)
            ctx.body = {
                success: true,
                code: 200,
                message: `1`,
                data: {
                    datalist: entitylist
                }
            }
        } catch (error) {
            console.error(error)
            ctx.logger.error(error)
            ctx.body = {
                success: false,
                code: 444,
                message: `${error}`
            }
        }
    }

    /**
     * 
     */
    async getInviteInfo() {
        const ctx = this.ctx
        const { userid } = ctx.query
        try {
            const entitylist = await ctx.service.courseExpand.getInviteInfo(userid)
            ctx.body = {
                success: true,
                code: 200,
                message: `1`,
                data: {
                    datalist: entitylist
                }
            }
        } catch (error) {
            console.error(error)
            ctx.logger.error(error)
            ctx.body = {
                success: false,
                code: 444,
                message: `${error}`
            }
        }
    }

    /**
     * 获取教练责任课程列表
     */
    async CourseTypeId() {
        const { ctx } = this
        const { storeid, currentType } = ctx.query
        try {

            const entitylist = await ctx.service.courseExpand.getCoachList(storeid, currentType)
            ctx.body = {
                success: true,
                code: 200,
                message: `1`,
                data: {
                    datalist: entitylist
                }
            }
        } catch (error) {
            console.error(error)
            ctx.logger.error(error)
            ctx.body = {
                success: false,
                code: 444,
                message: `${error}`
            }
        }
    }

    /**
     * 
     */
    async getCourseDetail() {
        const ctx = this.ctx
        const { courseid } = ctx.query
        try {
            const data = await ctx.service.courseExpand.getCourseDetail(courseid)
            ctx.body = {
                success: true,
                code: 200,
                data
            }
        } catch (error) {
            console.error(error)
            ctx.logger.error(error)
            ctx.body = {
                success: false,
                code: 444,
                message: `${error}`
            }
        }
    }

    /**
     * 获取课程发票信息
     */
    async getInvoice() {
        const ctx = this.ctx
        const { reservationid } = ctx.query
        try {
            const entity = await ctx.service.courseExpand.getInvoice(reservationid)
            ctx.body = {
                success: true,
                code: 200,
                message: `get invoice`,
                data: entity[0]
            }
        } catch (error) {
            console.error(error)
            ctx.logger.error(error)
            ctx.body = {
                success: false,
                code: 444,
                message: `${error}`
            }
        }
    }

    /**
     * 获取课程预约学员
     */
    async getCourseMember() {
        const ctx = this.ctx
        const { coursescheduleid, StartTime, EndTime } = ctx.query
        try {
            const entitylist = await ctx.service.courseExpand.getCourseMember(coursescheduleid, StartTime, EndTime)
            ctx.body = {
                success: true,
                code: 200,
                message: `get invoice`,
                data: {
                    datalist: entitylist
                }
            }
        } catch (error) {
            console.error(error)
            ctx.logger.error(error)
            ctx.body = {
                success: false,
                code: 444,
                message: `${error}`
            }
        }
    }

    /**
     * 
     */
    async setPrivateSchedule() {
        const ctx = this.ctx
        const { coachid } = ctx.query
        const { timelist } = ctx.request.body
        const time_list = JSON.parse(timelist)
        try {
            const coach_info = await ctx.service.courseExpand.getCoachInfo(coachid)
            if (!(coach_info && coach_info.length)) {
                ctx.body = {
                    code: 500,
                    success: false,
                    message: '排期失败, 您没有默认课程',
                }
                return
            }
            const { CourseTypeId, CourseName, CourseEnname, CourseId, StoreId, Id, Name, NickName } = coach_info[0]
            if (!time_list.length) {
                ctx.body = {
                    code: 420,
                    success: false,
                    message: '排期失败',
                    data: `timelist 必须为长度大于一的数组`
                }
                return
            }
            const { StartTime: Dates } = time_list[0] 
            // 校验课程是否已被预约
            // 默认课程：CourseTypeId是否必须绑定呢？todo
            const check = await ctx.service.courseExpand.checkScheduleStatus({Dates, CourseTypeId, CoachId: coachid})

            let ifTimeContain = 1
            let BeforeTime = ''
            let AfterTime = ''
            
            if (check && check.length) {
                for (const item of time_list) {
                    const { StartTime, EndTime } = item
                    const ChooseStartTime = moment(StartTime).format('YYYY-MM-DD HH:mm')
                    const ChooseEndTime = moment(EndTime).format('YYYY-MM-DD HH:mm')

                   for(const item1 of check){
                    const {StartTime:startTime, EndTime:endTime } = item1
                    // 直接取出开始结束时间会有格式错误，必须统一格式，取出数据如下：StartTime: 2020-01-13T12:30:00.000Z,EndTime: 2020-01-13T13:30:00.000Z,

                    BeforeTime  = moment(startTime).format('YYYY-MM-DD HH:mm')
                    AfterTime = moment(endTime).format('YYYY-MM-DD HH:mm')

                    const $Timein = (moment(BeforeTime).isBetween(ChooseStartTime,ChooseEndTime) || moment(BeforeTime).isSame(ChooseStartTime)) && 
                                (moment(AfterTime).isBetween(ChooseStartTime,ChooseEndTime) || moment(AfterTime).isSame(ChooseEndTime))
                    if (!$Timein)  ifTimeContain = 0
                    
                   }
                }
                if (ifTimeContain === 0) {
                    ctx.body = {
                        code: 500,
                        success: false,
                        message: `${moment(BeforeTime).format('HH:mm')}-${moment(AfterTime).format('HH:mm')}已有会员预约，排期须加上`
                    }
                    return
                }
            }

            // 删除当天排课记录重新排课
            await ctx.service.courseExpand.deleteSchedule({Dates, CourseTypeId, CoachId: coachid})
            // 重新添加当天的排课表
            for (const item of time_list) {
                const { StartTime, EndTime } = item
                const result = await ctx.service.sysUserDutyRoster.create({
                    Id: uuid.v4(),
                    SysUserId: Id,
                    StartTime,
                    EndTime,
                    State: 1,
                    Type: 1,
                    CreateTime: new Date(),
                    CreatePerson: Id
                })
            }
            ctx.body = {
                code: 200,
                success: true,
                message: '已提交排期'
            }
        } catch (error) {
            console.error(error)
            ctx.logger.error(error)
            ctx.body = {
                code: 420,
                success: false,
                message: '排期失败',
                data: JSON.stringify(error) || error
            }
        }
    }

    async searchschedule(){
        const { ctx } = this
        const { Dates, CourseIds } = ctx.params
        try {
            const CourseList = JSON.parse(CourseIds)
            const datalist = await ctx.service.courseSchedule.getScheduleInfo({ Dates }, CourseList)
            ctx.body = {
                success: true,
                code: 200,
                data: {
                    datalist
                }
            }
        } catch (error) {
            console.error(error)
            ctx.logger.error(error)
            ctx.body = {
                code: 500,
                success: false,
                message: '失败',
                data: JSON.stringify(error)
            }
        }
    }

    async newCourseSchedule() {
        const { ctx } = this
        const { StartTime, EndTime, CourseId, CoachId } = ctx.request.body
        const { userid: CreatePerson } = ctx.query
        const Id = uuid.v4()
        const State = 2
        const Valid = 0
        const CreateTime = new Date()
        try {
            if (!(StartTime && EndTime && CourseId && CoachId)) throw new Error("参数错误")

            const result = await ctx.service.placeOrder.CourseScheduleReservation({ 
                CoachId,
                StartTime: moment(StartTime).format('YYYY-MM-DD HH:mm:ss'), 
                EndTime: moment(EndTime).format('YYYY-MM-DD HH:mm:ss')
            }, true)
            if (result.length) throw new Error("您选择的时段已被占用")

            const coach = await ctx.service.courseExpand.getCoachInfo(CoachId)
            if (!coach || !coach.length)  throw new Error("找不到此教练")
            const { Name: CoachName, NickName: CoachNickName } = coach[0]
            

            const course = await ctx.service.courseExpand.getCourseDetail(CourseId)
            if (!course)  throw new Error("找不到此课程")
            const { CourseName: Name, CourseEnName: EnName, TypeId, StoreId, Duration, Limted, RoomId } = course
            
            const newEntity = { 
                Id, Duration, Limted, State, CreateTime, CreatePerson,
                CourseId,  Name, EnName, StoreId, TypeId, RoomId,
                CoachId, CoachName, CoachNickName, Valid, StartTime, EndTime,
                Date: moment(StartTime, 'YYYY-MM-DD HH:mm').format('YYYY-MM-DD')
            } 

            await ctx.service.courseSchedule.create(newEntity)
            ctx.body = {
                success: false,
                code: 200,
                data: {
                    coursescheduleid: Id
                },
                message: "已申请排课"
            }
        } catch (error) {
            console.error(error)
            ctx.logger.error(error)
            ctx.body = {
                success: false,
                code: 500,
                message: error.message || error || "服务异常，请刷新重试"
            }
        }
    }
 }

module.exports = Course;