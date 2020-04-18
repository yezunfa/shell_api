'use strict';

const uuid = require('uuid')
const moment = require('moment')
const { Controller } = require('egg');

const storemapping = require('./mapping/store.json')

const info = (message, detail) => ({status: 'info', message, times: moment().format('HH:mm:ss'), detail})
const err = (message, detail) => ({status: 'error', message, times: moment().format('HH:mm:ss'), detail})
const warn = (message, detail) => ({status: 'warn', message, times: moment().format('HH:mm:ss'), detail})
const ending = (message, detail) => ({status: 'ending', message, times: moment().format('HH:mm:ss'), detail})

class Migrate extends Controller {

    async controller () {
        const { ctx, app } = this

        const logger = []
        const result = {}
        const CreateTime = new Date()
        const { unionid, openid } = ctx.request.body
        const loggerEntity = {}
        
        const conn = await app.mysql.beginTransaction();

        try {
            if (!unionid || unionid === 'undefined') throw new Error('unionid is undefined')
            // 检查是否已有重复数据, 有则全部暴力删除
            const dirty = await ctx.service.member.getByCondition({unionid})
            if (dirty && dirty.Id) await ctx.service.migrate.destorymember(dirty.Id)
            // 从旧数据库拉取用户数据
            
            const baseinfo = await ctx.service.migrate.pullMember(unionid)
            // logger.push(info('获取老系统数据', baseinfo))

            // 使用旧数据在新数据库创建用户基础数据
            baseinfo.openid = openid
            const {baselog, memberinfo} = await ctx.service.migrate.createmember(baseinfo, conn)
            logger.push.apply(logger, baselog);
            
            loggerEntity.UserId = memberinfo.Id
            loggerEntity.unionid = unionid
            loggerEntity.CreateTime = CreateTime
            
            // 创建用户体测数据
            loggerEntity.UserId = memberinfo.Id
            baseinfo.UserId = memberinfo.Id
            const bodylog = await ctx.service.migrate.createbody(baseinfo, conn)
            logger.push.apply(logger, bodylog);
            // 绑定用户责任教练
            const { logger: coachlog, sysuserinfo: coachinfo } = await ctx.service.migrate.createtracking(baseinfo, conn)
            logger.push.apply(logger, coachlog);
            // 绑定用户责任会籍
            const { logger: sallerlog, sysuserinfo: sallerinfo } = await ctx.service.migrate.createtracking(baseinfo, conn, 2)
            logger.push.apply(logger, sallerlog);
            // 迁移会员卡
            const {cardinfo, cardlog} = await ctx.service.migrate.createcard(baseinfo, conn)
            logger.push.apply(logger, cardlog);

            const { Level, Id: CardId } = cardinfo
            if (Level && parseInt(Level) > 0) {
                const valuelog = await ctx.service.migrate.createvalue({cardinfo, baseinfo}, conn)
                logger.push.apply(logger, valuelog);
            }
            logger.push(info('查询用户门店限制'))
            const StoreId = this.storecheck(memberinfo)

            logger.push(info('查询用户套餐'))
            const packagelist = await ctx.service.migrate.searchpacakages(unionid)

            // if (!StoreId) logger.push(warn(`用户未关注套餐所在的门店, 需要手动迁移`)) //&& StoreId

            if (packagelist && packagelist.length) {
                logger.push(info(`检索到${packagelist.length}个套餐可迁移`, packagelist))
                const {orderinfo, orderlog} = await ctx.service.migrate.createorder(baseinfo, conn)
                logger.push.apply(logger, orderlog);
                const { Id: UserId } = memberinfo
                const { Id: OrderId } = orderinfo
                this.OrderId = OrderId

                for (const iterator of packagelist) {
                    const payload = { ...iterator, CardId, OrderId, unionid, UserId } // StoreId
                    const packagelog = await ctx.service.migrate.createpackage(payload, conn)
                    logger.push.apply(logger, packagelog);
                }
            } else {
                logger.push(ending('未检索到可迁移的用户套餐'))
            }

            logger.push(info('查询用户预约记录'))
            const reservationlist = await ctx.service.migrate.searchreservation(unionid)
            if (reservationlist && reservationlist.length) {
                const { OrderId } = this
                const { Id: UserId } = memberinfo

                logger.push(info(`检索到${reservationlist.length}个约课记录可迁移`))

                for (const iterator of reservationlist) {
                    const payload = { ...iterator, CardId, OrderId, unionid, StoreId, UserId }
                    const packagelog = await ctx.service.migrate.createreservation(payload, conn)
                    logger.push.apply(logger, packagelog);
                }
            } else {
                logger.push(ending('未检索到可迁移的用户预约'))
            }

            const { Id: UserId } = memberinfo
            const { Id: CoachId } = coachinfo
            const { Id: SellerId } = sallerinfo
            const updateinfo = { Level, CoachId, SellerId, UserId }
            const cleanlog = await ctx.service.migrate.datacleaning({baseinfo, updateinfo}, conn, 2)
            logger.push.apply(logger, cleanlog);

            logger.push(info('数据迁移完毕, 提交迁移日志'))  
            
            loggerEntity.Id = uuid.v1()
            loggerEntity.Type = 1
            loggerEntity.unionid = unionid
            loggerEntity.CreatePerson = 'system'
            loggerEntity.Content = JSON.stringify(logger)

            try {
                await ctx.service.sysLog.create(loggerEntity)
            } catch (error) {
                ctx.logger.log(`用户[${unionid}](unionid)迁移日志: ${JSON.stringify(logger)}`)
                loggerEntity.Content = `用户[${unionid}]的log 超出存储长度 请联系开发人员获取`
                await ctx.service.sysLog.create(loggerEntity)
            }

            const $result = await conn.commit()
            logger.push(ending('数据迁移完毕, 事物已提交', $result))   

            result.code = 200
            result.success = true
            result.data = { logger }
            ctx.body = { ...result }
        } catch (error) {
            const { message } = error
            const $result = await conn.rollback()

            logger.push(ending('事物已回滚', $result))

            loggerEntity.Id = uuid.v1()
            loggerEntity.Type = 1
            loggerEntity.CreatePerson = 'system'
            loggerEntity.Content = JSON.stringify(logger)
            await ctx.service.sysLog.create(loggerEntity)

            result.code = 500
            result.success = false
            result.data = { logger }

            ctx.logger.error(error)
            ctx.body = { ...result, message }
        }
    }

    storecheck (memberinfo) {
        const { Level, StoreId } = memberinfo
        if (parseInt(Level, 10) >= 2) return 'all'
        if (!StoreId || !StoreId.length) return false
        const storeinfo = storemapping.find(item => item.Id === StoreId)
        if (!storeinfo) return false
        return StoreId
    }

    async generalpackage () {
        const { ctx, app } = this
        const CreatePerson = 'system'
        const CreateTime = new Date()
        try {
            const datalist = await ctx.service.migrate.olderpacakages()
            if (!(datalist instanceof Array)) throw new Error('错误的参数') 
            await Promise.all(datalist.map(async (item) => {
                const entity = {}
                const { package_id, name, num, payprice, remark } = item

                entity.Id = uuid.v4()
                entity.Name = `通用_${name}`
                entity.Count = parseInt(num, 10)
                entity.CreateTime = CreateTime
                entity.CreatePerson = CreatePerson
                entity.Price = parseFloat(payprice)
                entity.Remark = `${package_id}_${remark}`
                
                await ctx.service.packages.create(entity)
            }));
            ctx.body = { success: true }
        } catch (error) {
            console.error(error)
            ctx.body = { success: false }
        }
    }
}

module.exports = Migrate;