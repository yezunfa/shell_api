'use strict';

/**
 * weapp page_home service
 * useage: ctx.service.weapp.page.home
 */
const Service = require('egg').Service;
const moment = require('moment')

class Home extends Service {
    /**
     * get weapp user homeinfo
     * @param {String} userid condition
     * @return {Object} entity a model Entity
     */
    async getHomeInfo(userid) {
        if(!userid || typeof userid !== 'string') {
            throw new Error('param_openid error');
        }
        let sql_string = `
            select ifnull(sum(timestampdiff (minute,StartTime,EndTime)),0) 
            as entity
            from member_reservation 
            where Valid = 1 
            and State = 2
            and UserId = "${userid}"
                union all 
            select ifnull(sum(timestampdiff (minute,StartTime,EndTime)),0)  
            from member_reservation 
            where Valid = 1 
            and State = 2
            and UserId = "${userid}" 
            and yearweek(date_format(StartTime,'%Y-%m-%d')) = yearweek(now())
                union all
            select count(*) 
            from member_coach_invite 
            where Valid = 1 
            and State = 0 
            and UserId = "${userid}"
                union all
            select count(*)
            from member_reservation 
            where Valid = 1 
            and State = 2
            and UserId = "${userid}"
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
     * get weapp user homeinfo
     * @param {Object} query condition
     * @param {String} query.userid userid
     * @param {String} query.date date
     * @return {Object} entity a model Entity
     */
    async getCourseList(query) {
        const { userid, date } = query
        if(!userid || typeof userid !== 'string') throw new Error('param_openid error')

        const dateCondition =  date ? `and date_format(member_reservation.StartTime,'%Y-%m-%d') = "${date}"` : `and to_days(member_reservation.StartTime) >= to_days(now())`;

        const sql_string = `select 
        member_reservation.Id, 
        member_reservation.CourseScheduleId, 
        member_reservation.StartTime, 
        member_reservation.EndTime, 
        member_reservation.StoreId, 
        member_reservation.StoreName, 
        course_schedule.CourseId, 
        member_reservation.State,
        course_schedule.Name as CourseName, 
        course_schedule.EnName as CourseEnName, 
        course_schedule.TypeId,
        course_schedule.CoachId, 
        course_schedule.CoachName, 
        sys_user.NickName as CoachNickName, 
        sys_user.Photo as CoachPhoto,
        course_type.Name as TypeName 
        from member_reservation
        left join course_schedule on member_reservation.CourseScheduleId = course_schedule.Id
        left join course_type on course_schedule.TypeId = course_type.Id
        left join sys_user on course_schedule.CoachId = sys_user.Id
        where member_reservation.Valid = 1 
        and member_reservation.UserId = "${userid}" 
        and member_reservation.State in (1, 2)
        ${dateCondition}
        order by member_reservation.StartTime desc`
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
     * get weapp user homeinfo
     * @param {Object} query condition
     * @param {String} query.userid userid
     * @return {Object} entity a model Entity
     */
    async getStoreList(query) {
        const { userid } = query
        let sql_string = `
        select * from (
            select store.Id, 
                   IF(userStore.StoreId  IS NULL,0,1)  as Isfavorite, 
                   store.Name, 
                   store.NickName, 
                   store.BannerList,
                   store.CreateTime 
            from store
            left join (
                select StoreId from member
                where member.Id = "${userid}"
                ) as userStore on userStore.StoreId = store.Id
         ) as t1 
         order by  t1.Isfavorite desc, t1.CreateTime 
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
}

module.exports = Home;