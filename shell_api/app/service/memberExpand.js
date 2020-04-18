'use strict';

/**
 * MemberExpandService
 * useage: ctx.service.memberExpand
 */
const Service = require('egg').Service;

class MemberExpandService extends Service {

    /**
     *  get a member by condtion
     * @param {String} openid condition
     * @return {Object} entity a model Entity
     */
    async getByopenid(openid) {
        if(!openid || typeof openid !== 'string') {
            throw new Error('param_openid error');
        }
        const sql_string = `
            select member.*, store.Name as StoreName from member 
            left join store
            on store.Id = member.StoreId
            where openid = "${openid}" 
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
     *  get a member by condtion
     * @param {String} openid condition
     * @return {Object} entity a model Entity
     */
    async getUserDetailById(Id) {
        let sql_string = `
            select member.*, store.Name as StoreName 
            from member 
            left join store
            on store.Id = member.StoreId
            where member.Id = "${Id}" 
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
     *  get a member by condtion
     * @return {Object} entity a model Entity
     */
    async getUserCoachHistory(userid) {
        let sql_string = `select record.* 
        from ( 
            select response.*, 1 as sort 
            from (
                select sys_user.Id, sys_user.Name, sys_user.NickName, sys_user.Photo,
                sys_user.Avatar, store.Name as StoreName        
                from member_tracking
                left join sys_user
                on sys_user.Id = member_tracking.SysUserId
                left join store
                on store.Id = sys_user.StoreId
                where member_tracking.UserId = "${userid}" 
                and member_tracking.RelationType = 1
                order by member_tracking.VaildTime desc
                limit 1
            ) as response
            union all
            select sys_user.Id, sys_user.Name, sys_user.NickName, sys_user.Photo,
            sys_user.Avatar, member_reservation.StoreName, 2 as sort
            from member_reservation
            left join course_schedule
            on course_schedule.Id = member_reservation.CourseScheduleId
            left join sys_user
            on sys_user.Id = course_schedule.CoachId
            left join member_tracking
            on member_tracking.UserId = member_reservation.UserId
            where member_reservation.UserId = "${userid}"
            and sys_user.Id != member_tracking.SysUserId
            group by sys_user.Id
        ) as record
        group by record.Id
        order by sort`
        try {
            const result = await this.ctx.model.query(sql_string,{
                type: this.ctx.model.Sequelize.QueryTypes.SELECT
            })
            return result.dataValues || result;
        } catch (err) {
            throw err;
        }
    }

    /**
     * 
     * @param {*} userid 
     */
    async getUserCardInfo(query) {
        const { userid, type } = query
        let sql_string = `select card.Id, card.Name, card.Type,card.State, card.CardNo, 
        card.CardEntityId, card.CardEntityNo, card.StoreId, store.Name as StoreName,
        card.Blance, card.BlanceGift, card.BlanceUint, card.ActiveDate, card.ExpireDate,
        StoredValue.Blance as StoredValueBlance, StoredValue.BlanceGift as StoredValueGift,
        card_level.level as CardLevel, card_level.Name as LevelName, card_level.Banner
        from card
        left join card_entity 
        on card_entity.Id = card.CardEntityId
        left join card_level 
        on card_level.Id = card.LevelId
        left join store 
        on store.Id = card.StoreId
        left join card as StoredValue 
        on StoredValue.ParentId = card.Id
        and StoredValue.Type = 2
        where card.Valid = 1
        and card.ActiveDate <= now()
        and card.ExpireDate >= now()
        and card.UserId = "${userid}"
        `
        sql_string += type ? ` and card.Type = ${parseInt(type)}` : ''
        sql_string += ' order by card.Level desc'
        try {
            const result = await this.ctx.model.query(sql_string,{
                type: this.ctx.model.Sequelize.QueryTypes.SELECT
            })
            return result.dataValues || result;
        } catch (err) {
            throw err;
        }
    }

    /**
     * 
     * @param {*} userid 
     */
    async getUserBodyInfo(userid) {
        let sql_string = `
            select * from 
            (select member_body.Height, member_body.Weight, member_body.FatTatol, member_body.Bones, member_body.BIM, member_body.HeartRate, member_body.BloodPressure, member_body.Thign, member_body.Arm, member_body.Waist, member_body.Hipline, member_body.WHR, member_body.FatTop, member_body.FatThgin, member_body.FatAbdomen
            from member_body
            where member_body.Type = 0
            and member_body.UserId = "${userid}"
            order by member_body.Date asc
            limit 0, 1) as table1
            union all
            select * from 
            (select member_body.Height, member_body.Weight, member_body.FatTatol, member_body.Bones, member_body.BIM, member_body.HeartRate, member_body.BloodPressure, member_body.Thign, member_body.Arm, member_body.Waist, member_body.Hipline, member_body.WHR, member_body.FatTop, member_body.FatThgin, member_body.FatAbdomen 
            from member_body
            where member_body.Type = 1
            and member_body.UserId = "${userid}"
            order by member_body.Date asc
            limit 0, 1) as table2
        `
        try {
            const result = await this.ctx.model.query(sql_string,{
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
    async getUserCoupon(userid) {
        let sql_string = `select 
        member_coupon.Id, 
        coupon.Title,
        coupon.Profile, 
        coupon.CouponType, 
        coupon.Banner,
        coupon.LimitedCourse,
        coupon.LimitedCourseType, 
        coupon.Discount, 
        member_coupon.Code,
        member_coupon.OrderId
        from member_coupon
        left join coupon
        on coupon.Id = member_coupon.CouponId
        where member_coupon.Valid = 1 
        and member_coupon.State = 1
        and member_coupon.UserId = "${userid}"
        and to_days(coupon.ExpiredDate) >= to_days(now())
        and to_days(coupon.ActiveDate) <= to_days(now())
        order by member_coupon.OrderId, member_coupon.Type`
        let course_query = (id) =>{
            return `
            select 
            course.Name 
            from course
            where course.Id = '${id}'
            `
        }
        try {
            const result = await this.ctx.model.query(sql_string,{
                type: this.ctx.model.Sequelize.QueryTypes.SELECT
            })
            const couponList = JSON.parse(JSON.stringify(result))
            if (couponList.length) {
                for (let index = 0; index < couponList.length; index++) {
                    const Coupon = couponList[index];
                    const Courses = []
                    if (typeof Coupon.LimitedCourse === 'string') {
                        const courseIds = eval(Coupon.LimitedCourse)
                        for (let index = 0; index < courseIds.length; index++) {
                            const element = courseIds[index];
                            const CourseName = await this.ctx.model.query(course_query(element),{
                                type: this.ctx.model.Sequelize.QueryTypes.SELECT
                            })
                            Courses.push(CourseName[0])
                        }
                    }
                    Coupon.Courses = Courses
                }
            }
            return couponList.dataValues || couponList;
        } catch (err) {
            throw err;
        }
    }

    /**
     * 
     */
    async getUserReservation(userid, State = "default") {
        let whereCon = ""
        switch (State) {
            case 'outofdate':
                whereCon = ` and course_schedule.EndTime < now() and member_reservation.State != 0`
                break;
            case 'notready':
                whereCon = ` and course_schedule.StartTime > now() and member_reservation.State != 0`
                break;
            default:
                break;
        }
        let sql_string = `
            select 
            parent_type.Name as TypeName, 
            parent_type.EnName as TypeEnName, 
            course_schedule.Date, 
            sys_user.Name as CoachName,
            sys_user.Photo as CoachPhoto, 
            course_schedule.Name, 
            course_schedule.EnName, 
            member_reservation.Id,
            member_reservation.State,
            course_schedule.StartTime, 
            course_schedule.EndTime, 
            group_concat(label.Name separator ',') as Label,
            course.Price, 
            course.MemberPrice, 
            course_schedule.Difficult
            from member_reservation
            left join course_schedule
            on member_reservation.CourseScheduleId = course_schedule.Id
            left join course
            on course_schedule.CourseId = course.Id
            left join sys_user
            on course_schedule.CoachId = sys_user.Id
            left join course_type
            on course.TypeId = course_type.Id
            left join course_type as parent_type
            on course_type.ParentId = parent_type.Id
            left join course_label
            on course_label.CourseId = course.Id
            left join label
            on course_label.LabelId = label.Id
            where member_reservation.Valid = 1
            and member_reservation.UserId = "${userid}"
            ${ whereCon }
            group by course_schedule.Id
            order by course_schedule.EndTime desc
        `
        try {
            const result = await this.ctx.model.query(sql_string,{
                type: this.ctx.model.Sequelize.QueryTypes.SELECT
            })
            return result.dataValues || result;
        } catch (err) {
            throw err;
        }
    }

    /**
     * 获取教练列表
     */
    async getUserCoachList(storeid) {
        let sql_store = storeid && storeid.length === 36 ? `and sys_user.StoreId = "${storeid}"`: ''
        let sql_string = `select sys_user.Id, sys_user.Photo, sys_user.Name, sys_user.NickName, 
        sys_user.Avatar, course_type.Name as CourseType, 
        course.Price, course.MemberPrice, course.Name as CourseName
        from sys_user
        left join course_coach
        on course_coach.CoachId = sys_user.Id
        left join course
        on course.Id = course_coach.CourseId
        left join course_type
        on course_type.Id = course.TypeId
        where sys_user.Valid = 1
        ${sql_store}
        and course_coach.Default = 1
        group by sys_user.Id`
        try {
            const result = await this.ctx.model.query(sql_string,{
                type: this.ctx.model.Sequelize.QueryTypes.SELECT
            })
            return result.dataValues || result;
        } catch (err) {
            throw err;
        }
    }

    /**
     * 获取学员信息
     */
    async getMemberInfo(trackingid) {
        let sql_string = `select 
            t1.*, card.Id as CardId, card.CardNo , card.CardEntityNo ,card_level.Name as CarName, card_level.Banner as CardBanner
            from(
                select member.Id as UserId, member.Avatar, member.NickName, member_tracking.Remark, member.Mobile, 
                Store.Name as StoreName, member_body.Height ,member_body.Weight, member_body.FatTatol
                from member_tracking
                left join member
                on member.Id = member_tracking.UserId
                left join member_body
                on member_body.UserId = member_tracking.UserId
                and member_body.Type = 1
                left join store
                on member.StoreId = store.Id
                where member_tracking.Id = "${trackingid}" -- todo 这里sql需要调整
                order by member_body.Date desc
                limit 1
            ) as t1
            left join card
            on card.UserId = t1.UserId
            and card.Type = 1
            and card.Valid = 1
            left join card_level
            on card_level.Id = card.LevelId`
        try {
            const result = await this.ctx.model.query(sql_string,{
                type: this.ctx.model.Sequelize.QueryTypes.SELECT
            })
            return result.dataValues || result;
        } catch (err) {
            throw err;
        }
    }

        /**
     * 获取学员信息
     */
    async getMemberById(Id) {
        let sql_string = `select 
        t1.*, 
        card.Id as CardId, 
        card.CardNo, 
        card.State as CardState,
        card.CardEntityNo,
        card.ExpireDate, 
        card_level.Name as CarName, 
        card_level.Banner as CardBanner
        from(
            select member.Id as UserId, 
                        member.Avatar, 
                        member.NickName, 
                        member_tracking.Remark, 
                        member.Mobile, 
                        Store.Name as StoreName, 
                        member_body.Height ,
                        member_body.Weight, 
                        member_body.FatTatol
            from member
            left join member_tracking
            on member.Id = member_tracking.UserId
            left join member_body
            on member_body.UserId = member_tracking.UserId
            and member_body.Type = 1
            left join store
            on member.StoreId = store.Id
            where member.Id = "${Id}" -- todo 这里sql需要调整
            order by member_body.Date desc
            limit 1
        ) as t1
        left join card
        on card.UserId = t1.UserId
        and card.Type = 1
        and card.Valid = 1
        left join card_level
        on card_level.Id = card.LevelId`
        try {
            const result = await this.ctx.model.query(sql_string,{
                type: this.ctx.model.Sequelize.QueryTypes.SELECT
            })
            return result.dataValues || result;
        } catch (err) {
            throw err;
        }
    }

    /**
     * 获取用户资产
     * todo sql_string_member_ship
     */
    async getMemberAssets(query) {
        const { userid, coursescheduleid } = query
        const sql = {}
        sql.value = `select 
        stored_value_card.Id, 
        null as PackageId, 
        stored_value_card.Type,
        stored_value_card.Name,
        stored_value_card.ExpireDate,
        stored_value_card.BlanceUint,  
        if(isnull(stored_value_card.Blance),0,stored_value_card.Blance) as Blance, 
        if(isnull(stored_value_card.BlanceGift),0,stored_value_card.BlanceGift) as BlanceGift
        from card as stored_value_card
        where stored_value_card.UserId = "${userid}"
        and stored_value_card.Type = 2
        and stored_value_card.State = 1
        and stored_value_card.Valid = 1`

        sql.package = `select 
        package_card.Id,
        order_sub.PackageId as PackageId, 
        package_card.Type, 
        package_card.Name,
        package_card.ExpireDate,
        package_card.BlanceUint, 
        sum(if(isnull(package_card.Blance),0,package_card.Blance)) as Blance,  
        sum(if(isnull(package_card.BlanceGift),0,package_card.BlanceGift)) as BlanceGift
        from card as package_card
        left join order_sub on order_sub.Id = package_card.OrderSubId
        where package_card.UserId = "${userid}"
        and package_card.Type = 3
        and package_card.Valid = 1
        and package_card.State = 1
        group by package_card.OrderSubId`
        
        if (coursescheduleid) {
            sql.package = `select user_package.* 
            from ( ${sql.package}
            ) as user_package
            left join course_schedule
            on course_schedule.Id = "${coursescheduleid}"
            left join course_package_relate
            on course_package_relate.PackageId = user_package.PackageId
            and course_package_relate.CourseId = course_schedule.CourseId
            where course_package_relate.Id is not null`
        }

        sql.string = `select pay_card_list.* 
        from ( ${sql.value}
            union all
            ${sql.package}
        ) as pay_card_list
        order by pay_card_list.ExpireDate`
            
        try {
            const result = await this.ctx.model.query(sql.string,{
                type: this.ctx.model.Sequelize.QueryTypes.SELECT
            })
            return result.dataValues || result;
        } catch (err) {
            throw err;
        }
    }

    /**
     * 
     * 检测私教课是否有预约记录
     */
    async checkPrivateCourseReservation({ start, end, courseScheduleId }) {
        let sql_string = `
            select member_reservation.* from member_reservation
            where (
                member_reservation.StartTime <= "${start}" 
                and 
                member_reservation.EndTime > "${start}"
            )
            or ( 
                member_reservation.StartTime < "${end}" 
                and 
                member_reservation.EndTime >= "${end}" 
            )
            and member_reservation.CourseScheduleId = :courseScheduleId
            and member_reservation.Valid = 1
        `
        try {
            const result = await this.ctx.model.query(sql_string,{
                type: this.ctx.model.Sequelize.QueryTypes.SELECT,
                replacements: {
                    courseScheduleId
                }
            })

            if(result && result.length) {
                return {
                    success: false,
                    message: '此座位已经被选择',
                    data: result
                }
            } else {
                return {
                    success: true,
                    message: '可以预约'
                }
            }
            
        } catch (err) {
            throw err;
        }
    }

    /**
     * 
     * 检测团课是否有预约记录
     */
    async checkPublicCourseReservation({ courseScheduleId, seating, Limted }) {
        if(Limted) {
            let curCountSql = `
            select count(*) as count from member_reservation
            where
            CourseScheduleId = :courseScheduleId
            and member_reservation.Valid = 1
            `
            try {
                const countResult = await this.ctx.model.query(curCountSql,{
                    type: this.ctx.model.Sequelize.QueryTypes.SELECT,
                    replacements: {
                        courseScheduleId
                    }
                })
                console.log( countResult[0]["count"] , Limted, '已经超出了报名人数限制?')
                if( countResult[0]["count"] >= Limted) {
                    return {
                        success: false,
                        message: '已经超出了报名人数限制'
                    }
                }
            } catch (err) {
                throw err;
            }
        }
        // 如果支持选座 
        if(seating)  {
            let sql_string = `
            select member_reservation.* from member_reservation
            where
            Seat=:Seat
            and member_reservation.CourseScheduleId = :courseScheduleId
            and member_reservation.Valid = 1
            `
            try {
                const result = await this.ctx.model.query(sql_string,{
                    type: this.ctx.model.Sequelize.QueryTypes.SELECT,
                    replacements: {
                        courseScheduleId,
                        Seat: seating
                    }
                })

                if(result && result.length) {
                    return {
                        success: false,
                        message: '此座位已经被选择',
                        data: result
                    }
                }
            } catch (err) {
                throw err;
            }
        }

        return {
            success: true,
            message: "可以预约"
        }
       
    }

    /**
     * 检测当前课程是否可以预约
     * @param {*} params
     */
    async checkReservation({ start, end, courseScheduleId, seating }) {
       
        // 1. 先判断课程类型是团课和私教课
        let courseDetail = await this.ctx.service.courseExpand.getCourseDetail(courseScheduleId);
        if(courseDetail.length) {
            courseDetail = courseDetail[0];
        }
        if(!courseDetail) {
            throw new Error('不存在的课程排课')
        }

        // 私教课
        if(courseDetail.MainTypeId === "1") {
            return  await this.ctx.service.memberExpand.checkPrivateCourseReservation({ start, end, courseScheduleId })
        } else if(['0', '2', '3'].includes(courseDetail.MainTypeId)) {
            return await this.ctx.service.memberExpand.checkPublicCourseReservation({ courseScheduleId, seating, Limted: courseDetail.Limted })
        } else {
            throw new Error('不支持此课程类型')
        }
      
    }

    /**
     * 更新用户手机号码
     * @param {String} openid 
     * @param {String} countryCode 
     * @param {String} purePhoneNumber 
     */
    async updateMobileByOpenid(openid, purePhoneNumber, countryCode) {
        const sql = 'update member set Mobile=:Mobile where openid=:openid'
        try {
            const result = await this.ctx.model.query(sql, {
                type: this.ctx.model.Sequelize.QueryTypes.Update,
                replacements: {
                    Mobile: purePhoneNumber,
                    openid: openid
                }
            })
            return result.dataValues || result;
        } catch (err) {
            console.log(countryCode);
            throw err;
        }
    }

    async setMemberStore ({Id, StoreId}) {
        const sql = `update member 
        set member.StoreId = "${StoreId}"
        where member.Id = "${Id}"`
        try {
            const result = await this.ctx.model.query(sql, {
                type: this.ctx.model.Sequelize.QueryTypes.Update
            })
            return result.dataValues || result;
        } catch (error) {
            throw error
        }
    }
}

module.exports = MemberExpandService;
