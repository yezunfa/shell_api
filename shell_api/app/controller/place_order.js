'use strict';
const Controller = require('egg').Controller;
const moment = require("moment");
const uuid = require('uuid')
const WXPAY = require('../extend/wxpay');
const fs = require('fs');
const WechatPayment = WXPAY({
    appid: 'wx1fe7f046ead630b6',
    mch_id: '1466285902',
    partner_key: 'fusionfusionfusionfusionfusion88', // '商户密钥（证书密码）新密码 lqOrsFelsj2vyugaKSgrnwzjWUof2NKC',
    pfx: fs.readFileSync('pay/wx_cert/apiclient_cert.p12')
});

/**
 * PlaceOrder
 * useage: ctx.controller.PlaceOrder
 * auther by mango
 */
class PlaceOrder extends Controller {
    reportbody(message) { return { message, code: 500, success: false }  }

    idempotent(message, data) { return { message, code: 200, success: true, data } }

    async changeState() {
        const { ctx } = this
        const { State, Id } = ctx.request.body
        try {
           const result =  await ctx.service.orderMain.edit({ 
                State,
                Id
            })
            ctx.body = {
                success: true,
                code: 200,
                data: result
            }
        } catch (error) {
            console.error(error)
        }
    }

    /**
     * 生成一笔预约订单
     * todo 事务 ; 联动coach_invite
     */
    async reservation() {
        const { ctx } = this
        // 获取表单参数
        const { userid: UserId } = ctx.query 
        const { Mobile, Seating, CourseScheduleId, StartTime, EndTime, TotalAmount } = ctx.request.body
        // todo 参数校验 

        // 数据初始化
        const OrderId = uuid.v4()
        const OrderSubId = uuid.v4()
        const ReservationId = uuid.v4()
        const CreateTime = new Date()
        const OrderCode = uuid.v1().split('-').join('') // todo
        const CreatePerson = UserId
        
        try {
            const userinfo = await ctx.service.member.getById(UserId)
            this.logger.info('当前预约用户：', userinfo);

            if(!userinfo || !userinfo.Id) {
                ctx.body = this.reportbody('会员信息不存在, 请联系门店协商')
                return false // 判断会员是否存在
            }

            if (parseInt(userinfo.Valid, 10) !== 1) {
                ctx.body = this.reportbody('约课功能被禁用, 请联系门店协商')
                return false // 判断会员是否被禁用
            }

            // 检测是否是重复的的订单，如果没支付，继续推进支付
            const repeat = await ctx.service.placeOrder.CheckRepeatReservation({UserId, CourseScheduleId})
            if (repeat && repeat.length) {
                const [{State, Id: ReservationId}] = repeat
                if (parseInt(State, 10) !== 0) {
                    ctx.body = this.reportbody('您今天已经预约过这节课了')
                    return false // 判断会员是否重复预约
                }
                const OrderInfo = await ctx.service.memberReservationExpand.getResrvationInfoById(ReservationId);

                const { orderId: OrderId, orderNo: OrderNo } = OrderInfo
                ctx.body = this.idempotent('继续支付', { OrderId, OrderNo, ReservationId })
                return
            }

            const CourseSchedule = await this.OrderCheck({ CourseScheduleId, StartTime, EndTime, Seating })

            if (!CourseSchedule) {
                ctx.body = this.reportbody('您预约的时段或者位置已被预约过了~')
                return false // 判断会员是否被禁用
            }

            const { CourseName, StoreId, StoreName, Price, StoredValuePrice, MemberPrice } = CourseSchedule
            const reservation = { CourseScheduleId, Mobile, UserId, StoreId, StoreName, CourseName, StartTime, EndTime }
            
            reservation.Seat = Seating
            reservation.Id = ReservationId
            reservation.Code = uuid.v1().split('-').join('') // todo
            reservation.State = 0 // 先占用预约时间段 支付成功后update为1

            await ctx.service.memberReservation.create({...reservation, CreateTime, CreatePerson})

            // 计算实收金额 , 这里先用前端传过来的, 以后要写一个通用方法去计算

            const ordermain = { StoreId, TotalAmount, CreateTime, CreatePerson, UserId, Name: `预约订单` }
            
            ordermain.Id = OrderId
            ordermain.Code = OrderCode
            ordermain.Type = 4 // 表示预约订单
            ordermain.Source = 1 // 订单来源小程序
            ordermain.State = 0 // 订单状态等待支付中
            await ctx.service.orderMain.create(ordermain)

            const ordersub = { OrderId, ReservationId, StoreId, Price, StoredValuePrice, MemberPrice, }

            ordersub.Id = OrderSubId
            ordersub.Count = 1
            ordersub.ProductName = CourseName
            ordersub.ProductState = 1 // 产品状态为正常
            ordersub.ProductType = 4 // 产品类型为课程
            if (!(parseInt(ordersub.MemberPrice, 10) >= 0)) ordersub.MemberPrice = Price
            if (!(parseInt(ordersub.StoredValuePrice, 10) >= 0)) ordersub.StoredValuePrice = Price
            
            await ctx.service.orderSub.create({...ordersub, CreateTime, CreatePerson})
           

            ctx.body = this.idempotent('已生成订单', { OrderId, OrderCode, ReservationId })
            
        } catch (error) {
            console.log(error)
            ctx.logger.error(error, '下单失败')
            ctx.body = this.reportbody('系统繁忙，请重试')
        }
    }

    /**
     * ReservationId
     * 用作用户成功预约后发送消息通知
     * @param {*} param0 
     */
    async orderMessage(){
        const { ctx } = this
        const { userid: UserId } = ctx.query 
        const { coursescheduleid:CourseScheduleId, openid } = ctx.request.body
        try {
            const scheduleInfo = await ctx.service.courseSchedule.getById(CourseScheduleId)
            // 订单完成后给用户发送预约成功通知
            const result = await ctx.service.message.orderSuccess.sendSuccessMessage({scheduleInfo,openid})
           
            ctx.body = {
                success: true,
                code: 200,
                data:result   
            }
        } catch (error) {
            console.log(error)
            ctx.logger.error(error, '消息发送失败')
        }

        try {
            
            const scheduleInfo = await ctx.service.courseSchedule.getById(CourseScheduleId)
            // 首先判断课程类型，如果为私教的话，将发送被预约消息到教练端
            const { TypeId, CoachId } = scheduleInfo
            // 获取课程父类
            const courseTypeInfo = await ctx.service.courseType.getById(TypeId)
            const { ParentId } = courseTypeInfo
            // 获取教练openid 
            const coachInfo = await ctx.service.sysUser.getById(CoachId)
            const { openid }= coachInfo
            // 获取预约详情
            const repeat = await ctx.service.placeOrder.CheckRepeatReservation({UserId, CourseScheduleId})
            const [{Id: ReservationId}] = repeat

            const reservationInfo = await ctx.service.memberReservation.getById(ReservationId)

            console.log(reservationInfo)
            console.log(scheduleInfo)
            console.log(openid)
            if ( ParentId && openid && parseInt(ParentId, 10) === 1) {   // 私教课程父类型为1
                await ctx.service.message.orderSuccess.sendReservationMessage({reservationInfo, scheduleInfo, openid})
                
            }
        } catch (error) {
            console.log(error)
            ctx.logger.error(error, '消息发送失败')
        }
    }

    /**
     * 校验能否下单
     */
    async OrderCheck({ CourseScheduleId, StartTime, EndTime, Seating }) {
        const { ctx } = this
        ctx.logger.info(`参数:CourseScheduleId: ${ CourseScheduleId }, StartTime: ${ StartTime }, EndTime: ${ EndTime }, Seating: ${ Seating }}`)
        try {
            const CourseSchedule = await ctx.service.placeOrder.CourseScheduleDetail(CourseScheduleId)

            if (!CourseSchedule || !CourseSchedule.Id) throw new Error("不存在的课程")

            const { Id, Price, MemberPrice, StoredValuePrice, ReservationLimted, State, CoachId } = CourseSchedule

            if (parseInt(State) === 2) { // 如果schedule处于占位状态则将其激活
                await ctx.service.courseSchedule.updateFieldsById({
                    State: 1,
                    Valid: 1
                }, CourseScheduleId)
            }

            if (!Id || !Price || !MemberPrice || !StoredValuePrice) throw new Error(`课程信息异常: ${JSON.stringify(CourseSchedule)}`) 

            // if (moment().add(parseInt(ReservationLimted || 0), 'minutes').isAfter(moment(StartTime))) throw new Error(`课程开始前${ReservationLimted || 0}分钟不能预约`) 
            if (moment().subtract(10, 'minutes').isAfter(moment(StartTime))) throw new Error(`课程已经开始十分钟啦, 去看看其他课程吧`) 

            const $ReservationList = await ctx.service.placeOrder.CourseScheduleReservation({ 
                CoachId,
                CourseScheduleId, 
                StartTime: moment(StartTime).format('YYYY-MM-DD HH:mm:ss'), 
                EndTime: moment(EndTime).format('YYYY-MM-DD HH:mm:ss')
            }, CourseSchedule.ParentId === "1") // 判断是否私教 如果是私教则校验时间

            if (CourseSchedule.ParentId === "1" && !$ReservationList.length ) return CourseSchedule // 如果是私教且未在时间段内查询到其他预约则true

            if (CourseSchedule.ParentId !== "1" && CourseSchedule.Limted) return $ReservationList.length < CourseSchedule.Limted && CourseSchedule// 非私教无座位预约记录小于课程限制则true
            
            if (Seating && CourseSchedule.Seating) return $ReservationList.findIndex(item => parseInt(item.Seat) === parseInt(Seating)) < 0 && CourseSchedule// 非私教有座位未查询到重复座位则true

            // 座位状态校验 => 前端已校验过了=，= 有空再做
            
            return false // 除以上三种情况预约校验均不通过
        } catch (error) {
            this.ctx.logger.error(error, 'OrderCheck 异常');
            throw new Error(error)
        }
    }

    /**
     * 计算价格、优惠相关
     */
    async calculaterOrderAmount() {
        const { ctx } = this
        // 获取表单参数
        const { userid: UserId } = ctx.query 
        const { OrderId, CouponId, ReservationId } = ctx.request.body

        try {
            const OrderInfo = await ctx.service.orderMain.getById(OrderId)
            const { Code: OrderNo, PayState, PayWay, StoreId } = OrderInfo

            const CardInfo = await ctx.service.memberExpand.getUserCardInfo({userid:UserId, type:1})
            const { CardLevel, StoreId:cardStore }= CardInfo[0]
            
            if (!OrderInfo) {
                this.reportbody('订单签名异常, 请刷新重试')
                ctx.logger.error(`method calculaterOrderAmount can't find OrderId: ${OrderId}`)
                return
            }
            
            if (parseInt(PayState, 10) === 1) { // 已支付则 update 预约
                await ctx.service.memberReservation.edit({ Id: ReservationId, State: 1 })
                ctx.body = this.reportbody('订单已支付过了，请勿重复支付')
                return false
            }

            const userinfo = await ctx.service.member.getById(UserId)
            const { Level, Valid } = userinfo

            const $query = { OrderId }
            const { dataList: sublist } = await ctx.service.orderSub.search({$query})

            const amountmap = {Price: 0, MemberPrice: 0, StoredValuePrice: 0}
            sublist.forEach(({Price, MemberPrice, StoredValuePrice}) => {
                amountmap.Price += parseInt(Price, 10)
                amountmap.MemberPrice += parseInt(MemberPrice, 10)
                amountmap.StoredValuePrice += parseInt(StoredValuePrice || Price, 10)
            });            
            
            OrderInfo.Amount = amountmap.Price
            // 会员使用会员价格
            // 注意：红卡只能在会员卡门店优惠按会员价预约，黑卡以上可以跨店下单
            if ((parseInt(Level, 10) === 1 && cardStore === StoreId) || (parseInt(Level, 10) > 1)){
                OrderInfo.Amount = amountmap.MemberPrice
            } 
            // 套餐只扣1次
            if (parseInt(PayWay, 10) === 6) OrderInfo.Amount = 1
            // 储值金使用储值金价格
            if (parseInt(PayWay, 10) === 7) OrderInfo.Amount = amountmap.StoredValuePrice
            
            const { Amount } = OrderInfo
            if (!CouponId || (CouponId && CouponId === 'null')) {
                await ctx.service.orderMain.edit(OrderInfo)
                ctx.body = this.idempotent("订单已更新价格", { OrderId, OrderNo, Amount })
                return
            }

            const $CouponInfo = await ctx.service.memberCoupon.getDetailById(CouponId)
            if (!$CouponInfo || !$CouponInfo.length) {
                ctx.body = this.reportbody('优惠卷已失效')
                return
            }
            
            const [{ CouponType, Discount, MemberCouponId, OrderId: CouponOrderId }] = $CouponInfo || [{}]
            if (CouponOrderId) {
                ctx.body = this.reportbody('优惠卷已被使用过了')
                return
            }

            await ctx.service.memberCoupon.setOrderId({ OrderId, CouponId: MemberCouponId })

            if (parseInt(CouponType, 10) === 1) OrderInfo.Amount = parseInt(OrderInfo.Amount, 10) - parseInt(Discount, 10)
            if (parseInt(CouponType, 10) === 2) OrderInfo.Amount = parseInt(OrderInfo.Amount, 10) * parseInt(Discount) / 10
      
            if (OrderInfo.Amount <= 0) OrderInfo.Amount = 0
            
            await ctx.service.orderMain.edit(OrderInfo)
            ctx.body = this.idempotent("优惠卷使用成功", { OrderId, OrderNo, Amount: OrderInfo.Amount })
        } catch (error) {
            console.log(error)
            ctx.logger.error(error)
            ctx.body = {
                success: false,
                code: 444,
                message: error.message,
            }
        }
    }

    /**
     * 取消预约
     */
    async CancelReservation () {
        const { ctx } = this
        const { ReservationId, Remark } = ctx.request.body
        try {
            const $OrderInfo = await ctx.service.order.getOrderByReservationId(ReservationId)   // 先取到该订单信息, order_main.*  、 courseScheduleId

            if (!$OrderInfo || !$OrderInfo.length) throw new Error('未查询到此预约订单')

            const OrderInfo = $OrderInfo[0]

            const { State: OrderState, UserId, CourseScheduleId } = OrderInfo     
            
            const CourseSchedule = await ctx.service.placeOrder.CourseScheduleDetail(CourseScheduleId)    // 查询到课程信息

            if (!CourseSchedule || !CourseSchedule.Id) throw new Error("不存在的课程")

            const { CancelLimted, StartTime, EndTime, ParentId } = CourseSchedule

            if (moment().isAfter(moment(EndTime))) throw new Error(`已结束的课程不可取消预约`) 

            const timeformat = parseInt(CancelLimted) >= 60 ? `前${parseInt(CancelLimted / 60)}小时` : parseInt(CancelLimted) > 0 ? `前${CancelLimted}分钟` : ''

            if (moment().add(parseInt(CancelLimted || 0), 'minutes').isAfter(moment(StartTime))) throw new Error(`课程开始${timeformat}不可取消预约`) 

            const order_update = await ctx.service.orderMain.edit(Object.assign(OrderInfo, {
                State: 2,
                Remark
            }))

            const scheduleid = parseInt(ParentId) === 1 || parseInt(ParentId) === 2 ? CourseScheduleId : null

            const result = await ctx.service.memberReservation.removeById(ReservationId, scheduleid)
            // 检查用户当月是否可返回款项
            const cancel_list = await ctx.service.memberReservation.checkCancelTime(UserId)
            // 是否应把款项返还在赠送额度中?
            const refund_result = (cancel_list.length <= 2 && parseInt(OrderInfo.Amount, 10) >= 0) ? await this.drawback(OrderInfo) : null

            const message = parseInt(OrderState) === 0 ? '已取消一笔未支付的预约' : refund_result ? refund_result.message : '取消成功'

            ctx.body = {
                success: true,
                code: 200,
                message
            }
        } catch (error) {
            console.error(error)
            ctx.logger.error(error)
            ctx.body = {
                success: false,
                code: 500,
                message: error.message || error
            }
        }
    }

    /**
     * 退款
     */
    async drawback(OrderInfo) {
        const { ctx } = this
        const CreateTime = new Date()
        const CreatePerson = '68d6d79d-355e-4ff6-9d58-9fa7ecaf8694' // todo
        const { PayWay, Id: OrderId, Code: OrderNo, Remark: Reason } = OrderInfo

        let message = null
        let _Amount = null
        const $payway = parseInt(PayWay)
        const RefundCode = `Re_${OrderNo}`

        const PayCardInfo = await ctx.service.order.PayCardInfoByOrderId(OrderId)

        if (!PayCardInfo && ($payway === 6 || $payway === 7)) throw new Error("支付卡获取失败，请刷新重试")

        const { Id: CardId, PayAmount: Amount, Type: CardType } = PayCardInfo || {}
        // 创建退款记录
        const refundInfo = await ctx.service.orderRefund.create({
            Id: uuid.v1(),
            OrderId,
            RefundCode,
            Reason,
            ApplicationDate: CreateTime,
            ProcessingDate: CreateTime,
            State: 0, // 退款中
            CreateTime,
            CreatePerson
        })
        
        switch ($payway) {
            case 1: // 微信退款
                const wechat_result = await WechatPayment.refundOrder({
                    notify_url: 'http://mp.ngrok.xiaomiqiu.cn/receive/wxRefund', //回调地址
                    out_refund_no: RefundCode, //退款单号
                    out_trade_no: OrderNo, //订单编号
                    total_fee: 1, //订单总金额（单位：分）
                    refund_fee: 1, //退款金额（单位：分）
                });
                // 处理表单提交后的事件，此处返回表单提交的内容
                _Amount = parseInt(wechat_result.refund_fee) / 100
                this.ctx.logger.info('pay result : ',wechat_result)
                if (_Amount && _Amount > 0 ){
                    message = `微信已退款${_Amount}元`
                }  else {
                    message =`取消成功`
                }
                
                break;
            case 6: // 套餐退款
                await ctx.service.order.cutCardBlance({
                    CardId, Amount
                }, false, true)

                await ctx.service.cardHistory.create(Object.assign(PayCardInfo, {
                    Id: uuid.v4(),
                    CardId,
                    OperationType: 8,
                    OperationRemark: `返还${Amount}`,
                    OperationState: 1,
                    CardType,
                    OrderId,
                    CreateTime,
                    CreatePerson
                }))

                _Amount = Amount

                message = `已返还${Amount}次`

                break;
            case 7: // 储值金退款

                await ctx.service.order.cutCardBlance({
                    CardId, Amount
                }, false, true)

                const storedvalue = { ...PayCardInfo, CardId, CardType, OrderId, CreateTime, CreatePerson }
                storedvalue.Id = uuid.v4()
                storedvalue.OperationType = 8
                storedvalue.OperationRemark = `返还${Amount}`
                storedvalue.OperationState = 1
                
                await ctx.service.cardHistory.create(storedvalue)

                _Amount = Amount

                message = `已返还${Amount}元`

                break;
            default:
                message = '退款方式暂不支持，请线下交易'
                break;
        }
        await ctx.service.orderRefund.edit(Object.assign(refundInfo, {
            State: 1,
            Amount: _Amount ? _Amount : 0,
            UpdateTime: new Date()
        }))
        return {
            Amount: _Amount ? _Amount : 0,
            message
        }
    }

}


module.exports = PlaceOrder;