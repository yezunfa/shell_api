'use strict';


const uuid = require('uuid')
const moment = require('moment')
const { Service } = require('egg')
const Sequelize = require('sequelize');
const OlderBase = require('./utils/olderBaseData');

const storemapping = require('./mapping/store.json')
const cardmapping = require('./mapping/card.json')

const info = (message, detail) => ({status: 'info', message, times: moment().format('HH:mm:ss'), detail})
const err = (message, detail) => ({status: 'error', message, times: moment().format('HH:mm:ss'), detail})
const warn = (message, detail) => ({status: 'warn', message, times: moment().format('HH:mm:ss'), detail})
const ending = (message, detail) => ({status: 'ending', message, times: moment().format('HH:mm:ss'), detail})

const CreatePerson = 'migrate'
const UpdatePerson = 'migrate'
const { relian } = OlderBase
// Level !!! SallerId !!! CoachId !!!
class Migrate extends Service { 

    async destorymember (UserId) {
        const { ctx } = this
        
        const deletelist = [
            `delete from order_sub where order_sub.OrderId in(select Id from order_main where UserId = '${UserId}')`,
            `delete from order_payment where order_payment.OrderId in(select Id from order_main where UserId = '${UserId}' )`,
            `delete from order_refund where order_refund.OrderId in(select Id from order_main where UserId = '${UserId}' )`,
            `delete from order_main where UserId = '${UserId}'`,
            `delete from card_history where UserId ='${UserId}'`,
            `delete from card where UserId = '${UserId}'`,
            `delete from member_body where UserId = '${UserId}'`,
            `delete from member_message where UserId = '${UserId}'`,
            `delete from member_coach_invite where UserId = '${UserId}'`,
            `delete from member_coupon where UserId = '${UserId}'`,
        ]

        const deletebase = [
            `delete from member_tracking where UserId = '${UserId}'`,
            `delete from member where Id = '${UserId}'`
        ]

        const _schedule = `select course_schedule.Id 
        from member_reservation 
        left join course_schedule on course_schedule.Id = member_reservation.CourseScheduleId
        left join course_type on course_schedule.TypeId = course_type.Id
        where member_reservation.UserId = '${UserId}'
        and ( course_schedule.TypeId in ("1", "2") or course_type.ParentId in ("1", "2") )`

        const reservation = `delete from member_reservation where UserId = '${UserId}'`

        try {
            const type = Sequelize.QueryTypes.DELETE
            for (const sql of deletelist) await ctx.model.query(sql, { type })
            
            const Idlist = await ctx.model.query(_schedule, { type: Sequelize.QueryTypes.SELECT, rows: true })
            const ids = Idlist.map(item => item.Id)
            await ctx.model.query(reservation, { type })
            await ctx.model.query(`delete from course_schedule where course_schedule.Id in ("${ids.join(`" ,"`)}")`, { type })
            for (const sql of deletebase) await ctx.model.query(sql, { type })
        } catch (error) {
            throw error
        }
    }

    /**
     * 拉取用户基本数据 by relian
     */
    async pullMember (unionid) { // w_user.grade_id,
        const { ctx, app } = this
        const sql = `select
        w_card.*, w_user.*,
        coach.phone as coach_phone,
        seller.phone as seller_phone
        from w_user 
        left join w_coach as coach on coach.coach_id = w_user.bind_coach_id -- 教练手机号 
        left join w_coach as seller on seller.coach_id = w_user.counselor_id -- 会籍手机号
        left join w_card on w_card.cardNo = w_user.membercardNumber
        where w_user.unionid = "${unionid}"`
        try {
            const type = Sequelize.QueryTypes.SELECT
            const result = await relian.query(sql, type)
            const [ [ entity ] ] = result
            
            return entity
        } catch (error) {
            ctx.logger.error(error)
            const { message } = error
            ctx.body = { success: false, message, code: 500 }
        }
    }

    async olderpacakages () {
        const { ctx } = this
        const sql = `select 
        w_package_data.* 
        from w_package_data
        where w_package_data.type = 2
        and w_package_data.disabled = 2`
        try {
            const type = Sequelize.QueryTypes.SELECT
            const result = await relian.query(sql, type)
            const [ datalist ] = result
            return datalist
        } catch (error) {
            console.error(error)
            ctx.logger.error(error)
        }
    }

    /**
     * 拉取用户套餐数据 by relian
     */
    async searchpacakages (unionid) {
        const { ctx, app } = this
        const sql = `select w_package.* from w_package
        left join w_user on w_user.openid = w_package.openid
        where w_user.unionid = "${unionid}"`

        // console.log(sql)
        try {
            const type = Sequelize.QueryTypes.SELECT
            const result = await relian.query(sql, type)
            const [ datalist ] = result

            return datalist
        } catch (error) {
            console.error(error)
            ctx.logger.error(error)
        }
    }

    /**
     * 拉取用户约课数据 by relian
     */
    async searchreservation (unionid) {
        const { ctx, app } = this
        const sql = `select 
        w_user.phone as Mobile,
        w_coach.phone as coach_phone,
        w_order .*,
        w_course.course_name,
        w_course.course_type,
        w_course.team_type
        from w_order 
        left join w_course 
        on w_course.course_id = w_order.course_id
        left join w_coach 
        on w_coach.coach_id = w_order.coach_id
        left join w_user
        on w_user.openid = w_order.openid
        where w_user.unionid = "${unionid}"
        and to_days(w_order.date) > to_days('2019-10-07')
        and w_order.status in ("1")`

        try {
            const type = Sequelize.QueryTypes.SELECT
            const result = await relian.query(sql, type)
            const [ datalist ] = result
            return datalist
        } catch (error) {
            console.error(error)
            ctx.logger.error(error)
        }
    }

    /**
     * 创建用户基础信息
     * @param {*} baseinfo 
     * @param {*} conn 事物
     */
    async createmember (baseinfo, conn) {
        const logger = []
        const entity = {}
        const CreateTime = new Date()

        try {
            logger.push(info("开始迁移会员基础信息"))

            entity.Id = uuid.v1()
            entity.Code = baseinfo.no
            entity.Sex = baseinfo.sex
            entity.City = baseinfo.city
            entity.openid = baseinfo.openid
            entity.unionid = baseinfo.unionid
            entity.Name = baseinfo.realname 
            entity.NickName = baseinfo.nickname
            entity.Source = 11 // 老系统用户
            // entity.Remark = baseinfo.remark
            entity.Country = baseinfo.country
            entity.Province = baseinfo.province

            if (baseinfo.headimgurl) entity.Avatar = baseinfo.headimgurl.replace('http:', '')

            const { phone, Idnumber, default_store } = baseinfo
            const storeinfo = storemapping.find(item => item.OlderId === `${default_store}`)
            if (Idnumber) {
                entity.CertificateType = 4
                entity.CertificateCode = Idnumber
            }
            if (phone && `${phone}`.length > 1) {
                entity.Mobile = parseInt(phone, 10)
            } else {
                logger.push(warn(`请填写正确的手机号码: [${phone}]`))
            }
            if (storeinfo && storeinfo.Id) {
                entity.StoreId = storeinfo.Id
                logger.push(info(`用户当前门店为: ${storeinfo.Name}`))
            } else {
                logger.push(warn(`用户未关注门店: ${default_store}`))
            }

            logger.push(info('打印会员卡信息', { ...entity, CreatePerson, CreateTime }))

            const $result = await conn.insert('member', { ...entity, CreatePerson, CreateTime });
            logger.push(info(`会员基础信息迁移成功`, $result))
            return {baselog: logger, memberinfo: entity}
        } catch (error) {
            throw error
        }
    }

    /**
     * 创建用户体测信息
     * @param {*} baseinfo 
     * @param {*} conn 
     */
    async createbody (baseinfo, conn) {
        const logger = []
        const entity = {}
        const { UserId } = baseinfo
        const CreateTime = new Date()

        try {
            logger.push(info("迁移用户体测信息"))

            entity.Type = 9
            entity.Id = uuid.v4()
            entity.Height = baseinfo.height
            entity.Weight = baseinfo.weight
            entity.FatTatol = baseinfo.fat
            entity.Bones = baseinfo.bones
            entity.Date = '2019-06-06'

            const $result = await conn.insert('member_body', { UserId, ...entity, CreatePerson, CreateTime }); 
            logger.push(info("用户体测信息已迁移", $result))
            return logger
        } catch (error) {
            throw error
        }
    }

    /**
     * 关联用户责任教练\会籍
     * @param {*} baseinfo 
     * @param {*} conn 
     * @param {*} RelationType  1教练 2会籍
     */
    async createtracking (baseinfo, conn, RelationType = 1) {
        const { ctx } = this

        const logger = []
        const entity = {}
        const CreateTime = new Date()

        try {
            const { UserId, coach_phone, seller_phone } = baseinfo
            const relationmapping = {1: {label: '教练', phone: coach_phone}, 2: {label: '会籍', phone: seller_phone}}
            const { label, phone } = relationmapping[RelationType]

            logger.push(info(`关联用户责任${label}`))
            const Mobile = parseInt(phone, 10)
            if (!Mobile || Mobile < 10000000000) {
                logger.push(warn(`非法的${label}手机号: ${phone}`))
                return { logger, sysuserinfo: {} }
            }

            logger.push(info(`尝试绑定${label}: [${Mobile}]`))
            const sysuserinfo = await ctx.service.sysUser.getByCondition({Mobile})
            if (!sysuserinfo || !sysuserinfo.Id) {
                logger.push(warn(`${label}信息映射失败`))
                return { logger, sysuserinfo: {} }
            }

            entity.State = 1
            entity.Id = uuid.v4()
            entity.CreateTime = CreateTime
            entity.CreateTime = CreateTime
            entity.SysUserId = sysuserinfo.Id
            entity.RelationType = RelationType
            entity.VaildTime = moment().add(7, 'days').format('YYYY-MM-DD')

            const _result = await conn.insert('member_tracking', {...entity, UserId, CreateTime, CreatePerson})
            logger.push(info(`已绑定${label}[${sysuserinfo.Name}]`, _result))

            return { logger, sysuserinfo }
        } catch (error) {
            throw error
        }
    }

    async createcard (baseinfo, conn) {
        const { ctx, app } = this

        const logger = []
        const CreateTime = new Date()
        const options = { where: {} }

        try {
            const { UserId } = baseinfo

            const { grade_id, membercardNumber } = baseinfo // is_open 是否开通会员
            const { Adminremark, activatetime, is_disabled, card_expire_time } = baseinfo
        
            const cardlevel = cardmapping[grade_id]

            if (!cardlevel) throw new Error(`异常的会员信息: ${grade_id}`)

            const entity = { ...cardlevel, UserId, CreatePerson, CreateTime }

            entity.Type = 1
            entity.State = 1
            entity.Id = uuid.v1()
            entity.Blance = 399360
            entity.BlanceUint = '次'
            entity.Remark = Adminremark
            entity.CardNo = membercardNumber || `migrate-${uuid.v1().slice(8)}`
            entity.ActiveDate = moment.unix(activatetime).format("YYYY-MM-DD")
            entity.ExpireDate = moment.unix(card_expire_time).format("YYYY-MM-DD")
            entity.Deadline = moment(entity.ExpireDate).diff(moment(entity.ActiveDate), 'months')


            if (!parseInt(card_expire_time)) {
                entity.State = 2
                entity.ActiveDate = null
                entity.ExpireDate = null
                logger.push(warn("未激活的会员卡")) 
            }
            if (card_expire_time && moment.unix(card_expire_time).isBefore(moment())) {
                entity.State = 4
                logger.push(warn("会员卡已过期"))    
            }
            if (parseInt(is_disabled, 10)) {
                entity.State = 0 
                logger.push(warn("会员卡已被系统禁用"))  
            }

            if (typeof membercardNumber !== 'string' || membercardNumber === '' || parseInt(grade_id, 10) === 1) { // 潜客获取体验卡
                entity.Type = 0
                entity.Name = '潜客' 
                entity.ActiveDate = null
                entity.ExpireDate = null      
                logger.push(info("潜客业务数据初始化"))   
                       
                const $result = await conn.insert('card', { UserId, ...entity });

                logger.push(ending("已更新业务潜客数据", $result)) 
                return { cardinfo: entity, cardlog: logger }
            }

            const cardstore = storemapping.find(item => membercardNumber.indexOf(item.No) !== - 1)

            if (!cardstore || !cardstore.Id) throw new Error(`无效的会员卡: [${membercardNumber}]`)

            entity.StoreId = cardstore.Id
            const $result = await conn.insert('card', entity)
            logger.push(info("会员卡信息已迁移", $result))

            return { cardinfo: entity, cardlog: logger }
        } catch (error) {
            throw error
        }
    }

    async createvalue ({cardinfo, baseinfo}, conn) {
        const logger = []
        const CreateTime = new Date()

        try {
            const { balance } = baseinfo
            const { Id: ParentId } = cardinfo

            const entity = { ParentId }
            
            entity.Type = 2
            entity.State = 1
            entity.Name = '储值金'
            entity.Id = uuid.v4()
            entity.BlanceUint = '元'
            entity.Blance = balance || 0
            entity.UserId = cardinfo.UserId
            entity.Deadline = cardinfo.Deadline
            entity.ActiveDate = cardinfo.ActiveDate
            entity.ExpireDate = cardinfo.ExpireDate
            
            const $result = await conn.insert('card', {...entity, CreateTime})

            logger.push(ending(`创建储值卡-余额:${balance}`, $result))

            return logger
        } catch (error) {
            throw error
        }
    }

    async createorder (baseinfo, conn) {
        const logger = []
        const CreateTime = new Date()
        
        try {
            const { UserId } = baseinfo
            logger.push(info('建立虚拟订单'))
            const entity = { UserId }
            entity.Type = 2
            entity.State = 1
            entity.Source = 2
            entity.PayWay = 3
            entity.Amount = 0
            entity.PayState = 1
            entity.Name = "迁移订单(套餐)"
            entity.Id = uuid.v1()
            entity.Code = `migrate-${uuid.v1().replace('-', '').slice(8)}`
            const $result = await conn.insert('order_main', {...entity, CreateTime, CreatePerson})
            logger.push(ending('生成虚拟订单', $result))

            return { orderinfo: entity, orderlog: logger }
        } catch (error) {
            throw error
        }
    }

    async createpackage (current, conn) {
        
        const { ctx, app } = this

        const logger = []
        const CreateTime = new Date()

        try {
            const subentity = {}
            logger.push(info('尝试迁移套餐'))
            const { package_id, package_data_id, OrderId } = current

            const old_id = package_data_id
            const packageinfo = await ctx.service.packages.getByCondition({old_id})
            if (!packageinfo || !packageinfo.Id) throw new Error(`此套餐未被门店收录${old_id}`)
        
            subentity.Count = 1
            subentity.Id = uuid.v1()
            subentity.ProductType = 2
            subentity.ProductState = 1
            subentity.OrderId = OrderId
            subentity.Remark = package_id
            subentity.PackageId = packageinfo.Id
            subentity.ProductName = packageinfo.Name
            subentity.MemberPrice = packageinfo.Price
            subentity.StoredValuePrice = packageinfo.Price
            subentity.ProductInfo = JSON.stringify({ ...packageinfo })

            const _result = await conn.insert('order_sub', {...subentity, CreateTime, CreatePerson})
            logger.push(info(`生成子订单: ${packageinfo.Id}`, _result))

            const { package_num, userd_num, createtime, expires, UserId } = current
            const packagecardentity = {}
            packagecardentity.Type = 3
            packagecardentity.State = 1
            packagecardentity.Id = uuid.v1()
            packagecardentity.BlanceUint = '次'
            packagecardentity.UserId = UserId
            packagecardentity.Name = packageinfo.Name
            packagecardentity.OrderSubId = subentity.Id
            packagecardentity.ParentId = current.CardId
            packagecardentity.ExpireDate = moment(expires, 'YYYY-MM-DD').format('YYYY-MM-DD')
            packagecardentity.ActiveDate = moment(createtime, 'YYYY-MM-DD').format('YYYY-MM-DD')
            packagecardentity.Blance = parseFloat(package_num, 10) - parseFloat(userd_num, 10)   // 原套餐数据中存在0.5次的次数

            const $result = await conn.insert('card', {...packagecardentity, CreateTime, CreatePerson})    
            logger.push(info(`迁移套餐卡[${packageinfo.Name}]`, $result))

            return logger
        } catch (error) {
            throw error
        }
    }

    async createreservation (current, conn) {
        const { ctx } = this

        const logger = []
        const CreateTime = new Date()
        
        try {
            // const { team_type, course_name } = current
            const { course_id: old_id, coach_phone, remark: Remark, UserId } = current

            const courseinfo = await ctx.service.course.getByCondition({old_id})
            if (!courseinfo || !courseinfo.Id) throw new Error(`课程[${old_id}]未录入此系统`)
            const { Id: CourseId, Name: CourseName } = courseinfo

            const Mobile = parseInt(coach_phone)
            const coachinfo = await ctx.service.sysUser.getByCondition({Mobile})
            if (!coachinfo || !coachinfo.Id) {
                logger.push(warn(`未获取到手机号为"${Mobile}"的教练信息`))
                return logger
            }

            const { Id: CoachId } = coachinfo
            const { date, course_type, s_time, e_time, order_id } = current
            const { StoreName, TypeId, StoreId, Limted } = courseinfo

            const StartTime = `${date} ${s_time}`
            const EndTime = `${date} ${e_time}`
            const schedule = { CourseId, CoachId, Limted, StoreId, TypeId }

            if (parseInt(course_type) === 2 || parseInt(course_type) === 3) { // 私教课则新建一个课程
                schedule.State = 2
                schedule.Valid = 1
                schedule.Id = uuid.v4()
                schedule.Remark = order_id
                schedule.Name = courseinfo.Name
                schedule.EnName = courseinfo.EnName
                schedule.CoachName = coachinfo.Name
                schedule.Duration = courseinfo.Duration
                schedule.CreateTime = CreateTime
                schedule.CreatePerson = CreatePerson
                schedule.EndTime = EndTime 
                schedule.StartTime = StartTime 
                schedule.CoachNickName = coachinfo.NickName    
                schedule.Date = moment(StartTime, 'YYYY-MM-DD HH:mm').format('YYYY-MM-DD')
                const conflict = await ctx.service.course.checkSchedule(StartTime, EndTime, CoachId)
               
                if (conflict.length) {
                    logger.push(warn('约课记录迁移失败, 这个时间段已经被人占用了', conflict))
                    return logger
                }

                const $result = conn.insert('course_schedule', schedule)
                logger.push(info(`已为用户${CourseName}课程的预约在排课中创建schedule`, $result))
            } else { // 团课则查询
                const information = await ctx.service.courseSchedule.getByCondition({ CourseId, StartTime, EndTime, CoachId })
                if (!information || !information.Id) {
                    logger.push(warn(`未在新系统查询到此课程计划, 请联系前台服务人员手动预约`, { CourseId, StartTime, EndTime, CoachId }))
                    return logger
                }
                schedule.Id = information.Id
            }
            
            const { Id: CourseScheduleId } = schedule
            logger.push(info(`获取到${StartTime}由${coachinfo.Name}负责的${CourseName}`));

            const { seat, order_sn } = current
            const reservation = { StoreId, CourseScheduleId, CourseName, StoreName, Remark, CreateTime, CreatePerson } 
            reservation.Id = uuid.v4()
            reservation.Code = order_sn
            reservation.UserId = UserId
            reservation.Seat = parseInt(seat, 10)
            reservation.StartTime = StartTime
            reservation.EndTime = EndTime
            reservation.State = 1
            const r$result = await conn.insert('member_reservation', reservation);
            logger.push(info(`生成预约记录: ${order_sn}`, r$result));

            const { num, discount, payment, total } = current
            const orderMain = { StoreId, Remark }
            orderMain.State = 1
            orderMain.Source = 3
            orderMain.Id = uuid.v4()
            orderMain.UserId = UserId
            orderMain.PayState = 1
            orderMain.Type = 4
            orderMain.Code = order_sn
            orderMain.Amount = payment
            orderMain.Name = '迁移订单(预约)'
            orderMain.TotalAmount = discount
            const mainresult = await conn.insert('order_main', {...orderMain, CreateTime, CreatePerson});
            logger.push(info(`生成预约订单: ${orderMain.Id}`, mainresult));

            const orderSub = { Remark }
            orderSub.Count = 1
            orderSub.Price = total
            orderSub.Id = uuid.v1()
            orderSub.ProductType = 4
            orderSub.ProductState = 1
            orderSub.OrderId = orderMain.Id
            orderSub.MemberPrice = discount
            orderSub.ProductName = CourseName
            orderSub.StoredValuePrice = total
            orderSub.ReservationId = reservation.Id
            orderSub.ProductInfo = JSON.stringify(schedule)
            
            const subresult = await conn.insert('order_sub', {...orderSub, CreateTime, CreatePerson });
            logger.push(info(`生成预约子订单: ${orderSub.Id}`, subresult));

            logger.push(info(`已迁移${CourseName}的预约记录`));
            return logger
        } catch (error) {
            throw error
        }
    }

    async datacleaning ({baseinfo, updateinfo}, conn, status) {
        const logger = []
        const { unionid } = baseinfo
        const { UserId, ...otherprops } = updateinfo
        const options = { where: {} }
        try {
            options.where.Id = UserId
            const migrate_status = 2
            logger.push(info('update member', {...otherprops, migrate_status}))
            const $result = await conn.update('member', {...otherprops, migrate_status}, options)
            logger.push(info('已更新member表', $result))

            const sql = `update w_user 
            set w_user.migrate_status = ${status} 
            where w_user.unionid = "${unionid}"`

            const type = Sequelize.QueryTypes.UPDATE
            const result = await relian.query(sql, type)
            
            logger.push(info(`已更新older migrate_status 为${status}`, result))
            return logger
        } catch (error) {
            throw error
        }
    }

}

module.exports = Migrate;